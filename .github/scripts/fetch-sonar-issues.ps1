$ErrorActionPreference = 'Stop'

param(
    [string]$SonarHostUrl    = $env:SONAR_HOST_URL,
    [string]$SonarToken      = $env:SONAR_TOKEN,
    [int]$TimeoutMinutes     = 10
)

if (-not $SonarHostUrl) { throw "SONAR_HOST_URL is not set" }
if (-not $SonarToken)   { throw "SONAR_TOKEN is not set" }

# Read project key from sonar-project.properties
$projectKey = (Get-Content "sonar-project.properties" |
    Where-Object { $_ -match "^sonar\.projectKey=" } |
    Select-Object -First 1) -replace "^sonar\.projectKey=", ""

if (-not $projectKey) {
    throw "sonar.projectKey not found in sonar-project.properties"
}

# Read CE task ID written by sonarqube-scan-action
$ceTaskId = (Get-Content ".scannerwork/report-task.txt" -ErrorAction SilentlyContinue |
    Where-Object { $_ -match "^ceTaskId=" } |
    Select-Object -First 1) -replace "^ceTaskId=", ""

if (-not $ceTaskId) {
    throw "ceTaskId not found in .scannerwork/report-task.txt"
}

Write-Host "Polling CE task: $ceTaskId"

$headers  = @{ Authorization = "Bearer $SonarToken" }
$deadline = (Get-Date).AddMinutes($TimeoutMinutes)

do {
    $task   = Invoke-RestMethod -Uri "$SonarHostUrl/api/ce/task?id=$ceTaskId" -Headers $headers
    $status = $task.task.status
    Write-Host "  status: $status"

    if ($status -eq "FAILED")    { throw "CE task FAILED" }
    if ($status -eq "CANCELLED") { throw "CE task CANCELLED" }
    if ($status -ne "SUCCESS")   { Start-Sleep -Seconds 5 }
} while ($status -ne "SUCCESS" -and (Get-Date) -lt $deadline)

if ($status -ne "SUCCESS") {
    throw "Timed out waiting for CE task after $TimeoutMinutes minutes"
}

Write-Host "Analysis complete. Fetching issues for project: $projectKey"

$url      = "$SonarHostUrl/api/issues/search?projectKeys=$projectKey&resolved=false&ps=500"
$response = Invoke-RestMethod -Uri $url -Headers $headers
$response | ConvertTo-Json -Depth 10 | Set-Content "sonar-issues.json" -Encoding UTF8

Write-Host "Saved $($response.total) issues to sonar-issues.json"
