# 🚀 Deploy Ekalavya AI to Render

## Quick Deployment Steps

### 1. **Prepare Your Repository**
```bash
# Make sure all files are committed
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2. **Create Render Account**
- Go to [render.com](https://render.com)
- Sign up with your GitHub account
- Connect your repository

### 3. **Deploy the Database First**
- Click "New +" → "PostgreSQL"
- Name: `ekalavya-db`
- Plan: Free tier
- Copy the **Database URL** when created

### 4. **Deploy AI Backend**
- Click "New +" → "Web Service"
- Connect your GitHub repo
- Settings:
  ```
  Name: ekalavya-ai-backend
  Environment: Python 3
  Build Command: cd ai_backend && pip install -r requirements.txt
  Start Command: cd ai_backend && python -m uvicorn main:app --host 0.0.0.0 --port $PORT
  ```
- Environment Variables:
  ```
  PORT = 10000
  PYTHONPATH = /opt/render/project/src/ai_backend
  ```

### 5. **Deploy Main Platform**
- Click "New +" → "Web Service"
- Connect your GitHub repo
- Settings:
  ```
  Name: ekalavya-platform
  Environment: Node
  Build Command: npm install && npm run build
  Start Command: npm run start
  ```
- Environment Variables:
  ```
  NODE_ENV = production
  DATABASE_URL = [paste from step 3]
  AI_BACKEND_URL = https://ekalavya-ai-backend.onrender.com
  ```

## 🔧 Configuration Files Created

### ✅ render.yaml
Automatic deployment configuration for all services

### ✅ ai_backend/requirements.txt
Python dependencies optimized for Render:
- `opencv-python-headless` (lighter version for server)
- FastAPI, MediaPipe, NumPy
- WebSocket support

### ✅ Package.json
Already configured with proper build scripts

## 🌐 Your URLs After Deployment

- **Main App**: `https://ekalavya-platform.onrender.com`
- **AI Backend**: `https://ekalavya-ai-backend.onrender.com`
- **API Docs**: `https://ekalavya-ai-backend.onrender.com/docs`

## 🎯 Testing Your Deployment

1. **Check Main App**
   - Visit your main URL
   - Login with: `athlete@example.com` / `password123`
   - Navigate to AR Tools page

2. **Test AI Features**
   - Click "Upload Video" - should connect to AI backend
   - Click "Start Analysis" - should activate camera analysis
   - Check browser console for connection status

3. **Verify Database**
   - User profiles should persist
   - Session data should save

## 🔧 Troubleshooting

### If AI Backend Fails:
- Check build logs in Render dashboard
- Verify `requirements.txt` is in `ai_backend/` folder
- Ensure `PYTHONPATH` environment variable is set

### If Frontend Fails:
- Check `DATABASE_URL` is properly set
- Verify `AI_BACKEND_URL` points to your AI service
- Check build logs for missing dependencies

### If Database Connection Fails:
- Copy exact connection string from Render PostgreSQL dashboard
- Ensure no extra spaces in `DATABASE_URL`

## 💡 Pro Tips

1. **Free Tier Limitations**:
   - Services sleep after 15 minutes of inactivity
   - First request may be slow (cold start)
   - 750 hours/month limit

2. **Performance Optimization**:
   - Upgrade to paid plans for better performance
   - Consider using Redis for session storage
   - Optimize AI model loading times

3. **Monitoring**:
   - Check Render logs for errors
   - Use browser dev tools to debug frontend issues
   - Monitor AI backend response times

## 🎉 Success!

Your Ekalavya AI Sports Training Platform is now live on Render with:
- ✅ Real AI-powered video analysis
- ✅ User authentication and profiles  
- ✅ Multi-sport training tools
- ✅ AR analysis capabilities
- ✅ Coach-athlete connections

Share your live URL and start training athletes worldwide! 🏆