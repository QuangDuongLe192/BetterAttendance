# API Design Plan — fe-manager + fe-staff

## Context

Thiết kế REST API cho **hai client**:
- **`fe-manager`** — web app, Lark sidebar, dành cho manager/admin/finance
- **`fe-staff`** — mobile app, dành cho staff

Cùng một backend, một base URL `/api`. Tất cả timestamp dùng **UTC milliseconds**. User được identify qua `larkUserId`. Phân quyền gồm 3 system role: `ADMIN`, `MANAGER`, `FINANCE`.

> Endpoint dùng chung giữa hai app được đánh dấu **[shared]**.

---

## Base URL

```
/api
```

---

## Conventions

| Convention | Rule |
|---|---|
| Timestamps | UTC milliseconds (`number`) — VN là UTC+7, FE tự convert |
| IDs | string opaque — không assume format |
| Paging (list) | `page` (1-based) + `pageSize`; response trả `total`, `page`, `pageSize` |
| Paging (feed/infinite) | `cursor` (opaque token) + `limit`; response trả `nextCursor: string \| null` |
| Filter nhiều giá trị | Lặp param: `?locationId=L1&locationId=L2` |
| "Tất cả location" | `?locationId=all` — backend giải thành `managedLocationIds` của token |
| Soft delete | `DELETE` trả `204`; resource vẫn tồn tại với `status: Inactive` |
| Error | `{ error: string, code: string }` với HTTP 4xx/5xx |
| Idempotency | Clock-in/out dùng `idempotencyKey` (UUID v4) để chặn duplicate tap |

---

## Authorization

### JWT Structure

Mỗi JWT gồm 3 phần: `base64url(header).base64url(payload).signature`

**Header:**
```json
{ "alg": "HS256", "typ": "JWT" }
```

**Payload:**
```json
{
  "larkUserId": "ou_xxx",
  "orgRoles": ["MANAGER"],
  "managedLocationIds": ["L1", "L2"],
  "exp": 1749693600,
  "iat": 1749686400
}
```

| Field | Nguồn | Ghi chú |
|---|---|---|
| `larkUserId` | Lark `open_id` | Format `ou_xxx` — app-specific, luôn có |
| `orgRoles` | DB | Gán bởi admin; ADMIN auto-provision từ Lark custom attribute |
| `managedLocationIds` | DB | Chỉ có ý nghĩa với MANAGER; ADMIN/FINANCE = `[]` |
| `exp` | `now + 7200` | **Unix seconds** — khác convention UTC ms của phần còn lại |
| `iat` | `now` | **Unix seconds** |

**Signature:** `HMAC-SHA256(base64url(header) + "." + base64url(payload), JWT_SECRET)`

> **Không có refresh token.** Lark SDK (`window.tt.requestAuthCode`) đóng vai trò session manager — mỗi lần mở app trong Lark sẽ tự cấp code mới, re-auth trong 1 bước mà user không thấy màn hình login.

---

### Login flows

#### Flow A — Admin

```
1. FE : window.tt.requestAuthCode(appId) → code (TTL ~5 phút, single-use)
2. FE : POST /auth/lark { code }
3. BE : Exchange code với Lark → lark_access_token + expires_in
         POST https://open.larksuite.com/open-apis/authen/v2/oauth/token
4. BE : Lấy user info từ Lark
         GET  https://open.larksuite.com/open-apis/authen/v1/user_info
         → { open_id, name, avatar_url, mobile }
5. BE : Check Lark App custom attribute → xác nhận là ADMIN
6. BE : Upsert DB: tạo/cập nhật record với role ADMIN
7. BE : Lookup DB → { orgRoles, managedLocationIds }
8. BE : Sign JWT → { larkUserId, orgRoles, managedLocationIds, exp, iat }
9. BE : Trả { token, expiresAt, user }
```

#### Flow B — Staff / Manager

```
1. FE : window.tt.requestAuthCode(appId) → code
2. FE : POST /auth/lark { code }
3. BE : Exchange code với Lark → lark_access_token
4. BE : Lấy user info từ Lark → { open_id, name, avatar_url, mobile }
5. BE : Lookup DB theo open_id
         → Không có → 401 USER_NOT_REGISTERED
6. BE : Sign JWT → { larkUserId, orgRoles, managedLocationIds, exp, iat }
7. BE : Trả { token, expiresAt, user }
```

> Staff/Manager phải được admin thêm vào hệ thống qua `POST /staff` trước khi login được.

---

### Token validation middleware

Áp dụng cho **mọi request** trừ `POST /auth/lark`:

```
1. Lấy header: Authorization: Bearer <token>
   → Thiếu header → 401 TOKEN_MISSING

2. Verify JWT signature + expiry
   → Sai signature → 401 TOKEN_INVALID
   → Hết hạn     → 401 TOKEN_EXPIRED

3. Extract payload: { larkUserId, orgRoles, managedLocationIds }
   → Inject vào request context để các guard phía sau dùng

4. Role guard (per endpoint)
   → orgRole không đủ → 403 INSUFFICIENT_ROLE

5. Location scope guard (MANAGER only)
   → locationId param/body nằm ngoài managedLocationIds → 403 LOCATION_ACCESS_DENIED

6. Resource ownership guard (STAFF only)
   → Truy cập shift/request không thuộc về mình → 403 SHIFT_NOT_ASSIGNED
```

---

### Per-endpoint authorization

> **Legend:** ✅ được phép | ❌ bị chặn | ✅* có điều kiện (xem ghi chú)

#### Auth & Workspace

| Endpoint | ADMIN | MANAGER | FINANCE | STAFF | Ghi chú |
|---|---|---|---|---|---|
| `POST /auth/lark` | ✅ | ✅ | ✅ | ✅ | Public — không cần token |
| `GET /auth/me` | ✅ | ✅ | ✅ | ✅ | Mọi authenticated user |
| `GET /workspace/stats` | ✅ | ❌ | ❌ | ❌ | — |

#### Location

| Endpoint | ADMIN | MANAGER | FINANCE | STAFF | Ghi chú |
|---|---|---|---|---|---|
| `POST /locations` | ✅ | ❌ | ❌ | ❌ | — |
| `GET /locations` | ✅ | ✅* | ✅* | ❌ | MANAGER/FINANCE chỉ nhận locations trong `managedLocationIds` |
| `GET /locations/{id}` | ✅ | ✅* | ✅* | ❌ | MANAGER/FINANCE: chỉ location trong scope |
| `PATCH /locations/{id}` | ✅ | ❌ | ❌ | ❌ | — |
| `DELETE /locations/{id}` | ✅ | ❌ | ❌ | ❌ | — |
| `PATCH /locations/{id}/delegation` | ✅ | ❌ | ❌ | ❌ | — |

#### Shift

| Endpoint | ADMIN | MANAGER | FINANCE | STAFF | Ghi chú |
|---|---|---|---|---|---|
| `POST /shifts` | ✅ | ✅* | ❌ | ❌ | MANAGER: chỉ locationId trong scope |
| `GET /shifts` | ✅ | ✅* | ✅* | ✅* | MANAGER/FINANCE: scoped by location; STAFF: chỉ `userId=me` |
| `GET /shifts/{id}` | ✅ | ✅* | ✅* | ✅* | STAFF: chỉ shift của mình; MANAGER: shift thuộc location của mình |
| `PATCH /shifts/{id}` | ✅ | ✅* | ❌ | ❌ | MANAGER: chỉ shift thuộc location của mình |
| `DELETE /shifts/{id}` | ✅ | ✅* | ❌ | ❌ | MANAGER: chỉ shift thuộc location của mình |
| `GET /shifts/export` | ✅ | ✅* | ✅* | ❌ | Scoped by location |
| `GET /staff/{userId}/strip` | ✅ | ✅* | ✅* | ❌ | MANAGER: userId phải thuộc location của mình |

#### Staff & Roles

