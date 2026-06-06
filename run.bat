@echo off
title MRV - Organizer Plus - Inicializador
chcp 65001 > nul
cd /d "%~dp0"

echo =========================================================
echo               MRV - Organizer Plus
echo             Powered by Rafael Amorim
echo =========================================================
echo.

:: Verificar se o Node.js estÃ¡ instalado no PATH
where node >nul 2>nul
if %errorlevel% equ 0 goto NODE_FOUND

:: Se nÃ£o estiver no PATH, verificar caminhos de instalaÃ§Ã£o padrÃ£o
if exist "C:\Program Files\nodejs\node.exe" (
    set "PATH=%PATH%;C:\Program Files\nodejs"
    goto NODE_FOUND
)
if exist "C:\Program Files (x86)\nodejs\node.exe" (
    set "PATH=%PATH%;C:\Program Files\x86\nodejs"
    goto NODE_FOUND
)

goto NO_NODE

:NODE_FOUND
echo [INFO] Node.js detectado. Preparando o servidor de rede local...
echo.

if not exist node_modules (
    echo [INFO] Instalando dependencias de rede - apenas na primeira vez...
    call npm install express
    echo.
)

echo [INFO] Iniciando servidor em segundo plano...
start /b node server.js

echo [INFO] Aguardando o servidor iniciar...
ping -n 4 127.0.0.1 >nul

echo [INFO] Abrindo o MRV - Organizer Plus no seu navegador...
start "" "http://localhost:3000"
goto END

:NO_NODE
echo [AVISO] Node.js nÃ£o foi encontrado.
echo O aplicativo irÃ¡ rodar em MODO LOCAL (apenas neste navegador).
echo Para habilitar sincronizaÃ§Ã£o em rede: instale o Node.js (https://nodejs.org)
echo e depois reinicie o computador.
echo.
echo Abrindo o aplicativo localmente em instantes...
ping -n 4 127.0.0.1 >nul
start "" "index.html"
goto END

:END
echo.
echo =========================================================
echo   InicializaÃ§Ã£o concluÃ­da!
echo =========================================================
echo.
ping -n 4 127.0.0.1 >nul
