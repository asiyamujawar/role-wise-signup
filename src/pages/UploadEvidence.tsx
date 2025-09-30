import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, ArrowLeft, Upload, FileText, Clock, TriangleAlert as AlertTriangle } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Evidence = Tables<'evidences'>;

const UploadEvidence = () => {
  const [user, setUser] = useState<any>(null);
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const acceptedFileTypes = ".txt,.pdf,.docx,.jpg,.jpeg,.png,.mp4,.mp3,.eml";

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate('/login');
        return;
      }

      // Fetch user's evidences
      await fetchEvidences(session.user.id);
      setIsLoading(false);
    };

    checkSession();
  }, [navigate]);

  const fetchEvidences = async (userId: string) => {
    const { data, error } = await supabase
      .from('evidences')
      .select('*')
      .eq('user_id', userId)
      .order('upload_time', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch evidences",
        variant: "destructive",
      });
    } else {
      setEvidences(data || []);
    }
  };

  const generateRandomCID = () => {
    return 'CID' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const getRandomCriticality = (): 'low' | 'medium' | 'high' => {
    const levels: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    return levels[Math.floor(Math.random() * levels.length)];
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);

    try {
      // Simulate upload process
      const evidence = {
        user_id: user.id,
        file_name: file.name,
        file_type: file.type || 'unknown',
        cid: generateRandomCID(),
        criticality: getRandomCriticality(),
      };

      const { error } = await supabase
        .from('evidences')
        .insert([evidence]);

      if (error) {
        toast({
          title: "Upload Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Evidence uploaded successfully",
        });
        
        // Refresh evidences list
        await fetchEvidences(user.id);
      }
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const getCriticalityColor = (criticality: string) => {
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
              <h1 className="text-xl font-bold text-military-navy">Upload Evidence</h1>
              <p className="text-sm text-military-gray">Secure evidence management</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Upload Section */}
          <Card className="shadow-military border-military-light/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-military-navy">
                <Upload className="h-5 w-5" />
                Upload New Evidence
              </CardTitle>
              <CardDescription>
                Upload digital evidence files. Supported formats: TXT, PDF, DOCX, JPG, PNG, MP4, MP3, EML
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-military-light rounded-lg p-8 text-center hover:border-military-blue transition-colors">
                  <Upload className="h-12 w-12 text-military-gray mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-military-navy font-medium">Choose a file to upload</p>
                    <p className="text-sm text-military-gray">
                      Maximum file size: 100MB
                    </p>
                  </div>
                  <Input
                    type="file"
                    accept={acceptedFileTypes}
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="mt-4 cursor-pointer"
                  />
                </div>
                
                {isUploading && (
                  <div className="flex items-center justify-center gap-2 text-military-blue">
                    <div className="w-4 h-4 border-2 border-military-blue border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading evidence...</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Evidence List */}
          <Card className="shadow-military border-military-light/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-military-navy">
                <FileText className="h-5 w-5" />
                Uploaded Evidence ({evidences.length})
              </CardTitle>
              <CardDescription>
                Your uploaded evidence files and their analysis results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {evidences.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-military-gray mx-auto mb-4" />
                  <p className="text-military-gray">No evidence files uploaded yet</p>
                  <p className="text-sm text-military-gray/70">Upload your first evidence file to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {evidences.map((evidence) => (
                    <div
                      key={evidence.id}
                      className="flex items-center justify-between p-4 border border-military-light/50 rounded-lg hover:bg-military-light/10 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-military-light/30 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-military-navy" />
                        </div>
                        <div>
                          <p className="font-medium text-military-navy">{evidence.file_name}</p>
                          <div className="flex items-center gap-4 text-sm text-military-gray">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(evidence.upload_time || '').toLocaleString()}
                            </span>
                            <span>CID: {evidence.cid}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          className={`${getCriticalityColor(evidence.criticality)} border`}
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {evidence.criticality.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default UploadEvidence;