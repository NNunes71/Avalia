@echo off
REM ============================================================
REM  Aprova! - abrir a app num servidor local (recomendado)
REM  Assim funcionam: leitura de PDF, geracao por IA (CORS), etc.
REM ============================================================
cd /d "%~dp0"
set PORT=8731
echo A iniciar o servidor local na porta %PORT% ...
echo (Deixa esta janela aberta enquanto usas a app. Fecha-a para parar.)
where python >nul 2>nul
if %errorlevel%==0 (
  python server.py --port %PORT%
) else (
  py server.py --port %PORT%
)
pause
