@echo off
REM ============================================================================
REM IPFS Auto-Setup Script for Windows
REM This script automatically installs and configures IPFS with retry logic
REM ============================================================================

setlocal enabledelayedexpansion

echo ============================================================================
echo IPFS Automatic Setup for Blockchain Evidence Locker
echo ============================================================================
echo.

REM Configuration
set IPFS_VERSION=0.28.0
set IPFS_URL=https://dist.ipfs.tech/kubo/v%IPFS_VERSION%/kubo_v%IPFS_VERSION%_windows-amd64.zip
set INSTALL_DIR=%ProgramFiles%\ipfs
set TEMP_DIR=%TEMP%\ipfs-setup
set MAX_RETRIES=5
set RETRY_DELAY=5

REM Create temp directory
if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"

REM ============================================================================
REM Function: Check if IPFS is already installed
REM ============================================================================
:check_ipfs
echo [1/7] Checking if IPFS is already installed...
where ipfs >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] IPFS is already installed!
    ipfs version
    goto :init_ipfs
) else (
    echo [INFO] IPFS not found. Proceeding with installation...
    goto :check_chocolatey
)

REM ============================================================================
REM Function: Try Chocolatey installation first (easiest method)
REM ============================================================================
:check_chocolatey
echo.
echo [2/7] Attempting Chocolatey installation method...
where choco >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Chocolatey found. Installing IPFS via Chocolatey...
    choco install ipfs -y
    if %errorlevel% equ 0 (
        echo [SUCCESS] IPFS installed via Chocolatey!
        goto :init_ipfs
    ) else (
        echo [WARNING] Chocolatey installation failed. Trying manual method...
        goto :manual_install
    )
) else (
    echo [INFO] Chocolatey not found. Trying manual installation...
    goto :manual_install
)

REM ============================================================================
REM Function: Manual installation with retry logic
REM ============================================================================
:manual_install
echo.
echo [3/7] Starting manual IPFS installation...
set RETRY_COUNT=0

:download_retry
set /a RETRY_COUNT+=1
echo [ATTEMPT %RETRY_COUNT%/%MAX_RETRIES%] Downloading IPFS...

REM Download using PowerShell
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%IPFS_URL%' -OutFile '%TEMP_DIR%\ipfs.zip'}"

if %errorlevel% equ 0 (
    echo [SUCCESS] Download completed!
    goto :extract_ipfs
) else (
    echo [ERROR] Download failed!
    if %RETRY_COUNT% lss %MAX_RETRIES% (
        echo [INFO] Retrying in %RETRY_DELAY% seconds...
        timeout /t %RETRY_DELAY% /nobreak >nul
        goto :download_retry
    ) else (
        echo [FATAL] Maximum retry attempts reached. Installation failed.
        goto :error_exit
    )
)

REM ============================================================================
REM Function: Extract IPFS
REM ============================================================================
:extract_ipfs
echo.
echo [4/7] Extracting IPFS...
powershell -Command "& {Expand-Archive -Path '%TEMP_DIR%\ipfs.zip' -DestinationPath '%TEMP_DIR%' -Force}"

if %errorlevel% equ 0 (
    echo [SUCCESS] Extraction completed!
    goto :install_ipfs
) else (
    echo [ERROR] Extraction failed!
    goto :error_exit
)

REM ============================================================================
REM Function: Install IPFS to Program Files
REM ============================================================================
:install_ipfs
echo.
echo [5/7] Installing IPFS to %INSTALL_DIR%...

REM Create installation directory
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

REM Copy ipfs.exe to installation directory
copy /Y "%TEMP_DIR%\kubo\ipfs.exe" "%INSTALL_DIR%\ipfs.exe"

if %errorlevel% equ 0 (
    echo [SUCCESS] IPFS copied to installation directory!
    goto :add_to_path
) else (
    echo [ERROR] Failed to copy IPFS executable!
    goto :error_exit
)

REM ============================================================================
REM Function: Add IPFS to PATH
REM ============================================================================
:add_to_path
echo.
echo [6/7] Adding IPFS to system PATH...

REM Check if already in PATH
echo %PATH% | find /i "%INSTALL_DIR%" >nul
if %errorlevel% equ 0 (
    echo [INFO] IPFS directory already in PATH
    goto :init_ipfs
)

REM Add to PATH using PowerShell (requires admin)
powershell -Command "& {[Environment]::SetEnvironmentVariable('Path', [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';%INSTALL_DIR%', 'Machine')}"

if %errorlevel% equ 0 (
    echo [SUCCESS] IPFS added to PATH!
    REM Update current session PATH
    set "PATH=%PATH%;%INSTALL_DIR%"
    goto :init_ipfs
) else (
    echo [WARNING] Could not add to PATH automatically. Please add manually:
    echo %INSTALL_DIR%
    REM Still try to continue with manual PATH for this session
    set "PATH=%PATH%;%INSTALL_DIR%"
    goto :init_ipfs
)

REM ============================================================================
REM Function: Initialize IPFS repository
REM ============================================================================
:init_ipfs
echo.
echo [7/7] Initializing IPFS repository...

REM Check if already initialized
if exist "%USERPROFILE%\.ipfs\config" (
    echo [INFO] IPFS repository already initialized
    goto :configure_ipfs
)

REM Initialize with retry logic
set INIT_RETRY=0
:init_retry
set /a INIT_RETRY+=1
echo [ATTEMPT %INIT_RETRY%/%MAX_RETRIES%] Initializing IPFS...

ipfs init