| Endpoint | ADMIN | MANAGER | FINANCE | STAFF | Ghi chú |
|---|---|---|---|---|---|
| `POST /staff` | ✅ | ❌ | ❌ | ❌ | — |
| `GET /staff` | ✅ | ✅* | ✅* | ❌ | MANAGER/FINANCE: scoped by location |
| `GET /staff/{userId}` | ✅ | ✅* | ✅* | ❌ | MANAGER: userId thuộc location của mình |
| `PATCH /staff/{userId}` | ✅ | ❌ | ❌ | ❌ | — |
| `GET /staff/{userId}/roles` | ✅ | ❌ | ❌ | ❌ | — |
| `POST /staff/{userId}/roles` | ✅ | ❌ | ❌ | ❌ | — |
| `DELETE /staff/{userId}/roles/{orgRole}` | ✅ | ❌ | ❌ | ❌ | — |

#### Manager Operations

| Endpoint | ADMIN | MANAGER | FINANCE | STAFF | Ghi chú |
|---|---|---|---|---|---|
| `GET /audit-log` | ✅ | ✅* | ✅* | ❌ | Scoped by location |
| `GET /approvals` | ✅ | ✅* | ❌ | ❌ | MANAGER: scoped by location |
| `GET /approvals/{id}` | ✅ | ✅* | ❌ | ❌ | MANAGER: approval thuộc location của mình |
| `POST /approvals/{id}/approve` | ✅ | ✅* | ❌ | ❌ | MANAGER: approval thuộc location của mình |
| `POST /approvals/{id}/reject` | ✅ | ✅* | ❌ | ❌ | MANAGER: approval thuộc location của mình |
| `POST /announcements` | ✅ | ✅* | ❌ | ❌ | MANAGER: chỉ scope location của mình |
| `GET /announcements` | ✅ | ✅* | ❌ | ❌ | MANAGER: scoped by location |

#### Setup

| Endpoint | ADMIN | MANAGER | FINANCE | STAFF | Ghi chú |
|---|---|---|---|---|---|
| `GET /setup/roles` | ✅ | ✅ | ❌ | ❌ | MANAGER cần để xem role picker |
| `POST /setup/roles` | ✅ | ❌ | ❌ | ❌ | — |
| `PATCH /setup/roles/{id}` | ✅ | ❌ | ❌ | ❌ | — |
| `DELETE /setup/roles/{id}` | ✅ | ❌ | ❌ | ❌ | — |
| `GET /setup/shift-templates` | ✅ | ✅ | ❌ | ❌ | MANAGER cần để tạo ca |
| `POST/PATCH/DELETE /setup/shift-templates` | ✅ | ❌ | ❌ | ❌ | — |

#### Notifications (shared)

| Endpoint | ADMIN | MANAGER | FINANCE | STAFF | Ghi chú |
|---|---|---|---|---|---|
| `GET /notifications` | ✅ | ✅ | ✅ | ✅ | Mỗi user chỉ thấy notification của mình |
| `PATCH /notifications/{id}/read` | ✅ | ✅ | ✅ | ✅ | Chỉ notification của mình |
| `PATCH /notifications/read-all` | ✅ | ✅ | ✅ | ✅ | Chỉ notification của mình |

#### Staff Mobile — Attendance & Requests

| Endpoint | ADMIN | MANAGER | FINANCE | STAFF | Ghi chú |
|---|---|---|---|---|---|
| `POST /attendance/clock-in` | ❌ | ❌ | ❌ | ✅ | — |
| `POST /attendance/clock-out` | ❌ | ❌ | ❌ | ✅ | — |
| `GET /attendance/earnings` | ❌ | ❌ | ❌ | ✅ | — |
| `GET /earnings/detail` | ❌ | ❌ | ❌ | ✅ | — |
| `GET /requests` | ❌ | ❌ | ❌ | ✅ | Chỉ request của mình |
| `GET /requests/{id}` | ❌ | ❌ | ❌ | ✅ | Chỉ request của mình |
| `POST /requests` | ❌ | ❌ | ❌ | ✅ | — |
| `GET /salary` | ❌ | ❌ | ✅* | ✅ | FINANCE xem tất cả; STAFF chỉ xem của mình |
| `GET /salary/{id}` | ❌ | ❌ | ✅* | ✅ | FINANCE xem tất cả; STAFF chỉ xem của mình |

---

### Location scope — MANAGER

MANAGER chỉ được thao tác trên data thuộc `managedLocationIds` trong JWT. Backend enforce tại mọi endpoint có `locationId`:

```
// Pseudo-code — guard chạy sau token validation
if (user.orgRoles.includes('MANAGER') && !user.orgRoles.includes('ADMIN')) {
  const requestedLocationIds = extractLocationIds(req) // từ params, body, resource
  const unauthorized = requestedLocationIds.filter(
    id => !user.managedLocationIds.includes(id)
  )
  if (unauthorized.length > 0) {
    return 403 LOCATION_ACCESS_DENIED
  }
}
```

---

### Delegated MANAGER

Nếu location có `delegation.enabled = true`, manager được gán thêm quyền cụ thể. Backend cần check thêm sau location scope guard:

| `delegation` flag | Quyền bổ sung |
|---|---|
| `canAssignRoles: true` | Được gán existing role cho staff (không tạo role mới) |
| `canEditAttendance: true` | Được `PATCH /shifts/{id}` để sửa `actualInTime`/`actualOutTime` |
| `canApproveOT: false` | Không được approve overtime approvals |

> Delegated manager **không bao giờ** được: tạo/xóa role, thay đổi pay rate, xem finance data.

---

## 1. Auth

### POST /auth/lark
**Used in:** `Login.tsx` (fe-manager) + `LoginPage.tsx` (fe-staff) **[shared]** — exchange Lark auth code lấy JWT

