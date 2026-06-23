# Hướng dẫn cài đặt: SonarQube + GitHub + Claude

## Tổng quan

Tài liệu này hướng dẫn cài đặt toàn bộ workflow từ đầu trên máy Windows.

---

## 1. Cài đặt SonarQube CE

### 1.1 Yêu cầu
- Java 17+ (kiểm tra: `java -version`)
- Nếu chưa có: tải tại [adoptium.net](https://adoptium.net)

### 1.2 Tải và giải nén
1. Vào [sonarqube.org/downloads](https://www.sonarsource.com/products/sonarqube/downloads/) → tải bản **Community Edition**
2. Giải nén vào ví dụ `C:\sonarqube`

### 1.3 Khởi động
```powershell
C:\sonarqube\bin\windows-x86-64\StartSonar.bat
```

Đợi dòng `SonarQube is operational` xuất hiện, sau đó mở trình duyệt:
```
http://localhost:9000
```

Đăng nhập lần đầu: `admin` / `admin` → đổi mật khẩu mới.

### 1.4 Tạo project
1. Vào **Projects → Create project → Manually**
2. Đặt **Project key** (ví dụ: `better-attendance`) — phải khớp với `sonar.projectKey` trong `sonar-project.properties`
3. Chọn **Locally** → nhập tên → Continue

### 1.5 Tạo token
1. Vào **My Account → Security → Generate Tokens**
2. Chọn loại **Project Analysis Token**, chọn project, đặt tên
3. Nhấn **Generate** → **lưu lại token** (chỉ hiện 1 lần)

---

## 2. Cài đặt Cloudflare Tunnel

Cloudflare Tunnel dùng để expose SonarQube local ra internet cho GitHub Actions truy cập. Không cần tài khoản, không cần cấu hình.

### 2.1 Tải và cài
Tải `cloudflared` cho Windows tại [developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/):
- Chọn **Windows → 64-bit**
- Lưu file `cloudflared.exe` vào thư mục bất kỳ (ví dụ `C:\cloudflared`)
- Thêm vào PATH hoặc chạy trực tiếp bằng đường dẫn đầy đủ

### 2.2 Expose SonarQube
Mỗi lần cần dùng workflow, chạy lệnh này (để terminal mở):
```powershell
cloudflared tunnel --url http://localhost:9000
```

Đợi vài giây, terminal sẽ hiển thị URL dạng:
```
https://xxxx.trycloudflare.com
```

Lưu lại URL đó — dùng ở bước cấu hình GitHub Secrets.

> **Lưu ý:** URL thay đổi mỗi lần restart tunnel. Cần update lại secret `SONAR_HOST_URL` sau mỗi lần restart.

---

## 3. Cài đặt GitHub CLI

### 3.1 Cài đặt
```powershell
winget install GitHub.cli
```

Restart terminal sau khi cài xong.

### 3.2 Đăng nhập
```powershell
gh auth login
```

Chọn:
- **GitHub.com**
- **HTTPS**
- **Login with a web browser**

Làm theo hướng dẫn trên trình duyệt.

### 3.3 Kiểm tra
```powershell
gh auth status
```

---

## 4. Cài đặt Claude Code CLI

### 4.1 Yêu cầu
- Node.js 18+ (kiểm tra: `node -v`)
- Nếu chưa có: tải tại [nodejs.org](https://nodejs.org)

### 4.2 Cài đặt
```powershell
npm install -g @anthropic-ai/claude-code
```

### 4.3 Cấu hình shell (quan trọng trên Windows)

Claude Code mặc định dùng PowerShell trên Windows, nhưng các prompt dùng cú pháp Bash. Cần cấu hình dùng Git Bash:

**Yêu cầu:** Git for Windows đã cài ([git-scm.com](https://git-scm.com))

Mở file `C:\Users\<tên_user>\.claude\settings.json`, thêm:
```json
{
  "shell": "C:\\Program Files\\Git\\bin\\bash.exe"
}
```

> Nếu Git cài ở thư mục khác, kiểm tra bằng: `where git` và thay đường dẫn tương ứng.

### 4.4 Đăng nhập Claude
```bash
claude
```

Lần đầu chạy sẽ yêu cầu đăng nhập tại claude.ai.

---

## 5. Cấu hình GitHub repo

### 5.1 GitHub Secrets

Vào repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Giá trị |
|--------|---------|
| `SONAR_TOKEN` | Token tạo ở bước 1.5 |
| `SONAR_HOST_URL` | URL ngrok hiện tại (ví dụ `https://xxxx.ngrok-free.app`) |
| `ANTHROPIC_API_KEY` | API key Anthropic (lấy tại [console.anthropic.com](https://console.anthropic.com)) |

### 5.2 GitHub Project

**Dùng project có sẵn:**
```bash
gh project list --owner <owner>
```
Ghi nhớ số project (cột NUMBER).

**Tạo project mới:**
```bash
gh project create --owner <owner> --title "SonarQube Fixes"
```

Sau đó mở project trên GitHub → **Settings → Workflows**, bật 3 rules:
- **Item added to project** → Status: `Todo`
- **Pull request opened** → Status: `In Progress`
- **Item closed** → Status: `Done`

Cập nhật project number trong `.github/prompts/track-issues.md`:
```bash
gh project item-add 1 --owner <owner> ...
                   ↑ thay số này
```

### 5.4 Quyền GitHub Actions

Vào repo → **Settings → Actions → General → Workflow permissions**:
- Chọn **Read and write permissions**
- Tick **Allow GitHub Actions to create and approve pull requests**
- Nhấn **Save**

---

## 6. Cấu hình sonar-project.properties

File này nằm ở root của project:

```properties
sonar.projectKey=better-attendance
sonar.projectName=Better Attendance
sonar.sources=src
sonar.exclusions=**/*.test.ts,**/*.spec.ts,node_modules/**
```

Đảm bảo `sonar.projectKey` khớp với project đã tạo trong SonarQube (bước 1.4).

---

## 7. Chạy lần đầu

### 7.1 Kiểm tra trước khi push
- [ ] SonarQube đang chạy tại `localhost:9000`
- [ ] ngrok đang chạy, URL đã update vào secret `SONAR_HOST_URL`
- [ ] 3 secrets đã có trong GitHub (`SONAR_TOKEN`, `SONAR_HOST_URL`, `ANTHROPIC_API_KEY`)
- [ ] Project đã cấu hình automation

### 7.2 Push code
```bash
git push origin main
```

Hoặc kích hoạt thủ công tại:
> GitHub → Actions → Build → **Run workflow**

### 7.3 Theo dõi kết quả
1. Vào **GitHub → Actions** → xem jobs chạy lần lượt
2. Sau khi xong, vào **Pull Requests** → thấy Draft PR
3. Review PR → merge nếu đồng ý

---

## Troubleshooting

### SonarQube không khởi động được
Kiểm tra Java version: `java -version` — cần Java 17+. Xem log tại `C:\sonarqube\logs\sonar.log`.

### ngrok URL không hoạt động
Kiểm tra ngrok còn chạy. URL thay đổi sau mỗi lần restart — update lại secret `SONAR_HOST_URL`.

### `gh` not recognized
Restart terminal sau khi cài. Nếu vẫn lỗi: `winget install GitHub.cli` lại.

### Claude dùng PowerShell, lệnh bash bị lỗi
Kiểm tra `settings.json` đã cấu hình đúng đường dẫn Git Bash (bước 4.3).

### GitHub Actions không tạo được PR
Kiểm tra **Settings → Actions → General → Workflow permissions** (bước 5.4).
