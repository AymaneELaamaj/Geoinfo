@echo off
REM Script de v�rification rapide de l'int�gration
echo.
echo =================================================
echo    VERIFICATION INTEGRATION BACKEND-FRONTEND
echo =================================================
echo.

REM Test de connectivit� du backend
echo [1/4] Test Backend Health Check...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:8085/api/health' -Method GET -TimeoutSec 5; echo '   ✅ Backend OK (Status: '$r.StatusCode')' } catch { echo '   ❌ Backend inaccessible' }"

echo.
echo [2/4] Test Backend Connection...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:8085/api/test/connection' -Method GET -TimeoutSec 5; echo '   ✅ CORS OK (Status: '$r.StatusCode')' } catch { echo '   ❌ CORS inaccessible' }"

echo.
echo [3/4] Test Frontend...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:5173' -Method GET -TimeoutSec 5; echo '   ✅ Frontend OK (Status: '$r.StatusCode')' } catch { echo '   ❌ Frontend inaccessible' }"

echo.
echo [4/4] R�sum� des services:
powershell -Command "$backend = try { Test-NetConnection -ComputerName localhost -Port 8085 -InformationLevel Quiet } catch { $false }; $frontend = try { Test-NetConnection -ComputerName localhost -Port 5173 -InformationLevel Quiet } catch { $false }; echo ('   Backend (8085): ' + $(if($backend){'✅ ACTIF'}else{'❌ INACTIF'})); echo ('   Frontend (5173): ' + $(if($frontend){'✅ ACTIF'}else{'❌ INACTIF'}))"

echo.
echo =================================================
if exist "INTEGRATION_SUMMARY.md" (
    echo    📚 Documentation: INTEGRATION_SUMMARY.md
)
if exist "TEST_CONNECTIVITY.md" (
    echo    🧪 Tests: TEST_CONNECTIVITY.md
)
echo    🌐 Page de test: http://localhost:5173/test-connectivite
echo =================================================
echo.

pause