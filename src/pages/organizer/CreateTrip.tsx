import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, Trash2, Image, Sparkles, Upload, Loader2, FileText } from "lucide-react";

// Helper to detect phone numbers in text
const containsPhoneNumber = (text: string): boolean => {
  // Matches various phone number formats
  const phoneRegex = /(\+?\d{1,4}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?[\d\s.-]{6,}/g;
  return phoneRegex.test(text);
};

export default function CreateTrip() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organizerProfile, setOrganizerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [itineraryPdfUrl, setItineraryPdfUrl] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    destination: "",
    description: "",
    category: "adventure",
    tripType: "public",
    isEducational: false,
    educationType: "",
    price: "",
    originalPrice: "",
    prebookingAmount: "",
    earlyBirdPrice: "",
    earlyBirdDeadline: "",
    coupleDiscountEnabled: false,
    coupleDiscountPercent: "10",
    durationDays: "",
    maxParticipants: "",
    startDate: "",
    endDate: "",
    meetingPoint: "",
    difficulty: "easy",
    inclusions: ["Transport", "Accommodation", "Meals"],
    exclusions: ["Personal expenses", "Travel insurance"],
    referralEnabled: false,
    referralDiscountPercent: "5",
    referralMinPurchases: "1",
  });

  useEffect(() => {
    checkOrganizerProfile();
  }, []);

  const checkOrganizerProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data: profile } = await supabase
      .from('organizer_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profile) {
      toast.error('Please complete your organizer registration first');
      navigate('/organizer');
      return;
    }

    setOrganizerProfile(profile);
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `trips/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('trip-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('trip-images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('PDF must be less than 10MB');
      return;
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    setUploadingPdf(true);
    try {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `itinerary/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('trip-itinerary')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('trip-itinerary')
        .getPublicUrl(filePath);

      setItineraryPdfUrl(publicUrl);
      toast.success('Itinerary PDF uploaded successfully!');
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast.error('Failed to upload PDF. Please try again.');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleGenerateAIImage = async () => {
    if (!formData.title && !formData.destination) {
      toast.error('Please enter a title or destination first');
      return;
    }

    setGeneratingImage(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-trip-image', {
        body: {
          title: formData.title,
          destination: formData.destination,
          category: formData.category
        }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setImageUrl(data.imageUrl);
        toast.success('AI image generated successfully!');
      }
    } catch (error) {
      console.error('Error generating AI image:', error);
      toast.error('Failed to generate AI image. Try uploading manually.');
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleAddInclusion = () => {
    setFormData({ ...formData, inclusions: [...formData.inclusions, ""] });
  };

  const handleRemoveInclusion = (index: number) => {
    setFormData({ 
      ...formData, 
      inclusions: formData.inclusions.filter((_, i) => i !== index) 
    });
  };

  const handleAddExclusion = () => {
    setFormData({ ...formData, exclusions: [...formData.exclusions, ""] });
  };

  const handleRemoveExclusion = (index: number) => {
    setFormData({ 
      ...formData, 
      exclusions: formData.exclusions.filter((_, i) => i !== index) 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizerProfile) return;

    // Validate no phone numbers in title or description
    if (containsPhoneNumber(formData.title)) {
      toast.error('Phone numbers are not allowed in the trip title');
      return;
    }
    if (containsPhoneNumber(formData.description)) {
      toast.error('Phone numbers are not allowed in the trip description');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('trips').insert({
        organizer_id: organizerProfile.id,
        title: formData.title,
        destination: formData.destination,
        description: formData.description,
        category: formData.category,
        trip_type: formData.tripType,
        is_educational: formData.isEducational,
        education_type: formData.isEducational ? formData.educationType : null,
        price: parseFloat(formData.price),
        original_price: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        prebooking_amount: formData.prebookingAmount ? parseFloat(formData.prebookingAmount) : 0,
        early_bird_price: formData.earlyBirdPrice ? parseFloat(formData.earlyBirdPrice) : null,
        early_bird_deadline: formData.earlyBirdDeadline || null,
        couple_discount_enabled: formData.coupleDiscountEnabled,
        couple_discount_percent: formData.coupleDiscountEnabled ? parseFloat(formData.coupleDiscountPercent) : 0,
        duration_days: parseInt(formData.durationDays),
        max_participants: parseInt(formData.maxParticipants),
        start_date: formData.startDate || null,
        end_date: formData.endDate || null,
        meeting_point: formData.meetingPoint || null,
        difficulty_level: formData.difficulty,
        image_url: imageUrl || null,
        itinerary_pdf_url: itineraryPdfUrl || null,
        inclusions: formData.inclusions.filter(i => i.trim()),
        exclusions: formData.exclusions.filter(e => e.trim()),
        is_active: true,
        current_participants: 0,
        rating: 0,
        review_count: 0,
        referral_enabled: formData.referralEnabled,
        referral_discount_percent: formData.referralEnabled ? parseFloat(formData.referralDiscountPercent) : 0,
        referral_min_purchases: formData.referralEnabled ? parseInt(formData.referralMinPurchases) : 1,
        approval_status: 'pending',
      });

      if (error) throw error;

      toast.success('Trip created successfully! It will be visible after admin approval.');
      navigate('/organizer/dashboard');
    } catch (error) {
      console.error('Error creating trip:', error);
      toast.error('Failed to create trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          <div className="bg-card rounded-xl p-6 md:p-8 shadow-md">
            <h1 className="font-display text-2xl font-bold text-card-foreground mb-2">
              Create New Trip
            </h1>
            <p className="text-muted-foreground mb-8">
              Fill in the details to list your trip on ShubhSafar
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Trip Image */}
              <div className="space-y-4">
                <h2 className="font-semibold text-lg text-card-foreground border-b pb-2">Trip Image</h2>
                
                <div className="flex flex-col items-center gap-4">
                  {imageUrl ? (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                      <img 
                        src={imageUrl} 
                        alt="Trip preview" 
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setImageUrl("")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/50">
                      <div className="text-center p-4">
                        <Image className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground text-sm">No image selected</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3 flex-wrap justify-center">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                      <Button type="button" variant="outline" disabled={uploadingImage} asChild>
                        <span>
                          {uploadingImage ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 mr-2" />
                          )}
                          Upload Image
                        </span>
                      </Button>
                    </label>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={handleGenerateAIImage}
                      disabled={generatingImage}
                    >
                      {generatingImage ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                      )}
                      Generate with AI
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Max size: 5MB. Supported: JPG, PNG, WebP</p>
                </div>
              </div>

              {/* Itinerary PDF Upload */}
              <div className="space-y-4">
                <h2 className="font-semibold text-lg text-card-foreground border-b pb-2">Itinerary PDF (Optional)</h2>
                
                <div className="flex flex-col items-center gap-4">
                  {itineraryPdfUrl ? (
                    <div className="w-full p-4 bg-muted/50 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-8 h-8 text-primary" />
                        <div>
                          <p className="font-medium text-sm">Itinerary PDF uploaded</p>
                          <a 
                            href={itineraryPdfUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            View PDF
                          </a>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setItineraryPdfUrl("")}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer w-full">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handlePdfUpload}
                        className="hidden"
                        disabled={uploadingPdf}
                      />
                      <div className="w-full p-6 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center bg-muted/50 hover:bg-muted/70 transition-colors">
                        {uploadingPdf ? (
                          <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                        ) : (
                          <FileText className="w-8 h-8 text-muted-foreground mb-2" />
                        )}
                        <p className="text-sm text-muted-foreground">
                          {uploadingPdf ? 'Uploading...' : 'Click to upload itinerary PDF'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Max size: 10MB</p>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <h2 className="font-semibold text-lg text-card-foreground border-b pb-2">Basic Information</h2>
                
                <div>
                  <Label htmlFor="title">Trip Title *</Label>
                  <Input
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Adventure Trek to Valley of Flowers"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Do not include phone numbers or personal contact info
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="destination">Destination *</Label>
                    <Input
                      id="destination"
                      required
                      value={formData.destination}
                      onChange={(e) => setFormData({...formData, destination: e.target.value})}
                      placeholder="e.g., Uttarakhand"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <select
                      id="category"
                      className="w-full h-10 rounded-md border border-input bg-background px-3 mt-1"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="adventure">Adventure</option>
                      <option value="beach">Beach</option>
                      <option value="mountain">Mountain</option>
                      <option value="heritage">Heritage</option>
                      <option value="spiritual">Spiritual</option>
                      <option value="wildlife">Wildlife</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe your trip in detail..."
                    rows={4}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Do not include phone numbers or personal contact info
                  </p>
                </div>

                {/* Educational Trip Toggle */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-card-foreground">Educational Trip</p>
                    <p className="text-sm text-muted-foreground">Is this a school or college trip?</p>
                  </div>
                  <Switch 
                    checked={formData.isEducational}
                    onCheckedChange={(checked) => setFormData({...formData, isEducational: checked})}
                  />
                </div>

                {formData.isEducational && (
                  <div>
                    <Label htmlFor="educationType">Education Type</Label>
                    <select
                      id="educationType"
                      className="w-full h-10 rounded-md border border-input bg-background px-3 mt-1"
                      value={formData.educationType}
                      onChange={(e) => setFormData({...formData, educationType: e.target.value})}
                    >
                      <option value="">Select type</option>
                      <option value="college">College Trip</option>
                      <option value="school">School Trip</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Pricing & Capacity */}
              <div className="space-y-4">
                <h2 className="font-semibold text-lg text-card-foreground border-b pb-2">Pricing & Capacity</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Final Price per Person (₹) *</Label>
                    <Input
                      id="price"
                      required
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="e.g., 15000"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="originalPrice">Original Price (₹)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                      placeholder="For showing discount"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="prebookingAmount">Prebooking Amount (₹)</Label>
                    <Input
                      id="prebookingAmount"
                      type="number"
                      value={formData.prebookingAmount}
                      onChange={(e) => setFormData({...formData, prebookingAmount: e.target.value})}
                      placeholder="e.g., 2000"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Amount to reserve a spot (rest paid later)
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="earlyBirdPrice">Early Bird Price (₹)</Label>
                    <Input
                      id="earlyBirdPrice"
                      type="number"
                      value={formData.earlyBirdPrice}
                      onChange={(e) => setFormData({...formData, earlyBirdPrice: e.target.value})}
                      placeholder="e.g., 12000"
                      className="mt-1"
                    />
                  </div>
                </div>

                {formData.earlyBirdPrice && (
                  <div>
                    <Label htmlFor="earlyBirdDeadline">Early Bird Deadline</Label>
                    <Input
                      id="earlyBirdDeadline"
                      type="date"
                      value={formData.earlyBirdDeadline}
                      onChange={(e) => setFormData({...formData, earlyBirdDeadline: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                )}

                {/* Couple Discount */}
                <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Couple Discount</Label>
                      <p className="text-sm text-muted-foreground">
                        Offer special pricing for couples booking together
                      </p>
                    </div>
                    <Switch
                      checked={formData.coupleDiscountEnabled}
                      onCheckedChange={(checked) => setFormData({...formData, coupleDiscountEnabled: checked})}
                    />
                  </div>
                  
                  {formData.coupleDiscountEnabled && (
                    <div>
                      <Label htmlFor="coupleDiscountPercent">Discount Percentage (%)</Label>
                      <Input
                        id="coupleDiscountPercent"
                        type="number"
                        min="1"
                        max="50"
                        value={formData.coupleDiscountPercent}
                        onChange={(e) => setFormData({...formData, coupleDiscountPercent: e.target.value})}
                        placeholder="e.g., 10"
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="durationDays">Duration (Days) *</Label>
                    <Input
                      id="durationDays"
                      required
                      type="number"
                      value={formData.durationDays}
                      onChange={(e) => setFormData({...formData, durationDays: e.target.value})}
                      placeholder="e.g., 3"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxParticipants">Max Participants *</Label>
                    <Input
                      id="maxParticipants"
                      required
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
                      placeholder="e.g., 30"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <select
                    id="difficulty"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 mt-1"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                  >
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="difficult">Difficult</option>
                    <option value="extreme">Extreme</option>
                  </select>
                </div>

                {/* Referral Settings */}
                <div className="p-4 bg-muted/50 rounded-lg space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Enable Referral Discounts</Label>
                      <p className="text-sm text-muted-foreground">
                        Offer discount when users refer others who purchase this trip
                      </p>
                    </div>
                    <Switch
                      checked={formData.referralEnabled}
                      onCheckedChange={(checked) => setFormData({...formData, referralEnabled: checked})}
                    />
                  </div>
                  
                  {formData.referralEnabled && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="referralMinPurchases">Min Purchases Required</Label>
                          <Input
                            id="referralMinPurchases"
                            type="number"
                            min="1"
                            max="100"
                            value={formData.referralMinPurchases}
                            onChange={(e) => setFormData({...formData, referralMinPurchases: e.target.value})}
                            placeholder="e.g., 1"
                            className="mt-1"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            How many referred users must purchase before referrer gets discount
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="referralDiscount">Discount Amount (%)</Label>
                          <Input
                            id="referralDiscount"
                            type="number"
                            min="1"
                            max="50"
                            value={formData.referralDiscountPercent}
                            onChange={(e) => setFormData({...formData, referralDiscountPercent: e.target.value})}
                            placeholder="e.g., 5"
                            className="mt-1"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Discount % for referred users
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-4">
                <h2 className="font-semibold text-lg text-card-foreground border-b pb-2">Schedule</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="meetingPoint">Meeting Point</Label>
                  <Input
                    id="meetingPoint"
                    value={formData.meetingPoint}
                    onChange={(e) => setFormData({...formData, meetingPoint: e.target.value})}
                    placeholder="e.g., Delhi Railway Station, Gate 1"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Inclusions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h2 className="font-semibold text-lg text-card-foreground">Inclusions</h2>
                  <Button type="button" variant="ghost" size="sm" onClick={handleAddInclusion}>
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
                
                {formData.inclusions.map((inclusion, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={inclusion}
                      onChange={(e) => {
                        const newInclusions = [...formData.inclusions];
                        newInclusions[index] = e.target.value;
                        setFormData({...formData, inclusions: newInclusions});
                      }}
                      placeholder="e.g., Breakfast included"
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveInclusion(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Exclusions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h2 className="font-semibold text-lg text-card-foreground">Exclusions</h2>
                  <Button type="button" variant="ghost" size="sm" onClick={handleAddExclusion}>
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
                
                {formData.exclusions.map((exclusion, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={exclusion}
                      onChange={(e) => {
                        const newExclusions = [...formData.exclusions];
                        newExclusions[index] = e.target.value;
                        setFormData({...formData, exclusions: newExclusions});
                      }}
                      placeholder="e.g., Airfare not included"
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveExclusion(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Trip'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
