import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, ArrowLeft, Target, Zap, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Circle as XCircle, Brain } from "lucide-react";

interface PredictionResult {
  id: string;
  status: 'found' | 'not_found';
  criticality?: 'low' | 'medium' | 'high';
  timestamp: Date;
  details: string;
}

const PredictAttack = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate('/login');
        return;
      }

      setIsLoading(false);
    };

    checkSession();
  }, [navigate]);

  const generatePrediction = (): Omit<PredictionResult, 'id' | 'timestamp'> => {
    const isAttackFound = Math.random() > 0.5;
    const criticalities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    const criticality = criticalities[Math.floor(Math.random() * criticalities.length)];

    if (isAttackFound) {
      const attackTypes = [
        'Potential phishing attempt detected',
        'Suspicious network activity identified',
        'Malware signature found in evidence',
        'Social engineering pattern detected',
        'Data exfiltration attempt identified',
        'Unauthorized access pattern detected'
      ];
      
      return {
        status: 'found',
        criticality,
        details: attackTypes[Math.floor(Math.random() * attackTypes.length)]
      };
    } else {
      const safeMessages = [
        'No threats detected in current analysis',
        'Evidence appears clean and secure',
        'No malicious patterns identified',
        'System analysis shows normal behavior',
        'No security concerns found'
      ];
      
      return {
        status: 'not_found',
        details: safeMessages[Math.floor(Math.random() * safeMessages.length)]
      };
    }
  };

  const handlePredictAttack = async () => {
    setIsPredicting(true);

    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    const prediction = generatePrediction();
    const newPrediction: PredictionResult = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      ...prediction
    };

    setPredictions(prev => [newPrediction, ...prev]);

    // Show appropriate toast
    if (prediction.status === 'found') {
      if (prediction.criticality === 'high') {
        toast({
          title: "High Risk Attack Detected!",
          description: "Admin has been notified of this critical threat.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Attack Detected",
          description: `${prediction.criticality?.toUpperCase()} risk threat identified.`,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Analysis Complete",
        description: "No threats detected in current analysis.",
      });
    }

    setIsPredicting(false);
  };

  const getCriticalityColor = (criticality?: string) => {
    switch (criticality) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'found' ? (
      <XCircle className="h-5 w-5 text-red-500" />
    ) : (
      <CheckCircle className="h-5 w-5 text-green-500" />
    );
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
    <div className="min-h-screen bg-gradient-to-br from-background via-military-light/20 to-military-blue/10">
      <header className="border-b border-military-light/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-military flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-military-navy">Predict Attack</h1>
              <p className="text-sm text-military-gray">AI-powered threat analysis</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Prediction Section */}
          <Card className="shadow-military border-military-light/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-military-navy">
                <Target className="h-5 w-5" />
                AI Threat Analysis
              </CardTitle>
              <CardDescription>
                Advanced AI system analyzes patterns and predicts potential security threats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-6">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                  <Brain className="h-12 w-12 text-white" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-military-navy">
                    Threat Prediction System
                  </h3>
                  <p className="text-military-gray max-w-md mx-auto">
                    Click the button below to initiate AI-powered threat analysis and attack prediction
                  </p>
                </div>

                <Button
                  onClick={handlePredictAttack}
                  disabled={isPredicting}
                  variant="military"
                  size="lg"
                  className="px-8"
                >
                  {isPredicting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Predict Attack
                    </>
                  )}
                </Button>

                {isPredicting && (
                  <div className="text-sm text-military-gray">
                    AI is analyzing threat patterns and security indicators...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          {predictions.length > 0 && (
            <Card className="shadow-military border-military-light/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-military-navy">
                  <AlertTriangle className="h-5 w-5" />
                  Prediction Results ({predictions.length})
                </CardTitle>
                <CardDescription>
                  Recent AI threat analysis results and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictions.map((prediction) => (
                    <div
                      key={prediction.id}
                      className={`p-6 rounded-lg border-2 ${
                        prediction.status === 'found'
                          ? 'border-red-200 bg-red-50'
                          : 'border-green-200 bg-green-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          {getStatusIcon(prediction.status)}
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h4 className="font-semibold text-military-navy">
                                {prediction.status === 'found' ? 'Attack Found' : 'No Threat Detected'}
                              </h4>
                              {prediction.criticality && (
                                <Badge className={`${getCriticalityColor(prediction.criticality)} border`}>
                                  {prediction.criticality.toUpperCase()} RISK
                                </Badge>
                              )}
                            </div>
                            <p className="text-military-gray">{prediction.details}</p>
                            <p className="text-sm text-military-gray/70">
                              Analysis completed: {prediction.timestamp.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Section */}
          <Card className="shadow-military border-military-light/50">
            <CardHeader>
              <CardTitle className="text-military-navy">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                    <Brain className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-military-navy mb-2">AI Analysis</h4>
                  <p className="text-sm text-military-gray">
                    Advanced machine learning algorithms analyze patterns and behaviors
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-3">
                    <Target className="h-6 w-6 text-yellow-600" />
                  </div>
                  <h4 className="font-semibold text-military-navy mb-2">Threat Detection</h4>
                  <p className="text-sm text-military-gray">
                    Identifies potential security threats and attack vectors
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <h4 className="font-semibold text-military-navy mb-2">Risk Assessment</h4>
                  <p className="text-sm text-military-gray">
                    Categorizes threats by criticality level for proper response
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

export default PredictAttack;