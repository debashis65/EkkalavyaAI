import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  name: string;
  email: string;
  role: "coach" | "athlete";
}

export default function DashboardSimple() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("ekalavya_user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  if (!user) {
    return <div>Loading...</div>;
  }

  const logout = () => {
    localStorage.removeItem("ekalavya_user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-500 text-white px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user.name}!</h1>
            <p className="text-green-100">
              {user.role === "coach" ? "Coach Dashboard" : "Athlete Dashboard"}
            </p>
          </div>
          <button 
            onClick={logout}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {user.role === "coach" ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Coach Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium">Monthly Earnings</h3>
                <p className="text-2xl font-bold text-green-600">₹48,500</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium">Active Students</h3>
                <p className="text-2xl font-bold text-blue-600">48</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium">Rating</h3>
                <p className="text-2xl font-bold text-yellow-600">4.9⭐</p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-4">Athlete Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium">Practice Hours</h3>
                <p className="text-2xl font-bold text-green-600">875 hrs</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium">Current Level</h3>
                <p className="text-2xl font-bold text-blue-600">Advanced</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium">XP Points</h3>
                <p className="text-2xl font-bold text-purple-600">4,280 XP</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}