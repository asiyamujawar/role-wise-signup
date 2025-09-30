import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch session and user profile
  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setUserProfile(profile);
      }
      setIsLoading(false);
    };

    fetchSessionAndProfile();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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
    });

    return () => subscription.unsubscribe();
  }, []);

  // Redirect if logged in
  useEffect(() => {
    if (user && userProfile) {
      navigate('/dashboard');
    }
  }, [user, userProfile, navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Logout Error",
        description: error.message,
        variant: "destructive",
      });
      navigate('/');
    } else {
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      navigate('/');
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
