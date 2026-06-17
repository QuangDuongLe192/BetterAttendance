# SonarQube → Claude: Chạy thủ công

Sau mỗi lần GitHub Actions chạy xong (Job `build`), `sonar-issues.json` được upload lên artifacts.
Bạn có thể download về và dùng Claude Code CLI để xử lý — không cần `ANTHROPIC_API_KEY`.

---

## Bước 1 — Lấy sonar-issues.json về local

**Option A: Download từ GitHub Actions artifact**
```bash
gh run download --name sonar-issues --dir . --repo QuangDuongLe192/BetterAttendance
```

**Option B: Chạy script fetch trực tiếp** (cần ngrok đang chạy)
```powershell
$env:SONAR_HOST_URL = "https://xxxx.ngrok-free.app"
$env:SONAR_TOKEN    = "sqp_xxxxxxxxxxxx"
.github/scripts/fetch-sonar-issues.ps1
```

---

## Bước 2 — Claude tạo / cập nhật GitHub Issues

```bash
claude "$(cat .github/prompts/track-issues.md)"
```

Claude sẽ đọc `sonar-issues.json`, so sánh với GitHub Issues hiện có, rồi:
- Tạo issue mới cho finding chưa có
- Comment "still present" cho issue đã tồn tại
- Close issue cho finding đã được fix

Kết quả: file `new-issues.json` chứa danh sách issues vừa tạo mới.

---

## Bước 3 — Claude fix từng issue trong worktree riêng

```bash
claude "$(cat .github/prompts/fix-issues.md)"
```

Claude sẽ đọc `new-issues.json`, với mỗi issue:
1. Tạo `git worktree` trên branch `fix/sonar-<N>`
2. Fix code
3. Commit + push
4. Tạo Draft PR → bạn review và merge

---

## Khi nào chạy

Chạy sau mỗi lần GitHub Actions build xong và bạn muốn xử lý findings mới.
Bước 1 luôn cần chạy trước để có `sonar-issues.json` mới nhất.
Bước 3 chỉ cần chạy khi Bước 2 tạo ra issues mới (`new-issues.json` không rỗng).
