@echo off
setlocal
cd /d "%~dp0"
set "MESA_NODE=node.exe"
where node.exe >nul 2>nul
if errorlevel 1 set "MESA_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
echo Abra http://127.0.0.1:4178/ no navegador.
"%MESA_NODE%" servir.mjs
pause

