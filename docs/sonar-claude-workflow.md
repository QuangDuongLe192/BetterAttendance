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
- **cloudflared** để expose SonarQube ra internet cho GitHub Actions truy cập:
  ```bash
  cloudflared tunnel --url http://localhost:9000
  ```
- **Claude Code CLI** cài đặt trên máy local (chỉ cần cho flow thủ công)

### GitHub Secrets
Vào repo → Settings → Secrets and variables → Actions → New repository secret:

| Secret | Giá trị |
|--------|---------|
| `SONAR_TOKEN` | Token SonarQube (tạo tại SonarQube → My Account → Security) |
| `SONAR_HOST_URL` | URL ngrok hiện tại, ví dụ `https://xxxx.ngrok-free.app` |
| `ANTHROPIC_API_KEY` | API key của Anthropic (chỉ cần cho flow tự động) |

> **Lưu ý:** URL cloudflared thay đổi mỗi lần restart tunnel. Cần update `SONAR_HOST_URL` thủ công sau mỗi lần restart.

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

Mở [fix-issues.md](.github/prompts/fix-issues.md), tìm dòng GraphQL với `projectId` và cập nhật nếu cần.

#### Tạo project mới

```bash
gh project create --owner QuangDuongLe192 --title "SonarQube Fixes"
```

Lấy project ID mới bằng:
```bash
gh project list --owner QuangDuongLe192 --format json
```
Sau đó cập nhật `projectId` trong `fix-issues.md`.

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
│   └── build.yml                  # GitHub Actions: scan + fetch issues
├── scripts/
│   └── fetch-sonar-issues.ps1     # PowerShell: poll CE task + phân trang API
├── prompts/
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
[Job 2: fix-issues]
    ├─ Download sonar-issues.json
    ├─ Claude fix tất cả issues trong 1 worktree
    ├─ Push branch + tạo Draft PR
    └─ Add PR vào GitHub Project → In Review
    │
    ▼
Developer review Draft PR → merge
    │
    ▼
Project item → Done
    │
    ▼
[Lần push tiếp theo] → vòng lặp tiếp tục
```

Có thể kích hoạt thủ công (không cần push) tại:
> GitHub → Actions → Build → Run workflow

---

## Flow 2 — Thủ công (Claude Code CLI)

Dùng khi không muốn dùng `ANTHROPIC_API_KEY` trên GitHub, hoặc muốn kiểm soát từng bước.

### Bước 1 — Chạy Claude fix issues

```bash
claude "$(cat .github/prompts/fix-issues.md)"
```

Claude sẽ tự download `sonar-issues.json` từ artifact của lần build gần nhất, fix tất cả issues và tạo Draft PR.

### Bước 2 — Review và merge

Vào GitHub → Pull Requests → review từng Draft PR → merge.

---

## Trạng thái issue

Trạng thái được theo dõi qua **GitHub Project board**, không dùng labels:

| Trạng thái | Ý nghĩa |
|-----------|---------|
| Todo | Issue vừa tạo, chờ fix |
| In Review | Draft PR đã tạo |
| Done | PR đã merge, issue đã close |

---

---

## Troubleshooting

### cloudflared tunnel không hoạt động
Kiểm tra `cloudflared tunnel --url http://localhost:9000` đang chạy và URL đã được update vào secret `SONAR_HOST_URL`.

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
