import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, LogOut, Upload, Target, FileText, Zap } from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setUserProfile(profile);
      } else {
        navigate('/login');
      }
      setIsLoading(false);
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setUserProfile(profile);
        } else {
          setUserProfile(null);
          navigate('/login');
        }
        setIsLoading(false);
      }
    );

    checkSession();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Logout Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      personnel: "Serving Personnel",
      veteran: "Ex-Servicemen (Veteran)",
      family: "Family Member",
      civilian: "Civilian",
    };
    return roleMap[role] || role;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-military-light/20 to-military-blue/10">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-military-navy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-military-gray">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-military-light/20 to-military-blue/10">
      <header className="border-b border-military-light/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-military flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-military-navy">Military Portal</h1>
              <p className="text-sm text-military-gray">Dashboard</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-military-navy">
              Welcome {userProfile.name}
            </h2>
            <p className="text-lg text-military-gray">
              ({getRoleDisplayName(userProfile.role)})
            </p>
          </div>

          {/* Quick Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card 
              className="shadow-military border-military-light/50 hover:shadow-glow transition-all duration-300 cursor-pointer group"
              onClick={() => navigate('/upload-evidence')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-military-navy">Upload Evidence</CardTitle>
                <CardDescription className="text-military-gray">
                  Upload and manage digital evidence files securely
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-military-gray">
                  <FileText className="h-4 w-4" />
                  <span>Supports multiple file formats</span>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="shadow-military border-military-light/50 hover:shadow-glow transition-all duration-300 cursor-pointer group"
              onClick={() => navigate('/predict-attack')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-military-navy">Predict Attack</CardTitle>
                <CardDescription className="text-military-gray">
                  AI-powered threat analysis and attack prediction
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-military-gray">
                  <Zap className="h-4 w-4" />
                  <span>Advanced AI analysis</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Summary */}
          <Card className="shadow-military border-military-light/50">
            <CardHeader>
              <CardTitle className="text-military-navy">Profile Summary</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-military-light/20 rounded-lg">
                  <p className="text-sm text-military-gray">Role</p>
                  <p className="font-semibold text-military-navy">{getRoleDisplayName(userProfile.role)}</p>
                </div>
                <div className="text-center p-4 bg-military-light/20 rounded-lg">
                  <p className="text-sm text-military-gray">Email</p>
                  <p className="font-semibold text-military-navy">{userProfile.email}</p>
                </div>
                <div className="text-center p-4 bg-military-light/20 rounded-lg">
                  <p className="text-sm text-military-gray">Member Since</p>
                  <p className="font-semibold text-military-navy">
                    {new Date(userProfile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;