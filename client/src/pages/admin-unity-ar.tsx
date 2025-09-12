import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Shield, 
  Activity, 
  Users, 
  Clock, 
  Target, 
  Smartphone,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Eye,
  TrendingUp,
  Zap
} from 'lucide-react';
import { RealTimeAnalyticsDashboard } from '../components/analytics/RealTimeAnalyticsDashboard';

// All 54+ sports from the schema
const ALL_SPORTS = [
  'archery', 'swimming', 'basketball', 'football', 'cricket', 'gymnastics', 'tennis', 
  'badminton', 'yoga', 'athletics', 'volleyball', 'squash', 'table_tennis', 'cycling',
  'long_jump', 'high_jump', 'pole_vault', 'hurdle', 'boxing', 'shotput_throw',
  'discus_throw', 'javelin_throw', 'hockey', 'wrestling', 'judo', 'weightlifting',
  'karate', 'skating', 'ice_skating', 'golf', 'kabaddi', 'kho_kho',
  // Para sports
  'para_archery', 'para_swimming', 'para_basketball', 'para_football', 'para_cricket',
  'para_athletics', 'para_tennis', 'para_badminton', 'para_volleyball', 'para_table_tennis',
  'para_boxing', 'para_wrestling', 'para_judo', 'para_weightlifting', 'para_cycling',
  'para_skating', 'wheelchair_basketball', 'wheelchair_tennis', 'wheelchair_racing',
  'blind_football', 'goalball', 'sitting_volleyball'
];

type UnityArMode = 'disabled' | 'enabled' | 'admin_only';
type UnityDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

interface UnityArSportSetting {
  id?: number;
  sport: string;
  arMode: UnityArMode;
  defaultDifficulty: UnityDifficulty;
  isActive: boolean;
  requiresCalibration: boolean;
  minPlaneArea: number;
  maxPlayers: number;
  sessionTimeout: number;
}

interface UnityArStats {
  totalSessions: number;
  activeSports: number;
  averageSessionDuration: number;
  topPerformingSport: string;
  totalUsers: number;
  dailyActiveUsers: number;
}

