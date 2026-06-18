# SonarQube + Claude: Workflow tự động review và fix code

## Tổng quan

Workflow này tự động hóa quá trình từ lúc developer push code đến khi các lỗi SonarQube được fix và tạo Draft PR để review:

1. **GitHub Actions** chạy SonarQube scan và thu thập tất cả findings
2. **Claude** đọc findings, tạo GitHub Issues có giải thích và gợi ý fix
3. **Claude** tự động fix từng issue trong branch riêng, tạo Draft PR
4. **Developer** review và merge từng PR

---

## Prerequisites

### Hạ tầng
- **SonarQube CE** đang chạy local (mặc định port 9000)
- **ngrok** để expose SonarQube ra internet cho GitHub Actions truy cập:
  ```bash
  ngrok http 9000
  ```
- **Claude Code CLI** cài đặt trên máy local (chỉ cần cho flow thủ công)

### GitHub Secrets
Vào repo → Settings → Secrets and variables → Actions → New repository secret:

| Secret | Giá trị |
|--------|---------|
| `SONAR_TOKEN` | Token SonarQube (tạo tại SonarQube → My Account → Security) |
| `SONAR_HOST_URL` | URL ngrok hiện tại, ví dụ `https://xxxx.ngrok-free.app` |
| `ANTHROPIC_API_KEY` | API key của Anthropic (chỉ cần cho flow tự động) |

> **Lưu ý:** ngrok free plan đổi URL mỗi lần restart. Cần update `SONAR_HOST_URL` thủ công sau mỗi lần restart ngrok.

### GitHub Labels
Chỉ `sonarqube` là bắt buộc. Các labels còn lại nên có để theo dõi trạng thái:

| Label | Màu | Bắt buộc | Mô tả |
|-------|-----|----------|-------|
| `sonarqube` | `#e11d48` | Có | Đánh dấu issue từ SonarQube |
| `bug` | `#d73a4a` | Không | Lỗi runtime |
| `vulnerability` | `#b91c1c` | Không | Lỗ hổng bảo mật |
| `code-smell` | `#f97316` | Không | Code chất lượng thấp |
| `in-progress` | `#ffa500` | Không | Đang được Claude fix |
| `in-review` | `#0075ca` | Không | Draft PR đã tạo, chờ review |

```bash
gh label create "sonarqube"      --color "e11d48" --description "Đánh dấu issue từ SonarQube"
gh label create "vulnerability"  --color "b91c1c" --description "Lỗ hổng bảo mật"
gh label create "code-smell"     --color "f97316" --description "Code chất lượng thấp"
gh label create "in-progress"    --color "ffa500" --description "Fix đang được thực hiện"
gh label create "in-review"      --color "0075ca" --description "Draft PR đã tạo, chờ review"
```

### GitHub Project

Issues sẽ được tự động thêm vào GitHub Project sau khi tạo.

#### Dùng project có sẵn

Lấy project number bằng lệnh:
```bash
gh project list --owner QuangDuongLe192
```

Ví dụ output:
```
NUMBER  TITLE           STATE
1       BetterAttendance  open
```

Mở [track-issues.md](.github/prompts/track-issues.md), tìm dòng:
```bash
gh project item-add 1 --owner QuangDuongLe192 ...
```
Thay số `1` bằng project number tương ứng.

#### Tạo project mới

```bash
gh project create --owner QuangDuongLe192 --title "SonarQube Fixes"
```

Lệnh trả về project number mới — điền vào `track-issues.md` như trên.

#### Bật automation

Vào Project → Settings → Workflows, bật 3 rules:
- **Item added to project** → Status: `Todo`
- **Pull request opened** → Status: `In Progress`
- **Item closed** → Status: `Done`

---

## Cấu trúc files

```
.github/
├── workflows/
│   └── build.yml                  # GitHub Actions: scan + fetch + track + fix
├── scripts/
│   └── fetch-sonar-issues.ps1     # PowerShell: poll CE task + phân trang API
├── prompts/
│   ├── track-issues.md            # Prompt Claude: tạo/cập nhật GitHub Issues
│   └── fix-issues.md              # Prompt Claude: fix code + tạo Draft PR
└── sonar-claude-manual.md         # Hướng dẫn chạy thủ công nhanh
docs/
└── sonar-claude-workflow.md       # Tài liệu này
sonar-project.properties           # Cấu hình SonarQube project
```

---

## Flow 1 — Tự động (GitHub Actions)

Toàn bộ quy trình chạy tự động sau mỗi lần push lên `main`. Yêu cầu `ANTHROPIC_API_KEY` trong GitHub Secrets.