**Flow:** Xem [Login flows](#login-flows) — Flow A (Admin) hoặc Flow B (Staff/Manager) tùy user.

**Request body:**
```json
{ "code": "lark_oauth_code_xxx" }
```

**Response 200:**
```json
{
  "token": "eyJhbGci...",
  "expiresAt": 1749686400000,
  "user": {
    "larkUserId": "ou_xxx",
    "name": "Nguyễn Văn A",
    "avatarUrl": "https://p1.larkuite.com/...",
    "phone": "0901234567",
    "org": "Candylio",
    "title": "Quản lý cửa hàng",
    "orgRoles": ["MANAGER"],
    "managedLocationIds": ["L1", "L2"]
  }
}
```

**Notes:**
- `token` lưu vào `localStorage["auth"]` → `{ accessToken, expiresAt, role }`
- `user` dùng để hydrate `AuthContext` ngay — không cần gọi `/auth/me` riêng sau login
- Staff app chỉ dùng `name`, `avatarUrl`, `phone`; `orgRoles` và `managedLocationIds` luôn có trong response
- **App bootstrap:** FE check `expiresAt` local trước — nếu `Date.now() > expiresAt` thì `clearAuth()` + redirect `/login` ngay, không gọi API

---

### GET /auth/me
**Used in:** `AuthContext` (fe-manager) + app bootstrap (fe-staff) **[shared]** — refresh user state sau reload

**Request:** Bearer token in header

**Response 200:**
```json
{
  "larkUserId": "ou_xxx",
  "name": "Nguyễn Văn A",
  "avatarUrl": "https://...",
  "phone": "0901234567",
  "org": "Candylio",
  "title": "Quản lý cửa hàng",
  "orgRoles": ["MANAGER"],
  "managedLocationIds": ["L1", "L2"]
}
```

**Notes:**
- `TopBar.tsx` dùng `user.name`, `user.avatarUrl`, `user.org`, `user.title`
- `MgrHome.tsx` dùng `user.name.split(' ').pop()` cho greeting
- `Router.tsx` dùng `user.orgRoles` để guard routes
- Staff app dùng `name` cho greeting "Xin chào, [Tên]"; nếu `401` → clear token, redirect `/login`
- **Bootstrap optimization:** FE check `localStorage["auth"].expiresAt` trước khi gọi — hết hạn thì redirect ngay không cần round-trip
- Field avatar: dùng thống nhất tên `avatarUrl` (không phải `avatar`) trên toàn bộ response
- `languagePreference`: nếu cần hỗ trợ ngôn ngữ per-user, thêm field này vào response của `GET /auth/me` thay vì tạo endpoint `/profile/me` riêng

> **Logout:** Không có API — client clear token local. Nếu cần server-side invalidation: `DELETE /auth/session`

---

## 2. Workspace Stats

### GET /workspace/stats
**Used in:** `Landing.tsx` — setup completion dashboard (admin only)

**Response 200:**
```json
{
  "locations": { "total": 5, "active": 4 },
  "roles": { "total": 6},
  "staff": { "total": 12, "managers": 3 },
  "setupCompletion": { "done": 3, "total": 4 }
}
```

**Notes:** Map với `SetupStats` type trong `services/Metadata/metadata.ts`

---

## 3. Location

### POST /locations
**Used in:** Setup > Location list — "Thêm cửa hàng" button

**Request body:**
```json
{
  "name": "Chi nhánh Quận 1",
  "address": "123 Lê Lợi, Q1, TP.HCM",
  "lat": 10.7769,
  "long": 106.7009,
  "validationConfig": {
    "radiusMeters": 100,
    "allowed_bssid": ["AA:BB:CC:DD:EE:FF"],
    "required_accuracy": 20
  },
  "activeValidation": ["geo", "wifi"],
  "style": { "color": "#00B4A0" },
  "autoIn": true,
  "autoOut": false
}
```

**Response 201:** `LocationEntity` (xem shape bên dưới)

---

### GET /locations
**Used in:**
- `ManagerApp.tsx` — location selector dropdown top bar
- `MgrAnnounce.tsx` — scope picker khi soạn thông báo
- `Login.tsx` — hiển thị danh sách location khi chọn demo user

**Query params:**
| Param | Type | Mô tả |
|---|---|---|
| `userId` | string | Optional — lọc theo `managedLocationIds` của user |

**Response 200:**
```json
{
  "items": [
    {
      "locationId": "L1",
      "name": "Chi nhánh Quận 1",
      "address": "123 Lê Lợi, Q1",
      "lat": 10.7769,
      "long": 106.7009,
      "validationConfig": {
        "radiusMeters": 100,
        "allowed_bssid": ["AA:BB:CC:DD:EE:FF"],
        "required_accuracy": 20
      },
      "activeValidation": ["geo", "wifi"],
      "style": { "color": "#00B4A0" },
      "status": "Active",
      "delegation": {
        "enabled": true,
        "canAssignRoles": false,
        "canEditAttendance": true,
        "canApproveOT": false
      },
      "staffCount": 8,
      "autoIn": true,
      "autoOut": false
    }
  ]
}
```

**Notes:** Backend filter: MANAGER chỉ nhận location trong `managedLocationIds` của token dù `userId` là ai.

---

### GET /locations/{id}
**Used in:** Setup > Location detail/edit drawer

**Path param:** `id` — locationId

**Response 200:** `LocationEntity` (full shape như trên)

---
 
### PATCH /locations/{id}
**Used in:**
- Setup > Location edit form (name, address, coords, validation)
- Soft delete: gửi `{ "status": "Inactive" }` thay vì DELETE

**Request body** (partial, bất kỳ field nào):
```json
{
  "name": "Chi nhánh Q1 (mới)",
  "validationConfig": { "radiusMeters": 150 },
  "activeValidation": ["geo"],
  "status": "Inactive",
  "autoIn": false
}
```

**Response 200:** `LocationEntity` updated

---

### DELETE /locations/{id}
**Used in:** Setup > Location list — nút xóa

**Response 204** — soft delete (set `status: Inactive`). Không hard delete vì shifts/staff reference `locationId`.

---

### PATCH /locations/{id}/delegation
**Used in:** Setup > Location > Delegation settings tab

**Request body:**
```json
{
  "enabled": true,
  "canAssignRoles": false,
  "canEditAttendance": true,
  "canApproveOT": false
}
```

**Response 200:**
```json
{
  "locationId": "L1",
  "delegation": {
    "enabled": true,
    "canAssignRoles": false,
    "canEditAttendance": true,
    "canApproveOT": false
  }
}
```

---

## 4. Shift

> **Shape `ShiftEntity`** dùng xuyên suốt cho cả manager lẫn staff:
> ```typescript
> {
>   shiftId: string 
>   larkUserId: string
>   locationId: string
>   locationName: string
>   roleName: string           // thêm để staff hiển thị không cần lookup
>   scheduleInTime: number     // UTC ms
>   scheduleOutTime: number    // UTC ms
>   scheduleTotal: number      // ms duration
>   actualInTime: number | null
>   actualOutTime: number | null
>   shiftLabel: string
>   tag: string
>   status: 'in' | 'late' | 'absent' | 'upcoming' | 'overtime' | 'completed'
>   lateBy?: number            // minutes
>   // Staff mobile fields (optional — chỉ trả khi fe-staff gọi)
>   validationMode?: 'none' | 'geo' | 'wifi' | 'geo+wifi'
>   geofence?: { lat: number; lng: number; radiusMeters: number } | null
>   breakWindow?: string       // "12:00 – 13:00"
>   managerName?: string
> }
> ```

### POST /shifts
**Used in:** Roster > modal thêm ca

**Request body:**
```json
{
  "larkUserId": "ou_xxx",
  "locationId": "L1",
  "roleId": "R2",
  "scheduleInTime": 1749596400000,
  "scheduleOutTime": 1749625200000,
  "shiftLabel": "Ca sáng",
  "tag": "morning"
}
```

**Response 201:** `ShiftEntity`

---

### GET /shifts
**Used in:**
- `TodayTimeline.tsx` — today's timeline grouped by staff (fe-manager)
- `WeekGrid.tsx` / `MonthRow.tsx` — roster tuần/tháng (fe-manager)
- `MgrHome.tsx` — source data để tính KPI (fe-manager)
- TodayPage / CalendarPage — ca của staff hôm nay / tuần này **[shared with fe-staff]**

**Query params:**
| Param | Type | Mô tả |
|---|---|---|
| `from` | UTC ms | Bắt đầu window |
| `to` | UTC ms | Kết thúc window |
| `locationId` | string (lặp) | Lọc location; `all` = toàn bộ managedLocations |
| `userId` | string | larkUserId — xem ca của 1 người (staff dùng `userId=me`) |
| `status` | string | Optional: `upcoming\|in\|late\|absent\|overtime\|completed` |

**Ví dụ — Today timeline (manager):**
```
GET /shifts?from=1749571200000&to=1749657600000&locationId=L1
```

**Ví dụ — Week roster (manager):**
```
GET /shifts?from=1749484800000&to=1750089600000&locationId=L1&locationId=L2
```

**Ví dụ — Ca hôm nay của staff (thay thế `/attendance/today`):**
```
GET /shifts?userId=me&from=<today-start-UTC>&to=<today-end-UTC>
```

**Ví dụ — Lịch tuần của staff (thay thế `/attendance/weekly`):**
```
GET /shifts?userId=me&from=<week-start-UTC>&to=<week-end-UTC>
```

**Response 200:**
```json
{
  "items": [
    {
      "shiftId": "J001", //shiftId
      "larkUserId": "ou_abc",
      "locationId": "L1",
      "locationName": "Chi nhánh Q1",
      "roleName": "Barista",
      "scheduleInTime": 1749596400000,
      "scheduleOutTime": 1749625200000,
      "scheduleTotal": 28800000,
      "actualInTime": 1749597240000,
      "actualOutTime": null,
      "shiftLabel": "Ca sáng",
      "tag": "morning",
      "status": "late",
      "lateBy": 14,
      "expectedPayVnd": 432000, // hoặc null nếu nhân viên monthly
      "address": "16 Lê Quý Đôn",
      // Staff mobile optional fields
      "validationMode": "geo",
      "geofence": { "lat": 10.7302, "lng": 106.7224, "radiusMeters": 50 },
      "breakWindow": "12:00 – 13:00",
      "managerName": "Nguyễn Văn Manager"
    }
  ]
}
```

**Notes:**
- `TodayTimeline` dùng `minutesFromVN(scheduleInTime)` convert sang phút local để vẽ bar
- FE tự tính KPI: `scheduled = items.length`, `late = items.filter(s => s.status === 'late').length`, v.v.
- Staff dùng `actualInTime != null && actualOutTime == null` → tự resume trạng thái "đang làm việc"
- Không mix `locationId` và `userId` trong cùng 1 request

---

### GET /shifts/{id}
**Used in:** Roster > shift detail/edit (fe-manager) + ShiftDetailPage `/shifts/:shiftId` (fe-staff) **[shared]**

**Response 200:** `ShiftEntity`

---

### PATCH /shifts/{id}
**Used in:**
- Roster > edit shift modal
- Manager override clock-in/out thủ công

**Request body** (partial):
```json
{
  "scheduleInTime": 1749600000000,
  "scheduleOutTime": 1749628800000,
  "roleId": "R3",
  "actualInTime": 1749600000000,
  "actualOutTime": 1749625200000,
  "status": "completed"
}
```

**Response 200:** `ShiftEntity` updated

---

### DELETE /shifts/{id}
**Used in:** Roster > xóa ca (chỉ được xóa ca `status: upcoming`)

**Response 204**

**Lỗi:** `400 { error: "Cannot delete a shift that has already started", code: "SHIFT_ALREADY_STARTED" }`

---

### GET /staff/{userId}/strip
**Used in:** Staff detail > monthly stats strip

**Path param:** `userId` — larkUserId

**Query params:**
| Param | Type | Mô tả |
|---|---|---|
| `month` | `YYYY-MM` | Tháng cần xem |

**Response 200:**
```json
{
  "larkUserId": "ou_xxx",
  "month": "2025-06",
  "schedDays": 22,
  "workedDays": 20,
  "onTime": 18,
  "late": 2,
  "absent": 2,
  "otH": 4.5,
  "schedH": 176,
  "actualH": 168.5,
  "strip": [
    ["on-time", "late", "absent", "off", "off", "on-time", "on-time"],
    ["on-time", "on-time", "on-time", "late", "off", "on-time", "on-time"]
  ]
}
```

**Notes:** Map với `MonthStaff` type trong `services/Manager/mgr.ts`. `strip` là calendar grid 4–5 tuần × 7 ngày, mỗi cell là `DayStatus`.

---

### GET /shifts/export
**Used in:** Roster > nút Export CSV

**Query params:** Giống `GET /shifts` (from, to, locationId)

**Response 200:** `text/csv` — file attachment

---

## 5. Staff

### POST /staff
**Used in:** Setup > Staff > "Thêm nhân viên" — tìm trên Lark rồi thêm vào hệ thống

**Request body:**
```json
{
  "larkUserId": "ou_new",
  "payType": "hourly",
  "rate": 35000,
  "locationIds": ["L1", "L2"],
  "roleIds": ["R1"],
  "floater": false
}
```

**Notes:** `name`, `avatar`, `phone` không cần truyền — backend lấy từ Lark API qua `larkUserId`

**Response 201:** `StaffEntity` (full shape bên dưới)

---

### GET /staff
**Used in:**
- Setup > Staff list
- Roster > staff picker dropdown
- `Login.tsx` demo — danh sách nhân viên để chọn đăng nhập thử

**Query params:**
| Param | Type | Mô tả |
|---|---|---|
| `page` | number | 1-based |
| `pageSize` | number | Default 20 |
| `locationId` | string | Optional — `all` hoặc cụ thể |

**Response 200:**
```json
{
  "items": [
    {
      "larkUserId": "ou_abc",
      "name": "Nguyễn Thị B",
      "avatar": "https://...",
      "phone": "0912345678",
      "payType": "hourly",
      "rate": 35000,
      "monthly": null,
      "locationIds": ["L1", "L2"],
      "floater": false,
      "managedLocs": [],
      "roleIds": ["R1", "R3"]
    }
  ],
  "total": 47,
  "page": 1,
  "pageSize": 20
}
```

---

### GET /staff/{userId}
**Used in:** Staff detail drawer (click vào tên nhân viên)

**Response 200:** `StaffEntity` full

---

### PATCH /staff/{userId}
**Used in:** Staff detail > edit form

**Request body** (partial):
```json
{
  "payType": "monthly",
  "monthly": 8000000,
  "locationIds": ["L1"],
  "roleIds": ["R2"],
  "floater": true
}
```

**Response 200:** `StaffEntity` updated

**Notes:** Không cho phép sửa `name`, `avatar`, `phone` — đây là Lark data. Không cho phép sửa `orgRoles` / `managedLocs` — dùng `/staff/{userId}/roles`.

---

## 6. StaffRole (System/Org Roles)

> Tách riêng khỏi `PATCH /staff` để phân quyền rõ ràng — chỉ ADMIN được gọi.

### GET /staff/{userId}/roles
**Used in:** Staff detail > Roles & Permissions tab

**Response 200:**
```json
{
  "larkUserId": "ou_abc",
  "orgRoles": ["MANAGER"],
  "managedLocationIds": ["L1", "L2"]
}
```

---

### POST /staff/{userId}/roles
**Used in:** Setup > Staff > gán orgRole mới

**Request body:**
```json
{
  "orgRole": "MANAGER",
  "locationId": "L1"
}
```

**Notes:**
- `locationId` bắt buộc khi `orgRole = MANAGER`
- `ADMIN` và `FINANCE` không cần `locationId`

**Response 200:** `StaffRoleScope` updated

---

### DELETE /staff/{userId}/roles/{orgRole}
**Used in:** Setup > Staff > xóa orgRole

**Query params:**
| Param | Type | Mô tả |
|---|---|---|
| `locationId` | string | Bắt buộc khi `orgRole = MANAGER` — xóa scope cụ thể |

**Response 204**

---

## 7. AuditLog

### GET /audit-log
**Used in — 2 context khác nhau:**

**Context A — Activity feed widget** (`MgrHome.tsx` → side panel "Hoạt động hôm nay"):
```
GET /audit-log?locationId=L1&limit=5&offset=0
```
- Dùng `limit + offset` để infinite scroll / prev-next pagination
- Không cần `from/to` — server trả mới nhất trước (`ORDER BY t DESC`)

**Context B — Audit log history drawer** (`AuditLogDrawer.tsx` — mở từ nút "Lịch sử"):
```
GET /audit-log?from=1749571200000&to=1749657600000&locationId=L1&type=att&page=1&pageSize=50
```
- Dùng `page + pageSize` với `from/to` range

**Query params:**
| Param | Type | Mô tả |
|---|---|---|
| `from` | UTC ms | Optional — không dùng khi dùng `limit/offset` |
| `to` | UTC ms | Optional |
| `locationId` | string (lặp) | Optional |
| `type` | string | Optional: `att\|request\|approval\|loc\|role\|rate\|geo\|wifi` |
| `limit` | number | Feed mode |
| `offset` | number | Feed mode |
| `page` | number | History mode |
| `pageSize` | number | History mode |

**Response 200 — Feed mode** (`limit+offset`):
```json
{
  "items": [
    {
      "t": 1749600000000,
      "actor": {
        "larkUserId": "ou_abc",
        "name": "Nguyễn Thị B",
        "role": "Thu ngân"
      },
      "event": "att.late",
      "target": "Nguyễn Thị B",
      "type": "att",
      "locationId": "L1",
      "before": null,
      "after": "+14 phút"
    }
  ],
  "hasMore": true
}
```

**Response 200 — History mode** (`page+pageSize`):
```json
{
  "items": [...],
  "total": 284,
  "page": 1,
  "pageSize": 50
}
```

**Notes:**
- `MgrHome` hiển thị `entry.actor.name` (bold) + `entry.target` (mô tả)
- `fmtHHMM(entry.t)` convert UTC ms → giờ VN để hiện cột thời gian bên trái

---

## 8. Approval

### GET /approvals
**Used in — 2 context:**

**Context A — Quick preview** (`MgrHome.tsx` — widget "Hàng chờ duyệt"):
```
GET /approvals?status=pending&pageSize=4
```

**Context B — Full list** (`MgrApprovals.tsx`):
```
GET /approvals?kind=late&status=pending&locationId=L1&page=1&pageSize=20
```

**Query params:**
| Param | Type | Mô tả |
|---|---|---|
| `kind` | string | Optional: `late\|edit\|timeoff\|swap\|leave\|early` |
| `status` | string | Optional: `pending\|approved\|rejected` (default: all) |
| `locationId` | string (lặp) | Optional |
| `page` | number | 1-based |
| `pageSize` | number | |

> **Staff request approvals:** Staff tạo đơn xin phép (`POST /requests` với `type=leave/late/early`) → manager/admin duyệt qua `POST /approvals/{id}/approve` và `POST /approvals/{id}/reject` cùng với các approval loại khác. `kind=leave`, `kind=late`, `kind=early` tương ứng với staff request types.

**Response 200:**
```json
{
  "items": [
    {
      "id": "A1",
      "kind": "late",
      "larkUserId": "ou_abc",
      "staffName": "Nguyễn Thị B",
      "locationId": "L1",
      "locationName": "Chi nhánh Q1",
      "date": "2025-06-10",
      "body": "Xe bị hư, phải đợi xe ôm.",
      "original": 1749596400000,
      "proposed": 1749597240000,
      "createdAt": 1749597600000,
      "status": "pending",
      "handledBy": null,
      "handledAt": null,
      "rejectedReason": null,
      "auto": false,
      "suggest": "review"
    }
  ],
  "total": 24,
  "page": 1,
  "pageSize": 20
}
```

**Notes:**
- `MgrApprovals.tsx` filter kind/status **trên FE** từ toàn bộ list — nếu data nhỏ. Nếu lớn, pass filter xuống API.
- `auto: true` = hệ thống tự tạo approval (vd: overtime detected). `suggest: 'approve' | 'review'` = gợi ý của AI.

---

### GET /approvals/{id}
**Used in:** `ApprovalDetailDrawer` — click vào row để xem detail

**Response 200:**
```json
{
  "approval": {
    "id": "A1",
    "kind": "late",
    "larkUserId": "ou_abc",
    "staffName": "Nguyễn Thị B",
    "locationId": "L1",
    "locationName": "Chi nhánh Q1",
    "date": "2025-06-10",
    "body": "Xe bị hư, phải đợi xe ôm.",
    "original": 1749596400000,
    "proposed": 1749597240000,
    "createdAt": 1749597600000,
    "status": "pending",
    "handledBy": null,
    "handledAt": null,
    "rejectedReason": null,
    "auto": false,
    "suggest": "review"
  },
  "context": {
    "lateHistory": {
      "count": 3,
      "totalMins": 67,
      "items": ["05/05 +23 ph", "12/04 +31 ph", "28/03 +13 ph"]
    },
    "swapWith": { "name": "Phan Thanh Hằng", "confirmed": true },
    "teamOnDay": [
      { "name": "Vũ Hải Yến", "role": "Pha chế", "time": "08:00–16:00" },
      { "name": "Đặng Khánh Linh", "role": "Thu ngân", "time": "07:00–15:00" }
    ]
  }
}
```

**Notes:**
- `lateHistory` chỉ có khi `kind = late`
- `swapWith` + `teamOnDay` chỉ có khi `kind = swap`
- `context` fields null/omit khi không applicable

---

### POST /approvals/{id}/approve
**Used in:**
- `MgrApprovals.tsx` — nút "Duyệt" trong quick-approve mode
- `ApprovalDetailDrawer` — nút "✓ Duyệt yêu cầu"

**Request body:** `{}`

**Response 200:**
```json
{
  "id": "A1",
  "status": "approved",
  "handledBy": "ou_manager_xxx",
  "handledAt": 1749603600000
}
```

---

### POST /approvals/{id}/reject
**Used in:** `ApprovalDetailDrawer` — textarea lý do → nút "Xác nhận từ chối" (disabled khi chưa nhập)

**Request body:**
```json
{ "reason": "Ngày này đang thiếu người, không thể đổi ca." }
```

**Validation:** `reason` bắt buộc, không được rỗng

**Response 200:**
```json
{
  "id": "A1",
  "status": "rejected",
  "handledBy": "ou_manager_xxx",
  "handledAt": 1749603600000,
  "rejectedReason": "Ngày này đang thiếu người, không thể đổi ca."
}
```

---

## 9. Announcement

### POST /announcements
**Used in:** `MgrAnnounce.tsx` — compose form → nút "Gửi"

**Request body:**
```json
{
  "title": "Lịch nghỉ lễ 30/4",
  "body": "Cửa hàng sẽ đóng cửa ngày 30/4–1/5. Lịch ca tháng 5 sẽ được cập nhật vào 28/4.",
  "scope": "all"
}
```

**Notes:**
- `scope`: `"all"` = gửi tất cả location; hoặc danh sách location IDs dạng comma-separated: `"L1,L2"`

**Response 201:**
```json
{
  "id": "ANN001",
  "sent": 1749600000000,
  "scope": "all",
  "title": "Lịch nghỉ lễ 30/4",
  "body": "Cửa hàng sẽ đóng cửa...",
  "read": 0,
  "total": 12
}
```

---

### GET /announcements
**Used in:** `MgrAnnounce.tsx` — danh sách thông báo đã gửi + read/total stats

**Query params:**
| Param | Type | Mô tả |
|---|---|---|
| `locationId` | string | Optional — lọc thông báo gửi đến location này |

**Response 200:**
```json
{
  "items": [
    {
      "id": "ANN001",
      "sent": 1749600000000,
      "scope": "all",
      "title": "Lịch nghỉ lễ 30/4",
      "body": "Cửa hàng sẽ đóng cửa...",
      "read": 10,
      "total": 12
    }
  ]
}
```

---

## 10. Notification

> System notifications — hiển thị ở bell icon trong `TopBar.tsx` (fe-manager) và `NotificationsPage` (fe-staff). **[shared endpoint]**

**`Notification` type** — dùng chung cho cả hai app:
```typescript
{
  id: string
  type: string           // manager: 'overtime'|'late'|'absent'|'approval'|'system'
                         // staff:   'new_shift'|'request_approved'|'request_rejected'|'checkin_reminder'|'announcement'
  title: string
  body: string           // nội dung — BE trả tiếng Anh, FE tự i18n qua `type`
                         // ⚠ field name là `body` (không phải `message`)
  createdAt: number      // UTC ms — FE render thành "5 phút trước"
                         // ⚠ field name là `createdAt` (không phải `timestamp`)
  read: boolean          // ⚠ field name là `read` (không phải `isRead`)
  icon?: string          // optional — emoji hoặc icon key để FE render
  actionTarget?: string  // route navigate khi click: '/approvals/A1', '/shifts/J001'
}
```

### GET /notifications
**Used in:** `TopBar.tsx` (fe-manager) + `NotificationsPage` (fe-staff) **[shared]**

**Query params:**
| Param | Type | Mô tả |
|---|---|---|
| `unreadOnly` | boolean | Optional — filter chỉ chưa đọc (fe-manager dùng) |
| `filter` | `all\|unread` | Alias cho `unreadOnly` — fe-staff dùng; `unread` = `unreadOnly=true` |
| `cursor` | string | Optional — opaque token từ response trước; bỏ qua để lấy trang đầu |
| `limit` | number | Optional — số items/trang; fe-manager default 6, fe-staff default 20 |

**Response 200:**
```json
{
  "items": [
    {
      "id": "n1",
      "type": "overtime",
      "title": "Yêu cầu tăng ca",
      "body": "Nguyễn Văn An (Bến Thành) đề nghị tăng ca 30 phút — chờ duyệt.",
      "createdAt": 1749600000000,
      "read": false,
      "actionTarget": "/approvals/A1"
    }
  ],
  "unreadCount": 3,
  "nextCursor": "eyJpZCI6Im4xMCJ9"
}
```

**Pagination:**
1. Lần đầu: `GET /notifications` (không có `cursor`)
2. Load thêm: `GET /notifications?cursor=<nextCursor từ response>`
3. Khi `nextCursor === null` → đã hết, dừng load
4. Khi đổi filter (`unreadOnly`) → gọi lại từ đầu không có `cursor`

**Notes:**
- `unreadCount` dùng để hiển thị badge đỏ trên TopBar (manager) và TabBar icon (staff)
- fe-manager dùng `limit=6` + "Xem thêm" button; fe-staff dùng `limit=20` + infinite scroll

---

### PATCH /notifications/{id}/read
**Used in:** `TopBar.tsx` (fe-manager) + click notification (fe-staff) **[shared]**

**Request body:** `{}`

**Response 200:** `{ "id": "n1", "read": true }`

---

### PATCH /notifications/read-all
**Used in:** `TopBar.tsx` (fe-manager) + "Đánh dấu tất cả đã đọc" (fe-staff) **[shared]**

**Request body:** `{}`

**Response 200:** `{ "updated": 3 }`

> **Path alias:** fe-staff gọi endpoint này là `/notifications/mark-all-read`. Backend nên hỗ trợ cả hai path, hoặc fe-staff cần dùng `/notifications/read-all`.

---

## 11. Setup — Metadata

### GET /setup/roles
**Used in:** Setup > Roles list; Roster > role picker dropdown

**Response 200:**
```json
{
  "items": [
    {
      "id": "R1",
      "name": "Pha chế",
      "status": "Active",
      "permissions": { "canRequestEdit": true, "canRequestSwap": true },
      "snapshotUserCount": 5
    }
  ]
}
```

---

### POST /setup/roles
**Used in:** Setup > Roles > "Thêm vai trò"

**Request body:**
```json
{
  "name": "Thu ngân",
  "status": "Active",
  "permissions": { "canRequestEdit": true, "canRequestSwap": false }
}
```

**Response 201:** `RoleTemplate`

---

### PATCH /setup/roles/{id}
**Used in:** Setup > Roles > edit

**Request body:** partial `UpdateRoleDTO` (`name?`, `status?`, `permissions?`)

**Response 200:** `RoleTemplate`

---

### DELETE /setup/roles/{id}
**Used in:** Setup > Roles > xóa

**Response 204** — soft delete (`status: Inactive`)

---

### GET /setup/shift-templates
**Used in:** Roster > shift template picker

**Response 200:**
```json
{
  "items": [
    {
      "id": "T1",
      "label": "Ca sáng",
      "defaultStartTime": "07:00",
      "defaultEndTime": "15:00",
      "color": "#00B4A0"
    }
  ]
}
```

---

### POST /setup/shift-templates
### PATCH /setup/shift-templates/{id}
### DELETE /setup/shift-templates/{id}

> Tương tự CRUD roles. Shape: `ShiftTemplate` từ `services/Metadata/metadata.ts`

---

## 12. Finance / Payroll

> **Chưa làm — để sau.**

---

## 13. Staff Mobile App — Attendance, Requests, Salary

> Các endpoint dành riêng cho `fe-staff`. Auth, Shifts, Notifications đã được document ở các section trên và đánh dấu **[shared]**.
>
> **Không có `/attendance/today` hay `/attendance/weekly` riêng** — staff dùng `GET /shifts?userId=me&from=...&to=...` với `ShiftEntity` shape chuẩn.

---

### POST /attendance/clock-in
**Used in:** TodayPage — bấm nút "Clock In"

**Request body:**
```json
{
  "shiftId": "J001",
  "idempotencyKey": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response 200:**
```json
{
  "shiftId": "J001",
  "actualInTime": 1749597240000
}
```

> **Field name:** Response dùng `actualInTime` (chuẩn hóa với `ShiftEntity`) — không phải `clockInTime`.

**Notes:**
- `idempotencyKey`: FE sinh UUID v4 mới mỗi lần user bấm — BE chặn duplicate cùng `shiftId` trong time window 5 phút
- Sau clock-in thành công: FE update local shift state `actualInTime`, chuyển sang trạng thái "đang làm việc"

---

### POST /attendance/clock-out
**Used in:** TodayPage — bấm nút "Clock Out"

**Request body:**
```json
{
  "shiftId": "J001",
  "idempotencyKey": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Response 200:**
```json
{
  "shiftId": "J001",
  "actualOutTime": 1749625200000,
  "totalMinutes": 478,
  "earnedVnd": 180000
}
```

> **Field name:** Response dùng `actualOutTime` (chuẩn hóa với `ShiftEntity`) — không phải `clockOutTime`.

**Notes:**
- `earnedVnd`: FE hiển thị ngay số tiền kiếm được sau clock out thành công
- `totalMinutes`: tổng phút thực tế từ `actualInTime` → `actualOutTime`

---

### GET /attendance/earnings
**Used in:** TodayPage — earnings summary card; gọi song song khi mở page

**Query params:**
| Param | Type | Mô tả |
|---|---|---|
| `periodStart` | `YYYY-MM-DD` | FE tự tính: ngày X tháng này nếu hôm nay ≥ X; ngày X tháng trước nếu hôm nay < X |
| `month` | `YYYY-MM` | Alias tùy chọn — FE có thể truyền tháng thay vì `periodStart`; BE tự suy ra `periodStart` |

**Response 200:**
```json
{
  "grossEarningsVnd": 2800000,
  "periodStart": "2026-05-15",
  "periodEnd": "2026-06-14",
  "periodLabel": "15/05 — 14/06",
  "hours": "78h32",
  "shifts": 12,
  "payday": "2026-06-20"
}
```

**Notes:**
- Chỉ là tổng hợp để hiển thị preview card — không có breakdown chi tiết
- Kỳ lương = ngày X tháng này → ngày (X-1) tháng sau; ngày X (`PAY_PERIOD_START_DAY`) config ở FE

---

### GET /earnings/detail
**Used in:** EarningsPage — breakdown chi tiết theo role/location trong kỳ

**Query params:**
| Param | Type | Mô tả |
|---|---|---|
| `periodStart` | `YYYY-MM-DD` | Cùng logic với `/attendance/earnings` |

**Response 200:**
```json
{
  "grossEarningsVnd": 2800000,
  "periodStart": "2026-05-15",
  "periodEnd": "2026-06-14",
  "periodLabel": "15/05 — 14/06",
  "hours": "78h32",
  "shifts": 12,
  "payday": "2026-06-20",
  "breakdown": [
    {
      "label": "Barista · Crescent Mall",
      "hours": "42h00",
      "rateVnd": 55000,
      "amountVnd": 2310000
    },
    {
      "label": "Thu ngân · Bến Thành",
      "hours": "36h32",
      "rateVnd": 50000,
      "amountVnd": 490000
    }
  ]
}
```

**Notes:**
- Gộp tất cả ca cùng role + location thành 1 dòng breakdown
- `rateVnd` là rate/giờ; `amountVnd = hours × rateVnd` (tính xấp xỉ bởi BE)

---

### GET /requests
**Used in:** RequestsPage > tab History — danh sách request đã tạo (cursor-based)

**Query params:**
| Param | Type | Mô tả |
|---|---|---|
| `status` | string | Optional: `pending\|approved\|rejected` (default: `all`) |
| `cursor` | string | Optional — opaque cursor; bỏ qua để lấy trang đầu |

**Response 200:**
```json
{
  "requests": [
    {
      "id": "R001",
      "type": "leave",
      "status": "pending",
      "startDate": "2026-06-15",
      "endDate": "2026-06-16",
      "reason": "Việc gia đình",
      "submittedAt": 1749600000000
    }
  ],
  "counts": {
    "all": 8,
    "pending": 2,
    "approved": 5,
    "rejected": 1
  },
  "nextCursor": "eyJpZCI6IlIwMTAifQ"
}
```

**Notes:**
- `counts` phản ánh toàn bộ data của user (không bị ảnh hưởng bởi cursor) — dùng hiển thị badge filter
- FE group by month từ `startDate`
- Khi đổi filter `status` → reset cursor, gọi lại từ đầu

---

### GET /requests/{id}
**Used in:** RequestDetailPage `/requests/:id`

**Response 200:**
```json
{
  "id": "R001",
  "type": "leave",
  "status": "pending",
  "startDate": "2026-06-15",
  "endDate": "2026-06-16",
  "time": null,
  "reason": "Việc gia đình",
  "submittedAt": 1749600000000,
  "reviewerName": null,
  "reviewedAt": null,
  "reviewComment": null
}
```

**Notes:**
- `time` chỉ có khi `type = late | early` (HH:MM)
- `endDate` chỉ có khi `type = leave`
- `reviewerName`, `reviewedAt`, `reviewComment` — null nếu chưa được xử lý

---

### POST /requests
**Used in:** RequestFormPage `/requests/create/:type` — submit form

**Idempotency:** Header `X-Idempotency-Key: <uuid>` — FE sinh UUID v4 khi mount form, giữ nguyên khi retry.

**Request body:**
```json
// leave
{ "type": "leave", "startDate": "2026-06-15", "endDate": "2026-06-16", "reason": "Việc gia đình" }

// late | early
{ "type": "late", "startDate": "2026-06-15", "time": "08:30", "reason": "Kẹt xe" }
```

**Response 201:**
```json
{
  "id": "R001",
  "type": "leave",
  "status": "pending",
  "submittedAt": 1749600000000
}
```

**Notes:**
- `type` hợp lệ: `leave`, `late`, `early` (đã bỏ `overtime` và `swap`)
- BE tự link request với user từ JWT token — không cần truyền `larkUserId`
- Sau submit thành công: FE hiện success screen 1.6s → navigate về `/requests`

---

### GET /salary
**Used in:** SalaryPage — dropdown chọn tháng

**Response 200:**
```json
{
  "salaries": [
    {
      "id": "SAL001",
      "month": 6,
      "year": 2026,
      "status": "paid",
      "total": 8500000
    },
    {
      "id": "SAL002",
      "month": 5,
      "year": 2026,
      "status": "pending",
      "total": 7200000
    }
  ]
}
```

**Notes:** FE mặc định chọn tháng đầu tiên (mới nhất) → gọi ngay `GET /salary/{id}`

---

### GET /salary/{id}
**Used in:** SalaryPage — chi tiết tháng được chọn

**Response 200:**
```json
{
  "id": "SAL001",
  "month": 6,
  "year": 2026,
  "status": "paid",
  "total": 8500000,
  "paymentDate": "2026-07-05",
  "baseSalary": 7500000,
  "bonus": 500000,
  "overtime": 300000,
  "allowance": 200000,
  "deductions": 0
}
```

---

## 14. Error Codes

### Response shape

Mọi lỗi đều trả cùng một shape:

```json
{
  "error": "Mô tả lỗi — có thể hiện trực tiếp cho user",
  "code": "MACHINE_READABLE_CODE"
}
```

Với lỗi validation (field-level), thêm `details`:

```json
{
  "error": "Dữ liệu không hợp lệ",
  "code": "VALIDATION_ERROR",
  "details": {
    "reason": ["Lý do từ chối không được để trống"],
    "scheduleInTime": ["Phải là timestamp UTC milliseconds"]
  }
}
```

---

### HTTP status → ý nghĩa

| Status | Ý nghĩa |
|---|---|
| `400` | Body/param sai format, logic vi phạm (vd: xóa ca đã bắt đầu) |
| `401` | Chưa đăng nhập / token hết hạn |
| `403` | Đã đăng nhập nhưng không có quyền |
| `404` | Resource không tồn tại |
| `409` | Conflict — vi phạm ràng buộc dữ liệu (vd: trùng ca, duplicate clock-in) |
| `422` | Validation thất bại — body đúng format nhưng sai business rule |
| `500` | Server error |

---

### Auth errors — `401` / `403`

| Code | HTTP | Khi nào |
|---|---|---|
| `TOKEN_MISSING` | 401 | Không có Authorization header |
| `TOKEN_EXPIRED` | 401 | Token hết hạn — FE redirect về Login |
| `TOKEN_INVALID` | 401 | Token sai / bị giả mạo |
| `LARK_CODE_INVALID` | 401 | Code truyền vào `POST /auth/lark` đã dùng hoặc hết hạn |
| `USER_NOT_REGISTERED` | 401 | Lark identity hợp lệ nhưng chưa được admin thêm vào hệ thống |
| `INSUFFICIENT_ROLE` | 403 | Đúng token nhưng orgRole không đủ (vd: MANAGER gọi ADMIN endpoint) |
| `LOCATION_ACCESS_DENIED` | 403 | MANAGER gọi locationId ngoài `managedLocationIds` |

**FE handling:**
- `TOKEN_EXPIRED` / `TOKEN_MISSING` / `TOKEN_INVALID` → clear token, redirect `/login`
- `INSUFFICIENT_ROLE` / `LOCATION_ACCESS_DENIED` → hiện `ErrorBanner` "Bạn không có quyền thực hiện thao tác này"

---

### Generic errors — `404` / `500`

| Code | HTTP | Khi nào |
|---|---|---|
| `NOT_FOUND` | 404 | Resource không tồn tại (fallback nếu không có code cụ thể) |
| `INTERNAL_ERROR` | 500 | Lỗi server không xác định |

---

### Location errors

| Code | HTTP | Khi nào | Endpoint |
|---|---|---|---|
| `LOCATION_NOT_FOUND` | 404 | `locationId` không tồn tại | GET/PATCH/DELETE `/locations/{id}` |
| `LOCATION_INACTIVE` | 400 | Cố thao tác trên location đã inactive (vd: thêm staff, tạo shift) | POST `/shifts`, PATCH `/staff` |
| `LOCATION_HAS_ACTIVE_SHIFTS` | 409 | Xóa location còn shift `upcoming/in` | DELETE `/locations/{id}` |

---

### Shift errors

| Code | HTTP | Khi nào | Endpoint |
|---|---|---|---|
| `SHIFT_NOT_FOUND` | 404 | shiftId không tồn tại | GET/PATCH/DELETE `/shifts/{id}` |
| `SHIFT_ALREADY_STARTED` | 400 | Xóa ca đang chạy hoặc đã xong | DELETE `/shifts/{id}` |
| `SHIFT_OVERLAP` | 409 | Tạo/sửa ca mà trùng giờ với ca khác của cùng nhân viên (kể cả khác location) | POST/PATCH `/shifts` |
| `SHIFT_INVALID_WINDOW` | 400 | `scheduleInTime >= scheduleOutTime` | POST/PATCH `/shifts` |
| `STAFF_NOT_IN_LOCATION` | 400 | `larkUserId` chưa được assign vào `locationId` | POST `/shifts` |

---

### Staff errors

| Code | HTTP | Khi nào | Endpoint |
|---|---|---|---|
| `STAFF_NOT_FOUND` | 404 | larkUserId không tồn tại trong hệ thống | GET/PATCH `/staff/{userId}` |
| `STAFF_ALREADY_EXISTS` | 409 | `larkUserId` đã được thêm vào workspace | POST `/staff` |
| `LARK_USER_NOT_FOUND` | 400 | `larkUserId` không tồn tại trên Lark (backend gọi Lark API thất bại) | POST `/staff` |
| `INVALID_PAY_CONFIG` | 422 | `payType=hourly` nhưng không có `rate`, hoặc `payType=monthly` nhưng không có `monthly` | POST/PATCH `/staff` |

---

### Approval errors

| Code | HTTP | Khi nào | Endpoint |
|---|---|---|---|
| `APPROVAL_NOT_FOUND` | 404 | approvalId không tồn tại | GET/POST `/approvals/{id}/*` |
| `APPROVAL_ALREADY_HANDLED` | 409 | Cố approve/reject một approval đã được xử lý | POST `/approvals/{id}/approve\|reject` |
| `REJECT_REASON_REQUIRED` | 422 | `reason` thiếu hoặc rỗng khi reject | POST `/approvals/{id}/reject` |

---

### Role errors

| Code | HTTP | Khi nào | Endpoint |
|---|---|---|---|
| `ROLE_NOT_FOUND` | 404 | roleId không tồn tại | PATCH/DELETE `/setup/roles/{id}` |
| `ROLE_IN_USE` | 409 | Xóa role còn nhân viên đang dùng | DELETE `/setup/roles/{id}` |
| `MANAGER_ROLE_REQUIRES_LOCATION` | 422 | Gán `MANAGER` orgRole nhưng thiếu `locationId` | POST `/staff/{userId}/roles` |
| `ORG_ROLE_NOT_ASSIGNED` | 404 | Xóa orgRole mà user không có | DELETE `/staff/{userId}/roles/{orgRole}` |

---

### Announcement / Notification errors

| Code | HTTP | Khi nào | Endpoint |
|---|---|---|---|
| `ANNOUNCEMENT_EMPTY_SCOPE` | 422 | `scope` rỗng hoặc chứa locationId không hợp lệ | POST `/announcements` |
| `NOTIFICATION_NOT_FOUND` | 404 | notificationId không tồn tại | PATCH `/notifications/{id}/read` |

---

### Attendance errors (Staff Mobile)

| Code | HTTP | Khi nào | Endpoint |
|---|---|---|---|
| `ALREADY_CLOCKED_IN` | 409 | Ca đã có `actualInTime` | POST `/attendance/clock-in` |
| `ALREADY_CLOCKED_OUT` | 409 | Ca đã có `actualOutTime` | POST `/attendance/clock-out` |
| `NOT_CLOCKED_IN` | 400 | Clock out khi chưa có `actualInTime` | POST `/attendance/clock-out` |
| `SHIFT_NOT_TODAY` | 400 | `shiftId` không thuộc ngày hôm nay | POST `/attendance/clock-in\|out` |
| `SHIFT_NOT_ASSIGNED` | 403 | `shiftId` không thuộc về user hiện tại | POST `/attendance/clock-in\|out` |

---

### Request errors (Staff Mobile)

| Code | HTTP | Khi nào | Endpoint |
|---|---|---|---|
| `REQUEST_NOT_FOUND` | 404 | requestId không tồn tại hoặc không thuộc user | GET `/requests/{id}` |
| `REQUEST_DUPLICATE` | 409 | Đã tạo request trùng loại + ngày | POST `/requests` |
| `INVALID_REQUEST_TYPE` | 422 | `type` không hợp lệ (chỉ `leave`, `late`, `early`) | POST `/requests` |
| `MISSING_END_DATE` | 422 | `leave` request thiếu `endDate` | POST `/requests` |
| `MISSING_TIME` | 422 | `late`/`early` request thiếu `time` | POST `/requests` |

---

### Validation error — `VALIDATION_ERROR` (422)

Dùng khi multiple fields sai cùng lúc. `details` là `Record<fieldName, string[]>`:

```json
{
  "error": "Dữ liệu không hợp lệ",
  "code": "VALIDATION_ERROR",
  "details": {
    "scheduleInTime": ["Bắt buộc phải có"],
    "scheduleOutTime": ["Phải sau scheduleInTime"],
    "roleId": ["roleId không tồn tại hoặc đã inactive"]
  }
}
```

**FE handling:** Map `details[fieldName]` vào inline error bên dưới từng input trong form.

---

### FE error handling pattern

```typescript
switch (err.code) {
  case 'TOKEN_EXPIRED':
  case 'TOKEN_MISSING':
  case 'TOKEN_INVALID':
  case 'USER_NOT_REGISTERED':
    clearToken(); redirect('/login'); break;

  case 'LOCATION_ACCESS_DENIED':
  case 'INSUFFICIENT_ROLE':
    showErrorBanner('Bạn không có quyền thực hiện thao tác này'); break;

  case 'SHIFT_OVERLAP':
    showErrorBanner('Nhân viên này đã có ca trùng giờ. Kiểm tra lại lịch.'); break;

  case 'APPROVAL_ALREADY_HANDLED':
    showErrorBanner('Yêu cầu này đã được xử lý bởi người khác.'); break;

  case 'ALREADY_CLOCKED_IN':
    showErrorBanner('Bạn đã check in ca này rồi.'); break;

  case 'ALREADY_CLOCKED_OUT':
    showErrorBanner('Bạn đã check out ca này rồi.'); break;

  case 'VALIDATION_ERROR':
    setFieldErrors(err.details); break;

  default:
    showErrorBanner(err.error ?? 'Có lỗi xảy ra. Vui lòng thử lại.');
}
```

---

## Summary — Endpoints

### fe-manager (41 endpoints)

| # | Method | Path | Used in |
|---|---|---|---|
| 1 | POST | /auth/lark | Login.tsx **[shared]** |
| 2 | GET | /auth/me | AuthContext **[shared]** |
| 3 | GET | /workspace/stats | Landing.tsx |
| 4 | POST | /locations | Setup > Location |
| 5 | GET | /locations | ManagerApp, MgrAnnounce, Login |
| 6 | GET | /locations/{id} | Setup > Location detail |
| 7 | PATCH | /locations/{id} | Setup > Location edit |
| 8 | DELETE | /locations/{id} | Setup > Location delete |
| 9 | PATCH | /locations/{id}/delegation | Setup > Delegation |
| 10 | POST | /shifts | Roster > add shift |
| 11 | GET | /shifts | TodayTimeline, WeekGrid, MgrHome KPI **[shared]** |
| 12 | GET | /shifts/{id} | Roster > shift detail **[shared]** |
| 13 | PATCH | /shifts/{id} | Roster > edit shift |
| 14 | DELETE | /shifts/{id} | Roster > delete upcoming shift |
| 15 | GET | /staff/{userId}/strip | Staff detail > monthly strip |
| 16 | GET | /shifts/export | Roster > Export CSV |
| 17 | POST | /staff | Setup > Staff > add |
| 18 | GET | /staff | Setup list, Roster picker, Login |
| 19 | GET | /staff/{userId} | Staff detail drawer |
| 20 | PATCH | /staff/{userId} | Staff detail > edit |
| 21 | GET | /staff/{userId}/roles | Staff > Roles tab |
| 22 | POST | /staff/{userId}/roles | Setup > assign orgRole |
| 23 | DELETE | /staff/{userId}/roles/{orgRole} | Setup > remove orgRole |
| 24 | GET | /audit-log | MgrHome feed + AuditLogDrawer |
| 25 | GET | /approvals | MgrHome preview + MgrApprovals list |
| 26 | GET | /approvals/{id} | ApprovalDetailDrawer |
| 27 | POST | /approvals/{id}/approve | MgrApprovals + ApprovalDetailDrawer |
| 28 | POST | /approvals/{id}/reject | ApprovalDetailDrawer |
| 29 | POST | /announcements | MgrAnnounce > send |
| 30 | GET | /announcements | MgrAnnounce > history |
| 31 | GET | /notifications | TopBar bell panel **[shared]** |
| 32 | PATCH | /notifications/{id}/read | TopBar > click notification **[shared]** |
| 33 | PATCH | /notifications/read-all | TopBar > mark all read **[shared]** |
| 34 | GET | /setup/roles | Setup > Roles, Roster picker |
| 35 | POST | /setup/roles | Setup > add role |
| 36 | PATCH | /setup/roles/{id} | Setup > edit role |
| 37 | DELETE | /setup/roles/{id} | Setup > delete role |
| 38 | GET | /setup/shift-templates | Roster > template picker |
| 39 | POST | /setup/shift-templates | Setup > add template |
| 40 | PATCH | /setup/shift-templates/{id} | Setup > edit template |
| 41 | DELETE | /setup/shift-templates/{id} | Setup > delete template |

### fe-staff mobile (18 endpoints — 9 shared + 9 staff-only)

> **Idempotency:** `POST /attendance/clock-in`, `POST /attendance/clock-out` dùng `idempotencyKey` trong body. `POST /requests` dùng HTTP header `X-Idempotency-Key: <uuid>`.

| # | Method | Path | Used in |
|---|---|---|---|
| S1 | POST | /auth/lark | LoginPage **[shared #1]** |
| S2 | GET | /auth/me | App bootstrap **[shared #2]** |
| S3 | GET | /shifts?userId=me&from=...&to=... | TodayPage (hôm nay) + CalendarPage (tuần) **[shared #11]** |
| S4 | GET | /shifts/{id} | ShiftDetailPage **[shared #12]** |
| S5 | GET | /notifications | NotificationsPage **[shared #31]** |
| S6 | PATCH | /notifications/{id}/read | Click notification **[shared #32]** |
| S7 | PATCH | /notifications/read-all | Mark all read **[shared #33]** |
| S8 | POST | /attendance/clock-in | TodayPage > Clock In button |
| S9 | POST | /attendance/clock-out | TodayPage > Clock Out button |
| S10 | GET | /attendance/earnings | TodayPage > earnings summary card |
| S11 | GET | /earnings/detail | EarningsPage > breakdown |
| S12 | GET | /requests | RequestsPage > History tab |
| S13 | GET | /requests/{id} | RequestDetailPage |
| S14 | POST | /requests | RequestFormPage > submit (`X-Idempotency-Key` header) |
| S15 | GET | /salary | SalaryPage > dropdown |
| S16 | GET | /salary/{id} | SalaryPage > detail |
| S17 | POST | /approvals/{id}/approve | Manager/admin duyệt staff request **[shared #27]** |
| S18 | POST | /approvals/{id}/reject | Manager/admin từ chối staff request **[shared #28]** |
