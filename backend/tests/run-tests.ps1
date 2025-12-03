# Run all API checks from the tests file in one command
# Usage: from repo root or backend folder:
#   powershell -ExecutionPolicy Bypass -File backend\tests\run-tests.ps1

function Send-Request {
    param(
        [string]$Method,
        [string]$Url,
        [object]$Body = $null
    )

    Write-Host "\n=== $Method $Url ==="
    try {
        if ($Body -ne $null) {
            $json = $Body | ConvertTo-Json -Depth 10
            $resp = Invoke-WebRequest -Uri $Url -Method $Method -Body $json -ContentType 'application/json' -UseBasicParsing -ErrorAction Stop
        } else {
            $resp = Invoke-WebRequest -Uri $Url -Method $Method -UseBasicParsing -ErrorAction Stop
        }

        $status = $resp.StatusCode
        $content = $resp.Content
        Write-Host "Status: $status"
        if ($content) { Write-Host $content }
    }
    catch {
        $err = $_.Exception
        if ($err.Response -ne $null) {
            $stream = $err.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $bodyText = $reader.ReadToEnd()
            try { $status = $err.Response.StatusCode.Value__ } catch { $status = 'ERR' }
            Write-Host "Status: $status"
            Write-Host $bodyText
        } else {
            Write-Host "Error: $($_.Exception.Message)"
        }
    }
}

# Base URL (adjust port if needed)
$base = 'http://localhost:3001'

Write-Host "==============================" -ForegroundColor Cyan
Write-Host "API Endpoint Health Check" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

# 1) Root
Send-Request -Method 'GET' -Url "$base/"

# 2) /api/users (GET)
Send-Request -Method 'GET' -Url "$base/api/users"

# 3) /api/messages (GET)
Send-Request -Method 'GET' -Url "$base/api/messages"

# 4) /api/messages/conversation/:userId (test example userId=1)
Send-Request -Method 'GET' -Url "$base/api/messages/conversation/1"

# 5) /api/messages/thread/:id (test example id=1)
Send-Request -Method 'GET' -Url "$base/api/messages/thread/1"

# 6) POST /api/register
$bodyReg = @{ email = 'test@example.com' }
Send-Request -Method 'POST' -Url "$base/api/register" -Body $bodyReg

# 7) POST /api/login (use the OTP returned from register test - for demo, just show it will fail with dummy OTP)
$bodyLogin = @{ 
    email = 'test@example.com'
    otp = '1234'
}
Send-Request -Method 'POST' -Url "$base/api/login" -Body $bodyLogin

# 8) POST /api/messages (requires sender_id, recipient_id, content)
$bodyMsg = @{ 
    sender_id = 1
    recipient_id = 2
    content = 'Hello from test'
}
Send-Request -Method 'POST' -Url "$base/api/messages" -Body $bodyMsg

# 9) POST /api/messages/reply (requires parent_id, sender_id, recipient_id, content)
$bodyReply = @{
    parent_id = 1
    sender_id = 1
    recipient_id = 2
    content = 'This is a reply'
}
Send-Request -Method 'POST' -Url "$base/api/messages/reply" -Body $bodyReply

Write-Host "`n==============================" -ForegroundColor Cyan
Write-Host "All requests completed." -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Cyan