```
git push → main
    │
    ▼
[Job 1: build]
    ├─ SonarQube scan
    ├─ Fetch tất cả issues (có phân trang)
    └─ Upload sonar-issues.json làm artifact
    │
    ▼
[Job 2: track-issues]
    ├─ Download sonar-issues.json
    ├─ Claude so sánh findings với GitHub Issues hiện có
    │     ├─ Finding mới       → Tạo issue + add vào Project
    │     ├─ Finding còn đó    → Comment "still present"
    │     ├─ Finding tái xuất  → Reopen issue
    │     └─ Finding đã fix    → Close issue
    └─ Upload new-issues.json làm artifact
    │
    ▼
[Job 3: fix-issues]  ← bỏ qua nếu new-issues.json rỗng
    └─ Claude fix từng issue mới:
          ├─ Label in-progress
          ├─ Tạo branch fix/sonar-{N}
          ├─ Fix code → commit → push
          ├─ Tạo Draft PR (Closes #{N})
          └─ Label in-review
    │
    ▼
Developer review và merge từng Draft PR
    │
    ▼
Issue tự đóng → Project item → Done
    │
    ▼
[Lần push tiếp theo] → vòng lặp tiếp tục
```

Có thể kích hoạt thủ công (không cần push) tại:
> GitHub → Actions → Build → Run workflow

---

## Flow 2 — Thủ công (Claude Code CLI)

Dùng khi không muốn dùng `ANTHROPIC_API_KEY` trên GitHub, hoặc muốn kiểm soát từng bước.

### Bước 1 — Lấy sonar-issues.json

**Option A: Download từ GitHub Actions artifact** (sau khi Job 1 đã chạy)
```bash
gh run download --name sonar-issues --dir . --repo QuangDuongLe192/BetterAttendance
```

**Option B: Chạy script trực tiếp** (cần ngrok đang chạy)
```powershell
$env:SONAR_HOST_URL = "https://xxxx.ngrok-free.app"
$env:SONAR_TOKEN    = "sqp_xxxxxxxxxxxx"
.github/scripts/fetch-sonar-issues.ps1
```

### Bước 2 — Claude tạo/cập nhật GitHub Issues

```bash
claude "$(cat .github/prompts/track-issues.md)"
```

Kết quả: file `new-issues.json` chứa danh sách issues vừa tạo mới.

### Bước 3 — Claude fix từng issue

```bash
claude "$(cat .github/prompts/fix-issues.md)"
```

Bỏ qua tự động nếu `new-issues.json` rỗng.

### Bước 4 — Review và merge

Vào GitHub → Pull Requests → review từng Draft PR → merge.

---

## Trạng thái issue

| Trạng thái | Label | Ý nghĩa |
|-----------|-------|---------|
| Mới tạo | `sonarqube` + type | Chờ fix |
| Đang fix | `in-progress` | Claude đang tạo worktree và sửa code |
| Chờ review | `in-review` | Draft PR đã tạo |
| Xong | *(closed)* | PR đã merge |

---

## Xử lý finding cũ chưa fix

Theo mặc định, `track-issues.md` chỉ đưa **findings mới** vào `new-issues.json`. Findings cũ chưa fix (Case B) chỉ nhận comment "still present".

Để fix thủ công một issue cụ thể, tạo `new-issues.json` với dữ liệu từ issue đó rồi chạy bước 3:

```json
[
  {
    "number": 42,
    "rule": "squid:S3776",
    "component": "src/features/auth/auth.service.ts",
    "line": 42,
    "message": "Cognitive Complexity of 18 exceeds 15",
    "type": "CODE_SMELL"
  }
]
```

---

## Troubleshooting

### ngrok trả về trang cảnh báo thay vì JSON
Header `ngrok-skip-browser-warning: true` đã được thêm vào script. Nếu vẫn lỗi, kiểm tra ngrok đang chạy.

### CE task timeout
SonarQube mất quá 10 phút phân tích. Tăng `$TimeoutMinutes` trong `fetch-sonar-issues.ps1`.

### sonar-issues.json chỉ có 500 issues dù SonarQube có nhiều hơn
Script đã hỗ trợ phân trang. Nếu vẫn thiếu, kiểm tra `$response.paging.total` trong log.

### Claude không tìm thấy gh CLI
Đảm bảo đang chạy lệnh `claude` trong terminal đã đăng nhập `gh auth login`.

### GitHub Actions không tạo được PR
Vào repo → Settings → Actions → General → Workflow permissions → bật **"Allow GitHub Actions to create and approve pull requests"**.

### new-issues.json rỗng dù có issues trên GitHub
Các issues đó đã tồn tại từ lần chạy trước (fingerprint đã match). Xem phần **Xử lý finding cũ chưa fix** ở trên.
