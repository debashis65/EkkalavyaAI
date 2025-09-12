using System;
using System.Collections;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;
using Unity.XR.CoreUtils;

namespace EkkalavyaAR.AR
{
    public class ARBootstrap : MonoBehaviour
    {
        [Header("AR References")]
        [SerializeField] private XROrigin xrOrigin;
        [SerializeField] private ARSession arSession;
        [SerializeField] private ARPlaneManager arPlaneManager;
        [SerializeField] private ARRaycastManager arRaycastManager;
        [SerializeField] private ARCameraManager arCameraManager;
        [SerializeField] private AROcclusionManager arOcclusionManager;
        [SerializeField] private ARPointCloudManager arPointCloudManager;
        
        [Header("Permission UI")]
        [SerializeField] private GameObject permissionPanel;
        [SerializeField] private GameObject loadingPanel;
        [SerializeField] private GameObject errorPanel;
        
        public static ARBootstrap Instance { get; private set; }
        
        // Events
        public event Action OnARSessionReady;
        public event Action<string> OnARError;
        public event Action<ARSessionState> OnARSessionStateChanged;
        
        // Properties
        public XROrigin SessionOrigin => xrOrigin;
        public ARSession Session => arSession;
        public ARPlaneManager PlaneManager => arPlaneManager;
        public ARRaycastManager RaycastManager => arRaycastManager;
        public ARCameraManager CameraManager => arCameraManager;
        public AROcclusionManager OcclusionManager => arOcclusionManager;
        public ARPointCloudManager PointCloudManager => arPointCloudManager;
        
        public bool IsARReady { get; private set; }
        public ARSessionState CurrentSessionState { get; private set; }
        
