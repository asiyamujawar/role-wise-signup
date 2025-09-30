import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, User, Users, Heart, Globe } from "lucide-react";

type UserRole = "personnel" | "veteran" | "family" | "civilian";

interface RoleOption {
  value: UserRole;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const roleOptions: RoleOption[] = [
  {
    value: "personnel",
    label: "Serving Personnel",
    description: "Active military service members",
    icon: <Shield className="h-5 w-5" />,
  },
  {
    value: "veteran",
    label: "Ex-Servicemen (Veteran)",
    description: "Former military service members",
    icon: <User className="h-5 w-5" />,
  },
  {
    value: "family",
    label: "Family Member",
    description: "Family member of military personnel",
    icon: <Heart className="h-5 w-5" />,
  },
  {
    value: "civilian",
    label: "Civilian",
    description: "Civilian community member",
    icon: <Globe className="h-5 w-5" />,
  },
];

const Signup = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>("personnel");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    serviceNumber: "",
    ppoNumber: "",
    sponsorServiceNumber: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.name) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return false;
    }

    if (selectedRole === "personnel" && !formData.serviceNumber) {
      toast({
        title: "Service Number Required",
        description: "Service Number is required for serving personnel.",
        variant: "destructive",
      });
      return false;
    }

    if (selectedRole === "veteran" && !formData.ppoNumber) {
      toast({
        title: "PPO Number Required",
        description: "PPO Number is required for veterans.",
        variant: "destructive",
      });
      return false;
    }

    if (selectedRole === "family" && !formData.sponsorServiceNumber) {
      toast({
        title: "Sponsor Information Required",
        description: "Sponsor's Service Number or Veteran PPO Number is required for family members.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const userData = {
        name: formData.name,
        role: selectedRole,
        ...(selectedRole === "personnel" && { service_number: formData.serviceNumber }),
        ...(selectedRole === "veteran" && { ppo_number: formData.ppoNumber }),
        ...(selectedRole === "family" && { sponsor_service_number: formData.sponsorServiceNumber }),
      };

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: userData,
        },
      });

      if (error) {
        toast({
          title: "Signup Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data?.user) {
        toast({
          title: "Account Created Successfully",
          description: "Welcome! Your account has been created.",
        });
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Signup Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderConditionalFields = () => {
    switch (selectedRole) {
      case "personnel":
        return (
          <div className="space-y-2">
            <Label htmlFor="serviceNumber">Service Number *</Label>
            <Input
              id="serviceNumber"
              type="text"
              placeholder="Enter your service number"
              value={formData.serviceNumber}
              onChange={(e) => handleInputChange("serviceNumber", e.target.value)}
              required
            />
          </div>
        );
      case "veteran":
        return (
          <div className="space-y-2">
            <Label htmlFor="ppoNumber">PPO Number *</Label>
            <Input
              id="ppoNumber"
              type="text"
              placeholder="Enter your PPO number"
              value={formData.ppoNumber}
              onChange={(e) => handleInputChange("ppoNumber", e.target.value)}
              required
            />
          </div>
        );
      case "family":
        return (
          <div className="space-y-2">
            <Label htmlFor="sponsorServiceNumber">Sponsor's Service Number / Veteran PPO Number *</Label>
            <Input
              id="sponsorServiceNumber"
              type="text"
              placeholder="Enter sponsor's service number or PPO number"
              value={formData.sponsorServiceNumber}
              onChange={(e) => handleInputChange("sponsorServiceNumber", e.target.value)}
              required
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-military-light/20 to-military-blue/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-military border-military-light/50">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-military flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-military-navy">Create Account</CardTitle>
          <CardDescription className="text-military-gray">
            Join our military community platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-military-navy">Select Your Role *</Label>
              <div className="grid grid-cols-2 gap-3">
                {roleOptions.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value)}
                    className={`p-3 rounded-lg border-2 text-left transition-all duration-200 hover:shadow-md ${
                      selectedRole === role.value
                        ? "border-military-navy bg-military-navy/5 shadow-md"
                        : "border-military-light hover:border-military-blue"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`${selectedRole === role.value ? "text-military-navy" : "text-military-gray"}`}>
                        {role.icon}
                      </div>
                      <span className={`text-sm font-medium ${
                        selectedRole === role.value ? "text-military-navy" : "text-military-gray"
                      }`}>
                        {role.label}
                      </span>
                    </div>
                    <p className="text-xs text-military-gray/80">{role.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Common Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                />
              </div>

              {/* Conditional Fields */}
              {renderConditionalFields()}
            </div>

            <Button
              type="submit"
              variant="military"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>

            <div className="text-center text-sm text-military-gray">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-military-navy font-medium hover:underline"
              >
                Sign in here
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;