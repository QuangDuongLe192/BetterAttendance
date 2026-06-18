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
- **Claude Code CLI** cài đặt trên máy local

### GitHub Secrets
Vào repo → Settings → Secrets and variables → Actions → New repository secret:

| Secret | Giá trị |
|--------|---------|
| `SONAR_TOKEN` | Token SonarQube (tạo tại SonarQube → My Account → Security) |
| `SONAR_HOST_URL` | URL ngrok hiện tại, ví dụ `https://xxxx.ngrok-free.app` |

> **Lưu ý:** ngrok free plan đổi URL mỗi lần restart. Cần update `SONAR_HOST_URL` thủ công sau mỗi lần restart ngrok.

### GitHub Labels
Tạo các labels sau trong repo (Settings → Labels):

| Label | Màu | Mô tả |
|-------|-----|-------|
| `sonarqube` | `#e11d48` | Đánh dấu issue từ SonarQube |
| `bug` | `#d73a4a` | Lỗi runtime |
| `vulnerability` | `#b91c1c` | Lỗ hổng bảo mật |
| `code-smell` | `#f97316` | Code chất lượng thấp |
| `in-progress` | `#ffa500` | Đang được Claude fix |
| `in-review` | `#0075ca` | Draft PR đã tạo, chờ review |

```bash
gh label create "sonarqube"      --color "e11d48" --description "Đánh dấu issue từ SonarQube"
gh label create "vulnerability"  --color "b91c1c" --description "Lỗ hổng bảo mật"
gh label create "code-smell"     --color "f97316" --description "Code chất lượng thấp"
gh label create "in-progress"    --color "ffa500" --description "Fix đang được thực hiện"
gh label create "in-review"      --color "0075ca" --description "Draft PR đã tạo, chờ review"
```

### GitHub Project
Tạo hoặc dùng Project có sẵn (ví dụ Project #1).

Bật automation tại Project → Settings → Workflows:
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
│   ├── track-issues.md            # Prompt Claude: tạo/cập nhật GitHub Issues
│   └── fix-issues.md              # Prompt Claude: fix code + tạo Draft PR
└── sonar-claude-manual.md         # Hướng dẫn chạy thủ công nhanh
docs/
└── sonar-claude-workflow.md       # Tài liệu này
sonar-project.properties           # Cấu hình SonarQube project
```

---

## Flow chi tiết

### Giai đoạn 1 — GitHub Actions (tự động khi push lên main)

```
git push → main
    │
    ▼
[Job: build]
    ├─ Checkout code
    ├─ SonarQube scan (sonarqube-scan-action)
    ├─ fetch-sonar-issues.ps1
    │     ├─ Poll CE task đến khi SUCCESS
    │     ├─ Fetch tất cả issues theo trang (ps=500)
    │     └─ Ghi sonar-issues.json
    └─ Upload sonar-issues.json làm artifact
```

### Giai đoạn 2 — Triage (Developer chạy thủ công)

```bash
# Bước 1: Lấy sonar-issues.json về local
gh run download --name sonar-issues --dir . --repo QuangDuongLe192/BetterAttendance

# Bước 2: Claude tạo/cập nhật GitHub Issues
claude "$(cat .github/prompts/track-issues.md)"
```

Claude xử lý từng finding theo 4 trường hợp:

| Case | Điều kiện | Hành động |
|------|-----------|-----------|
| A | Finding mới, chưa có issue | Tạo issue mới + add vào Project #1 |
| B | Issue đang open, không có PR | Comment "still present" |
| B* | Issue đang `in-review` hoặc `in-progress` | Bỏ qua |
| C | Issue đã closed, finding tái xuất | Reopen + comment |
| D | Issue open nhưng finding đã biến mất | Comment "resolved" + close |

Kết quả: file `new-issues.json` chứa danh sách issues vừa tạo mới.

### Giai đoạn 3 — Fix (Developer chạy thủ công)

```bash
claude "$(cat .github/prompts/fix-issues.md)"
```

Claude xử lý từng issue trong `new-issues.json`:

```
Với mỗi issue:
    ├─ Label in-progress + comment "Fix in progress..."
    ├─ git worktree add ../worktrees/fix-{N} -b fix/sonar-{N}
    ├─ Đọc file lỗi, hiểu vấn đề
    ├─ Sửa code (minimal change)
    ├─ git commit + git push
    ├─ gh pr create --draft (Closes #{N})
    └─ Label in-review + comment "PR #{pr_number}"
```

### Giai đoạn 4 — Review (Developer)

- Vào GitHub → Pull Requests → xem các Draft PR
- Review từng PR, merge nếu đồng ý
- Issue tự động close khi merge (vì có `Closes #{N}`)
- Project item tự chuyển sang **Done**

---

## Vòng lặp

Mỗi lần merge PR sẽ trigger push → main → GitHub Actions chạy lại scan:
- Issues đã fix: biến mất khỏi SonarQube → Case D → close
- Issues mới phát sinh: Case A → tạo issue mới → fix tiếp

---

## Trạng thái issue

| Trạng thái | Label | Ý nghĩa |
|-----------|-------|---------|
| Mới tạo | `sonarqube` + type | Chờ fix |
| Đang fix | `in-progress` | Claude đang tạo worktree và sửa code |
| Chờ review | `in-review` | Draft PR đã tạo |
| Xong | *(closed)* | PR đã merge |

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
