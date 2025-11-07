# Test Admin Authentication Script
Write-Host "Testing Admin Authentication..." -ForegroundColor Cyan

# Test Login
Write-Host "`n1. Testing super_admin login..." -ForegroundColor Yellow
$loginBody = @{
    phone_number = "081234567808"
    password = "admin123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/auth/login' `
        -Method POST `
        -Body $loginBody `
        -ContentType 'application/json'
    
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "User: $($response.user.full_name)" -ForegroundColor Green
    Write-Host "Role: $($response.user.role.role_name)" -ForegroundColor Green
    Write-Host "Permissions count: $($response.user.permissions.Count)" -ForegroundColor Green
    
    $token = $response.token
    
    # Test accessing /admin/users/roles endpoint
    Write-Host "`n2. Testing GET /admin/users/roles..." -ForegroundColor Yellow
    $headers = @{
        Authorization = "Bearer $token"
    }
    
    $rolesResponse = Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/users/roles' `
        -Method GET `
        -Headers $headers
    
    Write-Host "✅ Roles endpoint accessible!" -ForegroundColor Green
    Write-Host "Roles found: $($rolesResponse.data.Count)" -ForegroundColor Green
    
    # Test accessing /admin/users endpoint
    Write-Host "`n3. Testing GET /admin/users..." -ForegroundColor Yellow
    $usersResponse = Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/users' `
        -Method GET `
        -Headers $headers
    
    Write-Host "✅ Users endpoint accessible!" -ForegroundColor Green
    Write-Host "Users found: $($usersResponse.data.users.Count)" -ForegroundColor Green
    Write-Host "Total: $($usersResponse.data.totalCount)" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host "`nTest complete!" -ForegroundColor Cyan
