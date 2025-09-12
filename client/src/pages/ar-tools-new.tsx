import { useState, useEffect } from "react";
import { RealComputerVisionAR } from "@/components/RealComputerVisionAR";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ALL_SUPPORTED_SPORTS } from "@/components/ar-tools";

export default function ARTools() {
  const [userSport, setUserSport] = useState("basketball");
  const [userId, setUserId] = useState(2); // Default athlete user
  
  // Get user's primary sport from localStorage or API
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserId(user.id);
      // Fetch user's primary sport
      fetch(`/api/users/${user.id}`)
        .then(res => res.json())
        .then(userData => {
          if (userData.primarySport) {
            setUserSport(userData.primarySport);
          }
        })
        .catch(err => console.log('Using default sport'));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                🎯 AR Sports Analysis
                <Badge variant="default">Real Computer Vision</Badge>
              </span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  54+ Sports Supported
                </span>
                <Select value={userSport} onValueChange={setUserSport}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_SUPPORTED_SPORTS.map(sport => (
                      <SelectItem key={sport} value={sport}>
                        {sport.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Real Computer Vision AR Component */}
        <RealComputerVisionAR selectedSport={userSport} userId={userId} />
      </div>
    </div>
  );
}