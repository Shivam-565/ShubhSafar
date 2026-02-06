import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  FileText,
  Upload,
  ArrowLeft,
  CheckCircle,
  Loader2
} from "lucide-react";

export default function OrganizerRegistration() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    organizerName: profile?.name || '',
    organizationName: '',
    email: user?.email || '',
    phone: '',
    location: '',
    website: '',
    description: '',
  });

  const [documents, setDocuments] = useState<{
    idDocument: File | null;
    certificate: File | null;
    addressProof: File | null;
  }>({
    idDocument: null,
    certificate: null,
    addressProof: null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, docType: keyof typeof documents) => {
    if (e.target.files && e.target.files[0]) {
      setDocuments({ ...documents, [docType]: e.target.files[0] });
    }
  };

  const uploadDocument = async (file: File, path: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${path}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('organizer-docs')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('organizer-docs')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to register as an organizer');
      navigate('/auth?mode=signup');
      return;
    }

    setLoading(true);

    try {
      // Check if already registered
      const { data: existing } = await supabase
        .from('organizer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existing) {
        toast.error('You already have an organizer profile');
        navigate('/organizer/dashboard');
        return;
      }

      // Upload documents
      let idDocumentUrl = null;
      let certificateUrl = null;
      let addressProofUrl = null;

      if (documents.idDocument) {
        idDocumentUrl = await uploadDocument(documents.idDocument, `${user.id}/id`);
      }
      if (documents.certificate) {
        certificateUrl = await uploadDocument(documents.certificate, `${user.id}/certificate`);
      }
      if (documents.addressProof) {
        addressProofUrl = await uploadDocument(documents.addressProof, `${user.id}/address`);
      }

      // Create organizer profile
      const { error } = await supabase
        .from('organizer_profiles')
        .insert({
          user_id: user.id,
          organizer_name: formData.organizerName,
          organization_name: formData.organizationName,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          website: formData.website || null,
          description: formData.description || null,
          id_document_url: idDocumentUrl,
          certificate_url: certificateUrl,
          address_proof_url: addressProofUrl,
          verification_status: 'pending',
          is_verified: false,
        });

      if (error) throw error;

      // Add organizer role
      await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'organizer',
        });

      toast.success('Registration submitted! We will review your application soon.');
      navigate('/organizer/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to submit registration');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">Please sign in to register as an organizer</p>
          <Button onClick={() => navigate('/auth?mode=signup')}>
            Sign Up / Sign In
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/organizer')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Become an Organizer
            </h1>
            <p className="text-muted-foreground">
              Complete your profile to start listing trips on ShubhSafar
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-16 h-1 ${step > s ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="bg-card rounded-xl p-6 shadow-md">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-bold mb-4">Basic Information</h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="organizerName">Your Full Name *</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="organizerName"
                        name="organizerName"
                        value={formData.organizerName}
                        onChange={handleInputChange}
                        className="pl-10"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="organizationName">Organization Name *</Label>
                    <div className="relative mt-1">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="organizationName"
                        name="organizationName"
                        value={formData.organizationName}
                        onChange={handleInputChange}
                        className="pl-10"
                        placeholder="Adventure Tours Co."
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10"
                        placeholder="contact@company.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="pl-10"
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="pl-10"
                        placeholder="Mumbai, Maharashtra"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="website">Website (Optional)</Label>
                    <div className="relative mt-1">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="website"
                        name="website"
                        type="url"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="pl-10"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">About Your Organization</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Tell travelers about your experience, specialties, and what makes your trips special..."
                    className="mt-1 min-h-[100px]"
                  />
                </div>

                <Button 
                  onClick={() => setStep(2)} 
                  className="w-full"
                  disabled={!formData.organizerName || !formData.organizationName || !formData.email || !formData.phone || !formData.location}
                >
                  Continue to Documents
                </Button>
              </div>
            )}

            {/* Step 2: Documents */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-bold mb-4">Verification Documents</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Upload your documents for verification. This helps us ensure trust and safety for all travelers.
                </p>
                
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                    <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <Label htmlFor="idDocument" className="cursor-pointer">
                      <span className="font-medium text-foreground">Government ID *</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        Aadhar Card, PAN Card, or Passport
                      </p>
                    </Label>
                    <Input
                      id="idDocument"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'idDocument')}
                      className="hidden"
                    />
                    {documents.idDocument && (
                      <p className="text-sm text-success mt-2 flex items-center justify-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        {documents.idDocument.name}
                      </p>
                    )}
                    <Button variant="outline" size="sm" className="mt-3" asChild>
                      <label htmlFor="idDocument">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </label>
                    </Button>
                  </div>

                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                    <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <Label htmlFor="certificate" className="cursor-pointer">
                      <span className="font-medium text-foreground">Business Certificate (Optional)</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        GST Certificate, Shop Act License, or Company Registration
                      </p>
                    </Label>
                    <Input
                      id="certificate"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'certificate')}
                      className="hidden"
                    />
                    {documents.certificate && (
                      <p className="text-sm text-success mt-2 flex items-center justify-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        {documents.certificate.name}
                      </p>
                    )}
                    <Button variant="outline" size="sm" className="mt-3" asChild>
                      <label htmlFor="certificate">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </label>
                    </Button>
                  </div>

                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                    <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <Label htmlFor="addressProof" className="cursor-pointer">
                      <span className="font-medium text-foreground">Address Proof (Optional)</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        Utility Bill, Bank Statement, or Rent Agreement
                      </p>
                    </Label>
                    <Input
                      id="addressProof"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'addressProof')}
                      className="hidden"
                    />
                    {documents.addressProof && (
                      <p className="text-sm text-success mt-2 flex items-center justify-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        {documents.addressProof.name}
                      </p>
                    )}
                    <Button variant="outline" size="sm" className="mt-3" asChild>
                      <label htmlFor="addressProof">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </label>
                    </Button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button 
                    onClick={() => setStep(3)} 
                    className="flex-1"
                    disabled={!documents.idDocument}
                  >
                    Continue to Review
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-bold mb-4">Review Your Application</h2>
                
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{formData.organizerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Organization:</span>
                    <span className="font-medium">{formData.organizationName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{formData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">{formData.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">{formData.location}</span>
                  </div>
                  {formData.website && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Website:</span>
                      <span className="font-medium">{formData.website}</span>
                    </div>
                  )}
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Documents Uploaded:</h3>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      Government ID: {documents.idDocument?.name}
                    </li>
                    {documents.certificate && (
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        Business Certificate: {documents.certificate.name}
                      </li>
                    )}
                    {documents.addressProof && (
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        Address Proof: {documents.addressProof.name}
                      </li>
                    )}
                  </ul>
                </div>

                <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                  <p className="text-sm text-warning-foreground">
                    By submitting, you agree to our Terms of Service and confirm that all information provided is accurate. 
                    Your application will be reviewed within 24-48 hours.
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
