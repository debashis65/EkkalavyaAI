#!/usr/bin/env python3
"""
Startup script for Ekalavya AI Backend
"""
import subprocess
import sys
import os

def start_backend():
    print("🚀 Starting Ekalavya AI Backend...")
    print("✓ Basketball Analysis Ready")
    print("✓ Archery Analysis Ready") 
    print("✓ Real-time Processing Available")
    print("\n🌐 Backend will be available at: http://localhost:8000")
    print("📊 Health check: http://localhost:8000/health")
    print("🏀 Sports API: http://localhost:8000/api/sports")
    
    # Change to ai_backend directory
    os.chdir('ai_backend')
    
    # Start the FastAPI server
    port = os.environ.get('PORT', '8000')
    reload_flag = "--reload" if os.environ.get('NODE_ENV') != 'production' else ""
    
    cmd = [
        sys.executable, "-m", "uvicorn", 
        "main:app", 
        "--host", "0.0.0.0", 
        "--port", port
    ]
    
    if reload_flag:
        cmd.append(reload_flag)
        
    subprocess.run(cmd)

if __name__ == "__main__":
    start_backend()