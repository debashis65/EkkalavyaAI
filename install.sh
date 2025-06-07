#!/bin/bash

# Ekalavya AI Sports Training Platform Installation Script
echo "🏆 Installing Ekalavya AI Sports Training Platform..."
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Please install Python 3.8+ first."
    exit 1
fi

echo "✅ Node.js and Python found"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install Python dependencies for AI backend
echo "🤖 Installing AI backend dependencies..."
cd ai_backend
pip3 install -r requirements.txt 2>/dev/null || pip3 install fastapi uvicorn opencv-python mediapipe numpy
cd ..

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚙️  Creating environment configuration..."
    cat > .env << EOL
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/ekalavya

# AI Backend Configuration
AI_BACKEND_URL=http://localhost:8000

# Frontend Configuration
VITE_API_URL=http://localhost:5000
VITE_AI_BACKEND_URL=http://localhost:8000
EOL
    echo "✅ Environment file created (.env)"
fi

# Create startup scripts
echo "🚀 Creating startup scripts..."

# Frontend startup script
cat > start_frontend.sh << 'EOL'
#!/bin/bash
echo "🌐 Starting Ekalavya Frontend..."
npm run dev
EOL

# AI Backend startup script
cat > start_ai_backend.sh << 'EOL'
#!/bin/bash
echo "🤖 Starting Ekalavya AI Backend..."
cd ai_backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
EOL

# Complete startup script
cat > start_ekalavya.sh << 'EOL'
#!/bin/bash
echo "🏆 Starting Ekalavya AI Sports Training Platform..."
echo "=================================================="

# Start AI Backend in background
echo "🤖 Starting AI Backend..."
cd ai_backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
AI_PID=$!
cd ..

# Wait for AI backend to start
sleep 3

# Start Frontend
echo "🌐 Starting Frontend..."
npm run dev &
FRONTEND_PID=$!

echo "✅ Platform started successfully!"
echo "📱 Frontend: http://localhost:5000"
echo "🤖 AI Backend: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap 'echo "Stopping services..."; kill $AI_PID $FRONTEND_PID; exit' SIGINT
wait
EOL

# Make scripts executable
chmod +x start_frontend.sh
chmod +x start_ai_backend.sh
chmod +x start_ekalavya.sh

# Create requirements.txt for AI backend if it doesn't exist
if [ ! -f ai_backend/requirements.txt ]; then
    echo "📋 Creating AI backend requirements..."
    cat > ai_backend/requirements.txt << EOL
fastapi==0.104.1
uvicorn==0.24.0
opencv-python==4.8.1.78
mediapipe==0.10.7
numpy==1.24.3
python-multipart==0.0.6
pydantic==2.5.0
websockets==12.0
EOL
fi

echo ""
echo "🎉 Installation Complete!"
echo "========================"
echo ""
echo "📋 Available Commands:"
echo "  ./start_ekalavya.sh     - Start complete platform (recommended)"
echo "  ./start_frontend.sh     - Start frontend only"
echo "  ./start_ai_backend.sh   - Start AI backend only"
echo ""
echo "🌐 Access URLs:"
echo "  Frontend: http://localhost:5000"
echo "  AI Backend: http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo ""
echo "🚀 To start the platform now, run:"
echo "  ./start_ekalavya.sh"
echo ""
echo "✨ Happy training with Ekalavya AI!"