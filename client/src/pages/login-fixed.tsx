import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

// Sports categories
const SPORTS_CATEGORIES = [
  "Archery", "Basketball", "Cricket", "Football", "Swimming", "Tennis", 
  "Badminton", "Athletics", "Boxing", "Wrestling", "Weightlifting", 
  "Gymnastics", "Cycling", "Table Tennis", "Hockey", "Volleyball"
];

// Para athlete categories
const PARA_CATEGORIES = [
  "Visually Impaired (B1-B3)", 
  "Physical Impairment (Classes 1-8)",
  "Intellectual Impairment", 
  "Cerebral Palsy (CP Classes)",
  "Amputee/Les Autres",
  "Wheelchair Racing",
  "Other"
];

const DISABILITY_TYPES = [
  "Visual Impairment", "Limb Deficiency", "Short Stature", "Muscle Power", 
  "Passive Range of Movement", "Limb Deficiency", "Leg Length Difference", 
  "Muscle Tension", "Uncoordinated Movement", "Involuntary Movements", 
  "Intellectual Impairment", "Other"
];

// Demo accounts for testing
const DEMO_ACCOUNTS = {
  "coach@example.com": {
    password: "password123",
    user: {
      id: "1",
      email: "coach@example.com",
      role: "coach" as const,
      name: "Guru Drona"
    }
  },
  "athlete@example.com": {
    password: "password123",
    user: {
      id: "2", 
      email: "athlete@example.com",
      role: "athlete" as const,
      name: "Arjuna"
    }
  }
};

interface User {
  id: string;
  email: string;
  role: 'admin' | 'coach' | 'athlete';
  name: string;
}

interface LoginProps {
  setUser: (user: User | null) => void;
}