if %errorlevel% equ 0 (
    echo [SUCCESS] IPFS repository initialized!
    goto :configure_ipfs
) else (
    if %INIT_RETRY% lss %MAX_RETRIES% (
        echo [WARNING] Initialization failed. Retrying in %RETRY_DELAY% seconds...
        timeout /t %RETRY_DELAY% /nobreak >nul
        goto :init_retry
    ) else (
        echo [ERROR] Failed to initialize IPFS repository
        goto :error_exit
    )
)

REM ============================================================================
REM Function: Configure IPFS for local development
REM ============================================================================
:configure_ipfs
echo.
echo ============================================================================
echo Configuring IPFS for local development...
echo ============================================================================

REM Set API and Gateway addresses
ipfs config Addresses.API /ip4/127.0.0.1/tcp/5001
ipfs config Addresses.Gateway /ip4/127.0.0.1/tcp/8080

REM Enable CORS for local development
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "[\"http://localhost:3000\", \"http://127.0.0.1:3000\", \"http://localhost:5000\", \"http://127.0.0.1:5000\"]"
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods "[\"PUT\", \"POST\", \"GET\"]"

echo [SUCCESS] IPFS configured for local development!

REM ============================================================================
REM Function: Start IPFS daemon with retry logic
REM ============================================================================
:start_daemon
echo.
echo ============================================================================
echo Starting IPFS daemon...
echo ============================================================================

REM Check if daemon is already running
netstat -ano | findstr ":5001" >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] Port 5001 is already in use. IPFS daemon may already be running.
    echo [INFO] Attempting to stop existing daemon...
    taskkill /F /IM ipfs.exe >nul 2>&1
    timeout /t 3 /nobreak >nul
)

set DAEMON_RETRY=0
:daemon_retry
set /a DAEMON_RETRY+=1
echo [ATTEMPT %DAEMON_RETRY%/%MAX_RETRIES%] Starting IPFS daemon...

REM Start daemon in background
start "IPFS Daemon" /MIN ipfs daemon

REM Wait for daemon to start
timeout /t 5 /nobreak >nul

REM Verify daemon is running
curl -s http://127.0.0.1:5001`${process.env.NEXT_PUBLIC_API_URL}/api/v0/version >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] IPFS daemon is running!
    goto :verify_installation
) else (
    if %DAEMON_RETRY% lss %MAX_RETRIES% (
        echo [WARNING] Daemon not responding. Retrying in %RETRY_DELAY% seconds...
        taskkill /F /IM ipfs.exe >nul 2>&1
        timeout /t %RETRY_DELAY% /nobreak >nul
        goto :daemon_retry
    ) else (
        echo [ERROR] Failed to start IPFS daemon
        goto :error_exit
    )
)

REM ============================================================================
REM Function: Verify installation and test
REM ============================================================================
:verify_installation
echo.
echo ============================================================================
echo Verifying IPFS installation...
echo ============================================================================

REM Get IPFS version
echo [TEST 1/3] Checking IPFS version...
ipfs version
if %errorlevel% neq 0 (
    echo [ERROR] IPFS version check failed
    goto :error_exit
)

REM Check daemon status
echo.
echo [TEST 2/3] Checking daemon status...
curl -s http://127.0.0.1:5001`${process.env.NEXT_PUBLIC_API_URL}/api/v0/version
if %errorlevel% neq 0 (
    echo [ERROR] Daemon is not responding
    goto :error_exit
)

REM Test file upload
echo.
echo [TEST 3/3] Testing file upload...
echo Hello from Blockchain Evidence Locker > "%TEMP_DIR%\test.txt"
ipfs add "%TEMP_DIR%\test.txt"
if %errorlevel% equ 0 (
    echo [SUCCESS] File upload test passed!
) else (
    echo [ERROR] File upload test failed
    goto :error_exit
)

goto :success_exit

REM ============================================================================
REM Success Exit
REM ============================================================================
:success_exit
echo.
echo ============================================================================
echo IPFS INSTALLATION COMPLETED SUCCESSFULLY!
echo ============================================================================
echo.
echo IPFS is now running and ready to use!
echo.
echo Important Information:
echo - IPFS Daemon is running on: http://127.0.0.1:5001
echo - IPFS Gateway is running on: http://127.0.0.1:8080
echo - Installation Directory: %INSTALL_DIR%
echo - Repository Location: %USERPROFILE%\.ipfs
echo.
echo Next Steps:
echo 1. Keep this window open (IPFS daemon is running)
echo 2. Start your backend server: cd backend ^&^& npm start
echo 3. Start your frontend: npm run dev
echo 4. Access the application at: http://localhost:3000
echo.
echo To stop IPFS daemon: Press Ctrl+C or run: taskkill /F /IM ipfs.exe
echo To restart IPFS daemon: Run: ipfs daemon
echo.
echo ============================================================================

REM Cleanup
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"

REM Keep window open to show daemon logs
echo.
echo IPFS daemon is running. Press any key to stop and exit...
pause >nul
taskkill /F /IM ipfs.exe >nul 2>&1
exit /b 0

REM ============================================================================
REM Error Exit
REM ============================================================================
:error_exit
echo.
echo ============================================================================
echo IPFS INSTALLATION FAILED!
echo ============================================================================
echo.
echo Troubleshooting steps:
echo 1. Run this script as Administrator
echo 2. Check your internet connection
echo 3. Disable antivirus temporarily
echo 4. Try manual installation from: https://dist.ipfs.tech/#kubo
echo.
echo For support, visit: https://docs.ipfs.tech/install/
echo.
echo ============================================================================

REM Cleanup
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"

pause
exit /b 1
