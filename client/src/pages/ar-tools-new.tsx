import { useState, useEffect } from "react";
import { SportSpecificARTools } from "@/components/SportSpecificARTools";

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

  // Return the sport-specific AR Tools component
  return <SportSpecificARTools userSport={userSport} userId={userId} />;
}