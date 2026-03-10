# ============================================================================
# IPFS Auto-Setup Script for Windows (PowerShell)
# This script automatically installs and configures IPFS with retry logic
# ============================================================================

param(
    [int]$MaxRetries = 5,
    [int]$RetryDelay = 5,
    [string]$IpfsVersion = "0.28.0"
)

# Configuration
$ErrorActionPreference = "Stop"
$IpfsUrl = "https://dist.ipfs.tech/kubo/v$IpfsVersion/kubo_v${IpfsVersion}_windows-amd64.zip"
$InstallDir = "$env:ProgramFiles\ipfs"
$TempDir = "$env:TEMP\ipfs-setup"

# Colors for output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Success { param([string]$Message) Write-ColorOutput "✓ $Message" "Green" }
function Write-Info { param([string]$Message) Write-ColorOutput "ℹ $Message" "Cyan" }
function Write-Warning { param([string]$Message) Write-ColorOutput "⚠ $Message" "Yellow" }
function Write-Error { param([string]$Message) Write-ColorOutput "✗ $Message" "Red" }

# ============================================================================
# Main Script
# ============================================================================

Write-ColorOutput "`n============================================================================" "Cyan"
Write-ColorOutput "IPFS Automatic Setup for Blockchain Evidence Locker" "Cyan"
Write-ColorOutput "============================================================================`n" "Cyan"

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Warning "Not running as Administrator. Some features may not work."
    Write-Info "Attempting to restart with elevated privileges..."
    
    try {
        Start-Process powershell.exe "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
        exit
    } catch {
        Write-Warning "Could not elevate privileges. Continuing anyway..."
    }
}

# Create temp directory
if (-not (Test-Path $TempDir)) {
    New-Item -ItemType Directory -Path $TempDir -Force | Out-Null
}

# ============================================================================
# Function: Check if IPFS is already installed
# ============================================================================
function Test-IpfsInstalled {
    Write-Info "[1/7] Checking if IPFS is already installed..."
    
    try {
        $ipfsPath = Get-Command ipfs -ErrorAction SilentlyContinue
        if ($ipfsPath) {
            Write-Success "IPFS is already installed!"
            & ipfs version
            return $true
        }
    } catch {
        Write-Info "IPFS not found. Proceeding with installation..."
    }
    return $false
}

# ============================================================================
# Function: Try Chocolatey installation
# ============================================================================
function Install-IpfsViaChocolatey {
    Write-Info "`n[2/7] Attempting Chocolatey installation method..."
    
    try {
        $chocoPath = Get-Command choco -ErrorAction SilentlyContinue
        if ($chocoPath) {
            Write-Info "Chocolatey found. Installing IPFS via Chocolatey..."
            & choco install ipfs -y
            
            if ($LASTEXITCODE -eq 0) {
                Write-Success "IPFS installed via Chocolatey!"
                return $true
            } else {
                Write-Warning "Chocolatey installation failed. Trying manual method..."
            }
        } else {
            Write-Info "Chocolatey not found. Trying manual installation..."
        }
    } catch {
        Write-Warning "Chocolatey installation failed: $_"
    }
    return $false
}