export default function LoginFixed({ setUser }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Registration form states
  const [regStep, setRegStep] = useState(1);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<'coach' | 'athlete'>('athlete');
  const [regAge, setRegAge] = useState("");
  const [regGender, setRegGender] = useState("");
  const [regSports, setRegSports] = useState<string[]>([]);
  const [regIsParaAthlete, setRegIsParaAthlete] = useState(false);
  const [regParaCategory, setRegParaCategory] = useState("");
  const [regDisabilityType, setRegDisabilityType] = useState("");
  const [regClub, setRegClub] = useState("");
  const [regAchievements, setRegAchievements] = useState("");
  const [regBio, setRegBio] = useState("");
  const [regSocialLinks, setRegSocialLinks] = useState({
    instagram: "",
    twitter: "",
    youtube: "",
    website: ""
  });
  
  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const account = DEMO_ACCOUNTS[email as keyof typeof DEMO_ACCOUNTS];
    
    if (account && account.password === password) {
      // Store user in localStorage
      localStorage.setItem("ekalavya_user", JSON.stringify(account.user));
      
      // Set user in parent component
      setUser(account.user);
    } else {
      setError("Invalid email or password");
    }
    
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create new user account with all registration data
    const newUser = {
      id: Date.now().toString(),
      email: regEmail,
      role: regRole,
      name: regName,
      age: regAge,
      gender: regGender,
      sports: regSports,
      isParaAthlete: regIsParaAthlete,
      paraCategory: regParaCategory,
      disabilityType: regDisabilityType,
      club: regClub,
      achievements: regAchievements,
      bio: regBio,
      socialLinks: regSocialLinks
    };

    // Store user in localStorage
    localStorage.setItem("ekalavya_user", JSON.stringify(newUser));
    
    // Set user in parent component
    setUser(newUser);
    
    setIsLoading(false);
  };

  const nextStep = () => {
    if (regStep < 4) setRegStep(regStep + 1);
  };

  const prevStep = () => {
    if (regStep > 1) setRegStep(regStep - 1);
  };

  const toggleSport = (sport: string) => {
    setRegSports(prev => 
      prev.includes(sport) 
        ? prev.filter(s => s !== sport)
        : [...prev, sport]
    );
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Show success message
    alert(`Password reset instructions have been sent to ${forgotEmail}`);
    setCurrentView('login');
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img 
            src="/logo.png" 
            alt="Ekalavya Sports AI Logo" 
            className="w-20 h-20 mx-auto mb-4 object-contain rounded-lg"
          />
          <CardTitle className="text-2xl font-bold">
            {currentView === 'login' && 'Welcome to Ekalavya'}
            {currentView === 'register' && 'Join Ekalavya'}
            {currentView === 'forgot' && 'Reset Password'}
          </CardTitle>
          <CardDescription>
            {currentView === 'login' && 'Sign in to your sports training platform'}
            {currentView === 'register' && 'Create your account'}
            {currentView === 'forgot' && 'Enter your email to reset password'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          
          {/* Login Form */}
          {currentView === 'login' && (
            <>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 pr-10"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-4 text-center space-y-2">
                <button 
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  onClick={() => setCurrentView('forgot')}
                >
                  Forgot Password?
                </button>
                <div className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <button 
                    type="button"
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    onClick={() => setCurrentView('register')}
                  >
                    Sign up here
                  </button>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 font-medium mb-2">Demo Accounts:</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Coach: coach@example.com / password123</div>
                  <div>Athlete: athlete@example.com / password123</div>
                </div>
              </div>
            </>
          )}

          {/* Multi-Step Registration Form */}
          {currentView === 'register' && (
            <>
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Step {regStep} of 4</span>
                  <span className="text-sm text-gray-500">{Math.round((regStep / 4) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(regStep / 4) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span className={regStep >= 1 ? "text-blue-600" : ""}>Personal</span>
                  <span className={regStep >= 2 ? "text-blue-600" : ""}>Sports</span>
                  <span className={regStep >= 3 ? "text-blue-600" : ""}>Club</span>
                  <span className={regStep >= 4 ? "text-blue-600" : ""}>Profile</span>
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                
                {/* Step 1: Personal Details */}
                {regStep === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-name">Full Name</Label>
                      <Input
                        id="reg-name"
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                        placeholder="Enter your email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                        placeholder="Create a password"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-age">Age</Label>
                        <Input
                          id="reg-age"
                          type="number"
                          value={regAge}
                          onChange={(e) => setRegAge(e.target.value)}
                          placeholder="Age"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-gender">Gender</Label>
                        <select 
                          id="reg-gender"
                          value={regGender}
                          onChange={(e) => setRegGender(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-role">I am a</Label>
                      <select 
                        id="reg-role"
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value as 'coach' | 'athlete')}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="athlete">Athlete</option>
                        <option value="coach">Coach</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Step 2: Sports & Para Athlete Details */}
                {regStep === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Sports Categories (Select all that apply)</Label>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                        {SPORTS_CATEGORIES.map((sport) => (
                          <label key={sport} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={regSports.includes(sport)}
                              onChange={() => toggleSport(sport)}
                              className="rounded"
                            />
                            <span className="text-sm">{sport}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={regIsParaAthlete}
                          onChange={(e) => setRegIsParaAthlete(e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm font-medium">I am a Para Athlete</span>
                      </label>
                    </div>

                    {regIsParaAthlete && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="reg-para-category">Para Category</Label>
                          <select 
                            id="reg-para-category"
                            value={regParaCategory}
                            onChange={(e) => setRegParaCategory(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="">Select Category</option>
                            {PARA_CATEGORIES.map((category) => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="reg-disability-type">Disability Type</Label>
                          <select 
                            id="reg-disability-type"
                            value={regDisabilityType}
                            onChange={(e) => setRegDisabilityType(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="">Select Type</option>
                            {DISABILITY_TYPES.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Step 3: Club & Achievements */}
                {regStep === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-club">Club/Team/Academy</Label>
                      <Input
                        id="reg-club"
                        type="text"
                        value={regClub}
                        onChange={(e) => setRegClub(e.target.value)}
                        placeholder="Your current club or team"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-achievements">Key Achievements</Label>
                      <textarea
                        id="reg-achievements"
                        value={regAchievements}
                        onChange={(e) => setRegAchievements(e.target.value)}
                        placeholder="List your major achievements, medals, records..."
                        className="w-full p-2 border border-gray-300 rounded-md h-24 resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Step 4: Bio & Social Links */}
                {regStep === 4 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-bio">Short Bio</Label>
                      <textarea
                        id="reg-bio"
                        value={regBio}
                        onChange={(e) => setRegBio(e.target.value)}
                        placeholder="Tell us about yourself, your sports journey..."
                        className="w-full p-2 border border-gray-300 rounded-md h-24 resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Social Links (Optional)</Label>
                      <div className="space-y-2">
                        <Input
                          type="url"
                          value={regSocialLinks.instagram}
                          onChange={(e) => setRegSocialLinks(prev => ({...prev, instagram: e.target.value}))}
                          placeholder="Instagram URL"
                        />
                        <Input
                          type="url"
                          value={regSocialLinks.twitter}
                          onChange={(e) => setRegSocialLinks(prev => ({...prev, twitter: e.target.value}))}
                          placeholder="Twitter URL"
                        />
                        <Input
                          type="url"
                          value={regSocialLinks.youtube}
                          onChange={(e) => setRegSocialLinks(prev => ({...prev, youtube: e.target.value}))}
                          placeholder="YouTube URL"
                        />
                        <Input
                          type="url"
                          value={regSocialLinks.website}
                          onChange={(e) => setRegSocialLinks(prev => ({...prev, website: e.target.value}))}
                          placeholder="Personal Website URL"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-red-600 text-sm">{error}</div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4">
                  {regStep > 1 && (
                    <Button type="button" variant="outline" onClick={prevStep}>
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                  )}
                  
                  {regStep < 4 ? (
                    <Button type="button" onClick={nextStep} className="ml-auto">
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button type="submit" className="ml-auto" disabled={isLoading}>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                  )}
                </div>
              </form>

              <div className="mt-4 text-center">
                <button 
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  onClick={() => {
                    setCurrentView('login');
                    setRegStep(1);
                  }}
                >
                  Already have an account? Sign in
                </button>
              </div>
            </>
          )}

          {/* Forgot Password Form */}
          {currentView === 'forgot' && (
            <>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    placeholder="Enter your email address"
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm">{error}</div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Instructions"}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <button 
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  onClick={() => setCurrentView('login')}
                >
                  Back to Sign In
                </button>
              </div>
            </>
          )}

        </CardContent>
      </Card>
    </div>
  );
}