        private bool permissionRequested = false;
        private bool cameraPermissionGranted = false;
        private bool microphonePermissionGranted = false;
        
        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
            }
            else
            {
                Destroy(gameObject);
                return;
            }
        }
        
        private void Start()
        {
            StartCoroutine(InitializeAR());
        }
        
        private void OnEnable()
        {
            if (arSession != null)
            {
                ARSession.stateChanged += OnSessionStateChanged;
            }
        }
        
        private void OnDisable()
        {
            ARSession.stateChanged -= OnSessionStateChanged;
        }
        
        private IEnumerator InitializeAR()
        {
            loadingPanel?.SetActive(true);
            
            // Request permissions
            yield return StartCoroutine(RequestPermissions());
            
            if (!cameraPermissionGranted)
            {
                ShowError("Camera permission is required for AR functionality");
                yield break;
            }
            
            // Initialize AR components
            yield return StartCoroutine(SetupARComponents());
            
            // Wait for AR session to be ready
            yield return StartCoroutine(WaitForARSessionReady());
            
            IsARReady = true;
            OnARSessionReady?.Invoke();
            
            loadingPanel?.SetActive(false);
            
            Debug.Log("AR Bootstrap initialization complete");
        }
        
        private IEnumerator RequestPermissions()
        {
            if (permissionRequested) yield break;
            
            permissionRequested = true;
            
            // Request camera permission
            if (!Application.HasUserAuthorization(UserAuthorization.Camera))
            {
                permissionPanel?.SetActive(true);
                
                // Request camera permission
                #if UNITY_ANDROID
                if (!UnityEngine.Android.Permission.HasUserAuthorizedPermission("android.permission.CAMERA"))
                {
                    UnityEngine.Android.Permission.RequestUserPermission("android.permission.CAMERA");
                    
                    // Wait for permission response
                    float timeout = 10f;
                    while (!UnityEngine.Android.Permission.HasUserAuthorizedPermission("android.permission.CAMERA") && timeout > 0)
                    {
                        timeout -= Time.deltaTime;
                        yield return null;
                    }
                    
                    cameraPermissionGranted = UnityEngine.Android.Permission.HasUserAuthorizedPermission("android.permission.CAMERA");
                }
                else
                {
                    cameraPermissionGranted = true;
                }
                #elif UNITY_IOS
                yield return Application.RequestUserAuthorization(UserAuthorization.Camera);
                cameraPermissionGranted = Application.HasUserAuthorization(UserAuthorization.Camera);
                #else
                cameraPermissionGranted = true;
                #endif
                
                permissionPanel?.SetActive(false);
            }
            else
            {
                cameraPermissionGranted = true;
            }
            
            // Request microphone permission (for audio bounce detection)
            if (!Application.HasUserAuthorization(UserAuthorization.Microphone))
            {
                #if UNITY_ANDROID
                if (!UnityEngine.Android.Permission.HasUserAuthorizedPermission("android.permission.RECORD_AUDIO"))
                {
                    UnityEngine.Android.Permission.RequestUserPermission("android.permission.RECORD_AUDIO");
                    
                    float timeout = 10f;
                    while (!UnityEngine.Android.Permission.HasUserAuthorizedPermission("android.permission.RECORD_AUDIO") && timeout > 0)
                    {
                        timeout -= Time.deltaTime;
                        yield return null;
                    }
                    
                    microphonePermissionGranted = UnityEngine.Android.Permission.HasUserAuthorizedPermission("android.permission.RECORD_AUDIO");
                }
                else
                {
                    microphonePermissionGranted = true;
                }
                #elif UNITY_IOS
                yield return Application.RequestUserAuthorization(UserAuthorization.Microphone);
                microphonePermissionGranted = Application.HasUserAuthorization(UserAuthorization.Microphone);
                #else
                microphonePermissionGranted = true;
                #endif
            }
            else
            {
                microphonePermissionGranted = true;
            }
        }
        
        private IEnumerator SetupARComponents()
        {
            // Ensure XR Origin is configured
            if (xrOrigin == null)
            {
                xrOrigin = FindObjectOfType<XROrigin>();
                if (xrOrigin == null)
                {
                    GameObject sessionOriginObj = new GameObject("XR Origin");
                    xrOrigin = sessionOriginObj.AddComponent<XROrigin>();
                }
            }
            
            // Ensure AR Session exists
            if (arSession == null)
            {
                arSession = FindObjectOfType<ARSession>();
                if (arSession == null)
                {
                    GameObject sessionObj = new GameObject("AR Session");
                    arSession = sessionObj.AddComponent<ARSession>();
                }
            }
            
            // Get AR managers
            arPlaneManager = xrOrigin.GetComponent<ARPlaneManager>();
            if (arPlaneManager == null)
            {
                arPlaneManager = xrOrigin.gameObject.AddComponent<ARPlaneManager>();
            }
            
            arRaycastManager = xrOrigin.GetComponent<ARRaycastManager>();
            if (arRaycastManager == null)
            {
                arRaycastManager = xrOrigin.gameObject.AddComponent<ARRaycastManager>();
            }
            
            arCameraManager = xrOrigin.GetComponent<ARCameraManager>();
            if (arCameraManager == null)
            {
                arCameraManager = xrOrigin.gameObject.AddComponent<ARCameraManager>();
            }
            
            arOcclusionManager = xrOrigin.GetComponent<AROcclusionManager>();
            if (arOcclusionManager == null)
            {
                arOcclusionManager = xrOrigin.gameObject.AddComponent<AROcclusionManager>();
            }
            
            arPointCloudManager = xrOrigin.GetComponent<ARPointCloudManager>();
            if (arPointCloudManager == null)
            {
                arPointCloudManager = xrOrigin.gameObject.AddComponent<ARPointCloudManager>();
            }
            
            // Configure plane detection
            arPlaneManager.requestedDetectionMode = PlaneDetectionMode.Horizontal;
            
            yield return null;
        }
        
        private IEnumerator WaitForARSessionReady()
        {
            while (ARSession.state != ARSessionState.SessionTracking)
            {
                if (ARSession.state == ARSessionState.Unsupported)
                {
                    ShowError("AR is not supported on this device");
                    yield break;
                }
                
                if (ARSession.state == ARSessionState.NeedsInstall)
                {
                    ShowError("ARCore/ARKit needs to be installed or updated");
                    yield break;
                }
                
                yield return new WaitForSeconds(0.1f);
            }
        }
        
        private void OnSessionStateChanged(ARSessionStateChangedEventArgs args)
        {
            CurrentSessionState = args.state;
            OnARSessionStateChanged?.Invoke(args.state);
            
            switch (args.state)
            {
                case ARSessionState.Unsupported:
                    ShowError("AR is not supported on this device");
                    break;
                case ARSessionState.NeedsInstall:
                    ShowError("ARCore/ARKit installation required");
                    break;
                case ARSessionState.Installing:
                    ShowLoading("Installing AR support...");
                    break;
                case ARSessionState.CheckingAvailability:
                    ShowLoading("Checking AR availability...");
                    break;
                case ARSessionState.Ready:
                    ShowLoading("AR session ready");
                    break;
                case ARSessionState.SessionInitializing:
                    ShowLoading("Initializing AR session...");
                    break;
                case ARSessionState.SessionTracking:
                    HideLoading();
                    break;
            }
        }
        
        private void ShowError(string message)
        {
            Debug.LogError($"AR Bootstrap Error: {message}");
            OnARError?.Invoke(message);
            
            loadingPanel?.SetActive(false);
            errorPanel?.SetActive(true);
        }
        
        private void ShowLoading(string message)
        {
            Debug.Log($"AR Bootstrap: {message}");
            loadingPanel?.SetActive(true);
            errorPanel?.SetActive(false);
        }
        
        private void HideLoading()
        {
            loadingPanel?.SetActive(false);
            errorPanel?.SetActive(false);
        }
        
        public void RestartARSession()
        {
            if (arSession != null)
            {
                IsARReady = false;
                arSession.Reset();
                StartCoroutine(InitializeAR());
            }
        }
        
        public bool HasCameraPermission() => cameraPermissionGranted;
        public bool HasMicrophonePermission() => microphonePermissionGranted;
    }
}