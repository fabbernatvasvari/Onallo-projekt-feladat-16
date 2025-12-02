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

# 1) Root
Send-Request -Method 'GET' -Url "$base/"

# 2) /api/users
Send-Request -Method 'GET' -Url "$base/api/users"

# 3) /api/messages
Send-Request -Method 'GET' -Url "$base/api/messages"

# 4) POST /api/register
$bodyReg = @{ email = 'test@example.com' }
Send-Request -Method 'POST' -Url "$base/api/register" -Body $bodyReg

# 5) POST /api/login (usually fails unless chat value matches server cache)
$bodyLogin = @{ email = 'test@example.com'; chat = '1234' }
Send-Request -Method 'POST' -Url "$base/api/login" -Body $bodyLogin

Write-Host "\nAll requests completed."
