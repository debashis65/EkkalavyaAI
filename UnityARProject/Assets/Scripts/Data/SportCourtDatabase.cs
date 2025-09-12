using System.Collections.Generic;
using UnityEngine;
using EkkalavyaAR.Court;

namespace EkkalavyaAR.Data
{
    public class SportCourtDatabase : ScriptableObject
    {
        [SerializeField] private List<SportCourtConfig> sportConfigs = new List<SportCourtConfig>();
        
        private Dictionary<string, SportCourtConfig> configCache = new Dictionary<string, SportCourtConfig>();
        private bool isCacheInitialized = false;
        
        public void Initialize()
        {
            if (isCacheInitialized) return;
            
            configCache.Clear();
            foreach (var config in sportConfigs)
            {
                if (config != null && !string.IsNullOrEmpty(config.sportName))
                {
                    configCache[config.sportName.ToLower()] = config;
                }
            }
            
            isCacheInitialized = true;
        }
        
        public SportCourtConfig GetSportConfig(string sportName)
        {
            Initialize();
            
            string key = sportName.ToLower();
            if (configCache.ContainsKey(key))
            {
                return configCache[key];
            }
            
            return null;
        }
        
        public List<string> GetAllSportNames()
        {
            Initialize();
            return new List<string>(configCache.Keys);
        }
        
        public bool HasSport(string sportName)
        {
            Initialize();
            return configCache.ContainsKey(sportName.ToLower());
        }
        
        public void AddSportConfig(SportCourtConfig config)
        {
            if (config == null || string.IsNullOrEmpty(config.sportName)) return;
            
            Initialize();
            
            string key = config.sportName.ToLower();
            configCache[key] = config;
            
            // Also add to serialized list if not already present
            bool foundInList = false;
            for (int i = 0; i < sportConfigs.Count; i++)
            {
                if (sportConfigs[i] != null && sportConfigs[i].sportName.ToLower() == key)
                {
                    sportConfigs[i] = config;
                    foundInList = true;
                    break;
                }
            }
            
            if (!foundInList)
            {
                sportConfigs.Add(config);
            }
        }
        
        public void RemoveSportConfig(string sportName)
        {
            Initialize();
            
            string key = sportName.ToLower();
            if (configCache.ContainsKey(key))
            {
                configCache.Remove(key);
            }
            
            // Also remove from serialized list
            for (int i = sportConfigs.Count - 1; i >= 0; i--)
            {
                if (sportConfigs[i] != null && sportConfigs[i].sportName.ToLower() == key)
                {
                    sportConfigs.RemoveAt(i);
                    break;
                }
            }
        }
        
        public List<SportCourtConfig> GetAllConfigs()
        {
            Initialize();
            return new List<SportCourtConfig>(configCache.Values);
        }
        
        public int GetConfigCount()
        {
            Initialize();
            return configCache.Count;
        }
        
        [System.Serializable]
        public class DatabaseInfo
        {
            public string version = "1.0.0";
            public string lastUpdated;
            public int totalSports;
            
            public DatabaseInfo()
            {
                lastUpdated = System.DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            }
        }
        
        [SerializeField] private DatabaseInfo databaseInfo = new DatabaseInfo();
        
        public DatabaseInfo GetDatabaseInfo()
        {
            databaseInfo.totalSports = GetConfigCount();
            databaseInfo.lastUpdated = System.DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            return databaseInfo;
        }
        
        #if UNITY_EDITOR
        [UnityEditor.MenuItem("Assets/Create/Ekkalavya/Sport Court Database")]
        public static void CreateDatabase()
        {
            SportCourtDatabase database = CreateInstance<SportCourtDatabase>();
            
            string path = UnityEditor.AssetDatabase.GetAssetPath(UnityEditor.Selection.activeObject);
            if (path == "")
            {
                path = "Assets";
            }
            else if (System.IO.Path.GetExtension(path) != "")
            {
                path = path.Replace(System.IO.Path.GetFileName(UnityEditor.AssetDatabase.GetAssetPath(UnityEditor.Selection.activeObject)), "");
            }
            
            string assetPathAndName = UnityEditor.AssetDatabase.GenerateUniqueAssetPath(path + "/SportCourtDatabase.asset");
            
            UnityEditor.AssetDatabase.CreateAsset(database, assetPathAndName);
            UnityEditor.AssetDatabase.SaveAssets();
            UnityEditor.AssetDatabase.Refresh();
            UnityEditor.EditorUtility.FocusProjectWindow();
            UnityEditor.Selection.activeObject = database;
        }
        #endif
    }
}