# ============================================================================
# Function: Download IPFS with retry logic
# ============================================================================
function Get-IpfsDownload {
    Write-Info "`n[3/7] Starting manual IPFS installation..."
    
    for ($i = 1; $i -le $MaxRetries; $i++) {
        Write-Info "[ATTEMPT $i/$MaxRetries] Downloading IPFS..."
        
        try {
            [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
            $zipPath = Join-Path $TempDir "ipfs.zip"
            
            Invoke-WebRequest -Uri $IpfsUrl -OutFile $zipPath -UseBasicParsing
            
            if (Test-Path $zipPath) {
                Write-Success "Download completed!"
                return $zipPath
            }
        } catch {
            Write-Error "Download failed: $_"
            
            if ($i -lt $MaxRetries) {
                Write-Info "Retrying in $RetryDelay seconds..."
                Start-Sleep -Seconds $RetryDelay
            }
        }
    }
    
    throw "Maximum retry attempts reached. Download failed."
}

# ============================================================================
# Function: Extract and Install IPFS
# ============================================================================
function Install-IpfsManually {
    param([string]$ZipPath)
    
    Write-Info "`n[4/7] Extracting IPFS..."
    
    try {
        Expand-Archive -Path $ZipPath -DestinationPath $TempDir -Force
        Write-Success "Extraction completed!"
    } catch {
        throw "Extraction failed: $_"
    }
    
    Write-Info "`n[5/7] Installing IPFS to $InstallDir..."
    
    try {
        if (-not (Test-Path $InstallDir)) {
            New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
        }
        
        $sourceExe = Join-Path $TempDir "kubo\ipfs.exe"
        $destExe = Join-Path $InstallDir "ipfs.exe"
        
        Copy-Item -Path $sourceExe -Destination $destExe -Force
        Write-Success "IPFS copied to installation directory!"
    } catch {
        throw "Installation failed: $_"
    }
}

# ============================================================================
# Function: Add IPFS to PATH
# ============================================================================
function Add-IpfsToPath {
    Write-Info "`n[6/7] Adding IPFS to system PATH..."
    
    try {
        $currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
        
        if ($currentPath -like "*$InstallDir*") {
            Write-Info "IPFS directory already in PATH"
            return
        }
        
        $newPath = "$currentPath;$InstallDir"
        [Environment]::SetEnvironmentVariable("Path", $newPath, "Machine")
        
        # Update current session
        $env:Path = "$env:Path;$InstallDir"
        
        Write-Success "IPFS added to PATH!"
    } catch {
        Write-Warning "Could not add to PATH automatically. Please add manually: $InstallDir"
        # Still update current session
        $env:Path = "$env:Path;$InstallDir"
    }
}

# ============================================================================
# Function: Initialize IPFS repository
# ============================================================================
function Initialize-IpfsRepo {
    Write-Info "`n[7/7] Initializing IPFS repository..."
    
    $ipfsPath = Join-Path $env:USERPROFILE ".ipfs"
    $configPath = Join-Path $ipfsPath "config"
    
    if (Test-Path $configPath) {
        Write-Info "IPFS repository already initialized"
        return
    }
    
    for ($i = 1; $i -le $MaxRetries; $i++) {
        Write-Info "[ATTEMPT $i/$MaxRetries] Initializing IPFS..."
        
        try {
            & ipfs init
            
            if ($LASTEXITCODE -eq 0) {
                Write-Success "IPFS repository initialized!"
                return
            }
        } catch {
            Write-Warning "Initialization failed: $_"
        }
        
        if ($i -lt $MaxRetries) {
            Write-Info "Retrying in $RetryDelay seconds..."
            Start-Sleep -Seconds $RetryDelay
        }
    }
    
    throw "Failed to initialize IPFS repository"
}

# ============================================================================
# Function: Configure IPFS for local development
# ============================================================================
function Set-IpfsConfiguration {
    Write-Info "`n============================================================================"
    Write-Info "Configuring IPFS for local development..."
    Write-Info "============================================================================`n"
    
    try {
        # Set API and Gateway addresses
        & ipfs config Addresses.API /ip4/127.0.0.1/tcp/5001
        & ipfs config Addresses.Gateway /ip4/127.0.0.1/tcp/8080
        
        # Enable CORS for local development
        & ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '[\"http://localhost:3000\", \"http://127.0.0.1:3000\", \"http://localhost:5000\", \"http://127.0.0.1:5000\"]'
        & ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '[\"PUT\", \"POST\", \"GET\"]'
        
        Write-Success "IPFS configured for local development!"
    } catch {
        Write-Warning "Configuration failed: $_"
    }
}

# ============================================================================
# Function: Start IPFS daemon
# ============================================================================
function Start-IpfsDaemon {
    Write-Info "`n============================================================================"
    Write-Info "Starting IPFS daemon..."
    Write-Info "============================================================================`n"
    
    # Check if daemon is already running
    $existingProcess = Get-NetTCPConnection -LocalPort 5001 -ErrorAction SilentlyContinue
    if ($existingProcess) {
        Write-Warning "Port 5001 is already in use. IPFS daemon may already be running."
        Write-Info "Attempting to stop existing daemon..."
        Stop-Process -Name ipfs -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 3
    }
    
    for ($i = 1; $i -le $MaxRetries; $i++) {
        Write-Info "[ATTEMPT $i/$MaxRetries] Starting IPFS daemon..."
        
        try {
            # Start daemon in background
            Start-Process -FilePath "ipfs" -ArgumentList "daemon" -WindowStyle Minimized
            
            # Wait for daemon to start
            Start-Sleep -Seconds 5
            
            # Verify daemon is running
            $response = Invoke-WebRequest -Uri "http://127.0.0.1:5001`${process.env.NEXT_PUBLIC_API_URL}/api/v0/version" -UseBasicParsing -ErrorAction SilentlyContinue
            
            if ($response.StatusCode -eq 200) {
                Write-Success "IPFS daemon is running!"
                return $true
            }
        } catch {
            Write-Warning "Daemon not responding: $_"
        }
        
        if ($i -lt $MaxRetries) {
            Write-Info "Retrying in $RetryDelay seconds..."
            Stop-Process -Name ipfs -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds $RetryDelay
        }
    }
    
    throw "Failed to start IPFS daemon"
}

# ============================================================================
# Function: Verify installation
# ============================================================================
function Test-IpfsInstallation {
    Write-Info "`n============================================================================"
    Write-Info "Verifying IPFS installation..."
    Write-Info "============================================================================`n"
    
    # Test 1: Version check
    Write-Info "[TEST 1/3] Checking IPFS version..."
    & ipfs version
    
    # Test 2: Daemon status
    Write-Info "`n[TEST 2/3] Checking daemon status..."
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:5001`${process.env.NEXT_PUBLIC_API_URL}/api/v0/version" -UseBasicParsing
        Write-Success "Daemon is responding!"
    } catch {
        throw "Daemon is not responding"
    }
    
    # Test 3: File upload
    Write-Info "`n[TEST 3/3] Testing file upload..."
    $testFile = Join-Path $TempDir "test.txt"
    "Hello from Blockchain Evidence Locker" | Out-File -FilePath $testFile -Encoding UTF8
    
    & ipfs add $testFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "File upload test passed!"
    } else {
        throw "File upload test failed"
    }
}

