#!/usr/bin/env python3
"""
Ekkalavya Sports AI Backend Launcher
Installs dependencies and starts the real computer vision backend
"""

import subprocess
import sys
import os

def install_dependencies():
    """Install required Python packages"""
    packages = [
        "fastapi==0.104.1",
        "uvicorn[standard]==0.24.0", 
        "python-multipart",
        "pydantic==2.5.0",
        "opencv-python-headless==4.8.1.78",
        "mediapipe==0.10.8",
        "numpy==1.24.4",
        "pillow==10.1.0",
        "websockets==12.0",
        "aiofiles==23.2.0"
    ]
    
    print("Installing AI backend dependencies...")
    for package in packages:
        try:
            if "numpy" in package:
                # Handle numpy installation specifically
                subprocess.check_call([sys.executable, "-m", "pip", "install", "--force-reinstall", "--no-deps", package])
            else:
                subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"✓ Installed {package}")
        except subprocess.CalledProcessError as e:
            print(f"✗ Failed to install {package}: {e}")
            # Continue with other packages even if one fails
            continue
    
    return True

def start_backend():
    """Start the FastAPI backend server"""
    print("Starting Ekkalavya Sports AI Backend...")
    try:
        # Change to ai_backend directory
        os.chdir("ai_backend")
        
        # Start uvicorn server
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000",
            "--reload"
        ])
    except KeyboardInterrupt:
        print("\nBackend stopped by user")
    except Exception as e:
        print(f"Error starting backend: {e}")

if __name__ == "__main__":
    print("Ekkalavya Sports AI Backend - Real Computer Vision Analysis")
    print("=" * 60)
    
    if install_dependencies():
        print("\n" + "=" * 60)
        start_backend()
    else:
        print("Failed to install dependencies. Exiting.")
        sys.exit(1)