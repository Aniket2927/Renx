# AI Backend Startup Script
$env:PYTHONPATH = "."
if (Test-Path "venv/Scripts/Activate.ps1") {
    . ./venv/Scripts/Activate.ps1
} else {
    Write-Host "Virtual environment not found. Please set up the Python environment first."
    exit 1
}

# Set environment variables
$env:FLASK_ENV = "development"
$env:PORT = "8181"

# Start the FastAPI server
python main.py 