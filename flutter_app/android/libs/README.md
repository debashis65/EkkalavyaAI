# Unity AR Libraries

Place your Unity AR .aar files here after exporting from Unity.

## Required Files:
1. **UnityARProject.aar** - Main Unity AR module from Unity export
2. **unityLibrary.aar** - Unity core library 
3. Any additional Unity plugin .aar files

## Export Instructions:
1. Open Unity 2022 LTS
2. Open your UnityARProject
3. File → Build Settings
4. Platform: Android
5. Export Project: ✓
6. Export to folder
7. Copy generated .aar files to this directory

## Note:
These .aar files are required for the Flutter Unity widget to work properly.
The app will build but Unity AR features won't work without these files.