export default function AdminUnityAR() {
  const [sportSettings, setSportSettings] = useState<Record<string, UnityArSportSetting>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [stats, setStats] = useState<UnityArStats | null>(null);
  const [selectedSport, setSelectedSport] = useState<string>('basketball');
  const { toast } = useToast();

  // Load Unity AR settings and stats
  useEffect(() => {
    loadUnityArData();
  }, []);

  const loadUnityArData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch Unity AR settings for all sports
      const settingsResponse = await fetch('/api/admin/unity-ar/settings');
      const settings = await settingsResponse.json();
      
      // Fetch Unity AR statistics
      const statsResponse = await fetch('/api/admin/unity-ar/stats');
      const statsData = await statsResponse.json();
      
      // Convert array to object for easier lookup
      const settingsMap: Record<string, UnityArSportSetting> = {};
      
      // Initialize all sports with default settings
      ALL_SPORTS.forEach(sport => {
        settingsMap[sport] = {
          sport,
          arMode: 'disabled',
          defaultDifficulty: 'medium',
          isActive: false,
          requiresCalibration: true,
          minPlaneArea: 12,
          maxPlayers: 1,
          sessionTimeout: 1800
        };
      });
      
      // Override with existing settings
      settings.forEach((setting: UnityArSportSetting) => {
        settingsMap[setting.sport] = setting;
      });
      
      setSportSettings(settingsMap);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load Unity AR data:', error);
      toast({
        title: "Error",
        description: "Failed to load Unity AR settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSportSetting = (sport: string, updates: Partial<UnityArSportSetting>) => {
    setSportSettings(prev => ({
      ...prev,
      [sport]: { ...prev[sport], ...updates }
    }));
  };

  const saveAllSettings = async () => {
    try {
      setSaving(true);
      
      const settingsArray = Object.values(sportSettings);
      const response = await fetch('/api/admin/unity-ar/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: settingsArray }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      toast({
        title: "Settings Saved",
        description: "Unity AR settings have been updated successfully",
      });
      
      // Reload data to get updated stats
      await loadUnityArData();
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save Unity AR settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const bulkEnableSports = (sports: string[], mode: UnityArMode) => {
    const updates: Record<string, UnityArSportSetting> = {};
    
    sports.forEach(sport => {
      updates[sport] = {
        ...sportSettings[sport],
        arMode: mode,
        isActive: mode !== 'disabled'
      };
    });
    
    setSportSettings(prev => ({ ...prev, ...updates }));
  };

  const formatSportName = (sport: string) => {
    return sport
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getModeColor = (mode: UnityArMode) => {
    switch (mode) {
      case 'enabled': return 'bg-green-100 text-green-800';
      case 'admin_only': return 'bg-yellow-100 text-yellow-800';
      case 'disabled': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getModeIcon = (mode: UnityArMode) => {
    switch (mode) {
      case 'enabled': return <CheckCircle className="w-4 h-4" />;
      case 'admin_only': return <Shield className="w-4 h-4" />;
      case 'disabled': return <XCircle className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading Unity AR settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Unity AR Admin - Ekkalavya Sports AI</title>
      </Helmet>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Unity AR Administration</h1>
          <p className="text-muted-foreground mt-2">
            Manage Unity AR functionality across all 54+ sports platforms
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={loadUnityArData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={saveAllSettings} disabled={isSaving} size="sm">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSessions.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Sports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSports}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Session (min)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats.averageSessionDuration / 60)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Top Sport</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">{formatSportName(stats.topPerformingSport)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Daily Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.dailyActiveUsers}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="sports-grid" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sports-grid">Sports Grid</TabsTrigger>
          <TabsTrigger value="sport-detail">Sport Details</TabsTrigger>
          <TabsTrigger value="bulk-actions">Bulk Actions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="sports-grid" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Sports Unity AR Status</CardTitle>
              <CardDescription>
                Overview of Unity AR configuration for all {ALL_SPORTS.length} sports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {ALL_SPORTS.map((sport) => {
                  const setting = sportSettings[sport];
                  if (!setting) return null;
                  
                  return (
                    <Card key={sport} className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedSport(sport)}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{formatSportName(sport)}</CardTitle>
                          <div className="flex items-center gap-1">
                            {getModeIcon(setting.arMode)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Badge className={getModeColor(setting.arMode)} variant="secondary">
                            {setting.arMode.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            Difficulty: {setting.defaultDifficulty}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Players: {setting.maxPlayers} | Area: {setting.minPlaneArea}m²
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sport-detail" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sport Configuration</CardTitle>
                  <CardDescription>
                    Configure Unity AR settings for individual sports
                  </CardDescription>
                </div>
                <Select value={selectedSport} onValueChange={setSelectedSport}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_SPORTS.map(sport => (
                      <SelectItem key={sport} value={sport}>
                        {formatSportName(sport)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {selectedSport && sportSettings[selectedSport] && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>AR Mode</Label>
                      <Select 
                        value={sportSettings[selectedSport].arMode} 
                        onValueChange={(value: UnityArMode) => 
                          updateSportSetting(selectedSport, { arMode: value, isActive: value !== 'disabled' })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="disabled">Disabled</SelectItem>
                          <SelectItem value="enabled">Enabled for All</SelectItem>
                          <SelectItem value="admin_only">Admin Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Default Difficulty</Label>
                      <Select 
                        value={sportSettings[selectedSport].defaultDifficulty} 
                        onValueChange={(value: UnityDifficulty) => 
                          updateSportSetting(selectedSport, { defaultDifficulty: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={sportSettings[selectedSport].requiresCalibration}
                        onCheckedChange={(checked) => 
                          updateSportSetting(selectedSport, { requiresCalibration: checked })
                        }
                      />
                      <Label>Requires Calibration</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Minimum Plane Area (m²)</Label>
                      <Input
                        type="number"
                        value={sportSettings[selectedSport].minPlaneArea}
                        onChange={(e) => 
                          updateSportSetting(selectedSport, { minPlaneArea: parseInt(e.target.value) || 12 })
                        }
                        min={1}
                        max={100}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Max Players</Label>
                      <Input
                        type="number"
                        value={sportSettings[selectedSport].maxPlayers}
                        onChange={(e) => 
                          updateSportSetting(selectedSport, { maxPlayers: parseInt(e.target.value) || 1 })
                        }
                        min={1}
                        max={10}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Session Timeout (seconds)</Label>
                      <Input
                        type="number"
                        value={sportSettings[selectedSport].sessionTimeout}
                        onChange={(e) => 
                          updateSportSetting(selectedSport, { sessionTimeout: parseInt(e.target.value) || 1800 })
                        }
                        min={60}
                        max={7200}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk-actions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Actions</CardTitle>
              <CardDescription>
                Apply settings to multiple sports at once
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => bulkEnableSports(ALL_SPORTS.filter(s => !s.startsWith('para_')), 'enabled')}
                    className="w-full"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Enable All Standard Sports
                  </Button>
                  
                  <Button 
                    onClick={() => bulkEnableSports(ALL_SPORTS.filter(s => s.startsWith('para_')), 'enabled')}
                    className="w-full"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Enable All Para Sports
                  </Button>
                  
                  <Button 
                    onClick={() => bulkEnableSports(ALL_SPORTS, 'disabled')}
                    variant="outline"
                    className="w-full"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Disable All Sports
                  </Button>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Important Notes</h4>
                      <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                        <li>• Changes take effect immediately after saving</li>
                        <li>• Active sessions will not be interrupted</li>
                        <li>• Disabled sports will hide Unity AR option from users</li>
                        <li>• Admin-only mode restricts access to administrators</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Real-Time Sports Analytics Dashboard
              </CardTitle>
              <CardDescription>
                AI-powered sport analysis with object detection, tracking, and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <RealTimeAnalyticsDashboard />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}