# ============================================================================
# Main Execution
# ============================================================================

try {
    # Check if already installed
    if (Test-IpfsInstalled) {
        Initialize-IpfsRepo
        Set-IpfsConfiguration
        Start-IpfsDaemon
        Test-IpfsInstallation
    }
    # Try Chocolatey installation
    elseif (Install-IpfsViaChocolatey) {
        # Refresh environment variables
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
        Initialize-IpfsRepo
        Set-IpfsConfiguration
        Start-IpfsDaemon
        Test-IpfsInstallation
    }
    # Manual installation
    else {
        $zipPath = Get-IpfsDownload
        Install-IpfsManually -ZipPath $zipPath
        Add-IpfsToPath
        Initialize-IpfsRepo
        Set-IpfsConfiguration
        Start-IpfsDaemon
        Test-IpfsInstallation
    }
    
    # Success message
    Write-ColorOutput "`n============================================================================" "Green"
    Write-ColorOutput "IPFS INSTALLATION COMPLETED SUCCESSFULLY!" "Green"
    Write-ColorOutput "============================================================================`n" "Green"
    
    Write-Info "IPFS is now running and ready to use!`n"
    Write-Info "Important Information:"
    Write-Info "- IPFS Daemon is running on: http://127.0.0.1:5001"
    Write-Info "- IPFS Gateway is running on: http://127.0.0.1:8080"
    Write-Info "- Installation Directory: $InstallDir"
    Write-Info "- Repository Location: $env:USERPROFILE\.ipfs`n"
    
    Write-Info "Next Steps:"
    Write-Info "1. Keep this window open (IPFS daemon is running)"
    Write-Info "2. Start your backend server: cd backend && npm start"
    Write-Info "3. Start your frontend: npm run dev"
    Write-Info "4. Access the application at: http://localhost:3000`n"
    
    Write-Info "To stop IPFS daemon: Stop-Process -Name ipfs"
    Write-Info "To restart IPFS daemon: ipfs daemon`n"
    Write-ColorOutput "============================================================================`n" "Green"
    
    # Keep window open
    Write-Info "IPFS daemon is running. Press any key to stop and exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Stop-Process -Name ipfs -Force -ErrorAction SilentlyContinue
    
} catch {
    Write-ColorOutput "`n============================================================================" "Red"
    Write-ColorOutput "IPFS INSTALLATION FAILED!" "Red"
    Write-ColorOutput "============================================================================`n" "Red"
    
    Write-Error $_.Exception.Message
    
    Write-Info "`nTroubleshooting steps:"
    Write-Info "1. Run this script as Administrator"
    Write-Info "2. Check your internet connection"
    Write-Info "3. Disable antivirus temporarily"
    Write-Info "4. Try manual installation from: https://dist.ipfs.tech/#kubo`n"
    Write-Info "For support, visit: https://docs.ipfs.tech/install/`n"
    Write-ColorOutput "============================================================================`n" "Red"
    
    Read-Host "Press Enter to exit"
    exit 1
} finally {
    # Cleanup
    if (Test-Path $TempDir) {
        Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}
