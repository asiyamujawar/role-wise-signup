import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, LogOut, User } from "lucide-react";

const Index = () => {
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
        }
        setIsLoading(false);
      }
    );

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

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

  if (user && userProfile) {
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
                <p className="text-sm text-military-gray">Welcome back, {userProfile.name}</p>
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
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="shadow-military border-military-light/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-military-navy">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>Your account details and role information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-military-gray">Full Name</label>
                    <p className="text-military-navy font-semibold">{userProfile.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-military-gray">Email</label>
                    <p className="text-military-navy font-semibold">{userProfile.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-military-gray">Role</label>
                    <p className="text-military-navy font-semibold">{getRoleDisplayName(userProfile.role)}</p>
                  </div>
                  {userProfile.service_number && (
                    <div>
                      <label className="text-sm font-medium text-military-gray">Service Number</label>
                      <p className="text-military-navy font-semibold">{userProfile.service_number}</p>
                    </div>
                  )}
                  {userProfile.ppo_number && (
                    <div>
                      <label className="text-sm font-medium text-military-gray">PPO Number</label>
                      <p className="text-military-navy font-semibold">{userProfile.ppo_number}</p>
                    </div>
                  )}
                  {userProfile.sponsor_service_number && (
                    <div>
                      <label className="text-sm font-medium text-military-gray">Sponsor Number</label>
                      <p className="text-military-navy font-semibold">{userProfile.sponsor_service_number}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-military border-military-light/50">
              <CardHeader>
                <CardTitle className="text-military-navy">Welcome to Military Portal</CardTitle>
                <CardDescription>
                  Your secure platform for military community services and information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-military-gray">
                  You are now logged in as a {getRoleDisplayName(userProfile.role).toLowerCase()}. 
                  This platform provides secure access to military community resources and services.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-military-light/20 to-military-blue/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-military border-military-light/50">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-military flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold text-military-navy">Military Portal</CardTitle>
          <CardDescription className="text-military-gray">
            Secure platform for military community members
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="military"
            className="w-full"
            onClick={() => navigate("/signup")}
          >
            Create Account
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/login")}
          >
            Sign In
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
