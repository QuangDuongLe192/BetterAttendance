param(
    [string]$SonarHostUrl    = $env:SONAR_HOST_URL,
    [string]$SonarToken      = $env:SONAR_TOKEN,
    [int]$TimeoutMinutes     = 10
)

# Read project key from sonar-project.properties
$projectKey = (Get-Content "sonar-project.properties" |
    Where-Object { $_ -match "^sonar\.projectKey=" } |
    Select-Object -First 1) -replace "^sonar\.projectKey=", ""

if (-not $projectKey) {
    Write-Error "sonar.projectKey not found in sonar-project.properties"
    exit 1
}

# Read CE task ID written by sonarqube-scan-action
$ceTaskId = (Get-Content ".scannerwork/report-task.txt" -ErrorAction SilentlyContinue |
    Where-Object { $_ -match "^ceTaskId=" } |
    Select-Object -First 1) -replace "^ceTaskId=", ""

if (-not $ceTaskId) {
    Write-Error "ceTaskId not found in .scannerwork/report-task.txt"
    exit 1
}

Write-Host "Polling CE task: $ceTaskId"

$headers  = @{ Authorization = "Bearer $SonarToken" }
$deadline = (Get-Date).AddMinutes($TimeoutMinutes)

do {
    $task   = Invoke-RestMethod -Uri "$SonarHostUrl/api/ce/task?id=$ceTaskId" -Headers $headers
    $status = $task.task.status
    Write-Host "  status: $status"

    if ($status -eq "FAILED")    { Write-Error "CE task FAILED";    exit 1 }
    if ($status -eq "CANCELLED") { Write-Error "CE task CANCELLED"; exit 1 }
    if ($status -ne "SUCCESS")   { Start-Sleep -Seconds 5 }
} while ($status -ne "SUCCESS" -and (Get-Date) -lt $deadline)

if ($status -ne "SUCCESS") {
    Write-Error "Timed out waiting for CE task after $TimeoutMinutes minutes"
    exit 1
}

Write-Host "Analysis complete. Fetching issues for project: $projectKey"

$url      = "$SonarHostUrl/api/issues/search?projectKeys=$projectKey&resolved=false&ps=500"
$response = Invoke-RestMethod -Uri $url -Headers $headers
$response | ConvertTo-Json -Depth 10 | Set-Content "sonar-issues.json" -Encoding UTF8

Write-Host "Saved $($response.total) issues to sonar-issues.json"
