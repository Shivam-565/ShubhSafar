import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, Trash2, Image, Sparkles, Upload, Loader2, Save, FileText } from "lucide-react";

// Helper to detect phone numbers in text
const containsPhoneNumber = (text: string): boolean => {
  const phoneRegex = /(\+?\d{1,4}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?[\d\s.-]{6,}/g;
  return phoneRegex.test(text);
};

export default function EditTrip() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [itineraryPdfUrl, setItineraryPdfUrl] = useState<string>("");
  const [hasBookings, setHasBookings] = useState(false);

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
    inclusions: [""],
    exclusions: [""],
    isActive: true,
    referralEnabled: false,
    referralDiscountPercent: "5",
    referralMinPurchases: "1",
  });

  useEffect(() => {
    if (id) {
      fetchTripData();
    }
  }, [id]);

  const fetchTripData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: profile } = await supabase
        .from('organizer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profile) {
        toast.error('Please complete organizer registration first');
        navigate('/organizer');
        return;
      }

      const { data: trip, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', id)
        .eq('organizer_id', profile.id)
        .maybeSingle();

      if (error) throw error;

      if (!trip) {
        toast.error('Trip not found or you do not have permission to edit it');
        navigate('/organizer/trips');
        return;
      }

      // Check if trip has bookings
      const { count } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('trip_id', id);
      
      setHasBookings((count || 0) > 0);

      setFormData({
        title: trip.title || "",
        destination: trip.destination || "",
        description: trip.description || "",
        category: trip.category || "adventure",
        tripType: trip.trip_type || "public",
        isEducational: trip.is_educational || false,
        educationType: trip.education_type || "",
        price: trip.price?.toString() || "",
        originalPrice: trip.original_price?.toString() || "",
        prebookingAmount: trip.prebooking_amount?.toString() || "",
        earlyBirdPrice: trip.early_bird_price?.toString() || "",
        earlyBirdDeadline: trip.early_bird_deadline || "",
        coupleDiscountEnabled: trip.couple_discount_enabled || false,
        coupleDiscountPercent: trip.couple_discount_percent?.toString() || "10",
        durationDays: trip.duration_days?.toString() || "",
        maxParticipants: trip.max_participants?.toString() || "",
        startDate: trip.start_date || "",
        endDate: trip.end_date || "",
        meetingPoint: trip.meeting_point || "",
        difficulty: trip.difficulty_level || "easy",
        inclusions: trip.inclusions?.length ? trip.inclusions : [""],
        exclusions: trip.exclusions?.length ? trip.exclusions : [""],
        isActive: trip.is_active ?? true,
        referralEnabled: trip.referral_enabled || false,
        referralDiscountPercent: trip.referral_discount_percent?.toString() || "5",
        referralMinPurchases: trip.referral_min_purchases?.toString() || "1",
      });
      setImageUrl(trip.image_url || "");
      setItineraryPdfUrl(trip.itinerary_pdf_url || "");
    } catch (error) {
      console.error('Error fetching trip:', error);
      toast.error('Failed to load trip data');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

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

    if (file.size > 10 * 1024 * 1024) {
      toast.error('PDF must be less than 10MB');
      return;
    }

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
      const { error } = await supabase
        .from('trips')
        .update({
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
          is_active: formData.isActive,
          referral_enabled: formData.referralEnabled,
          referral_discount_percent: formData.referralEnabled ? parseFloat(formData.referralDiscountPercent) : 0,
          referral_min_purchases: formData.referralEnabled ? parseInt(formData.referralMinPurchases) : 1,
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Trip updated successfully!');
      navigate('/organizer/trips');
    } catch (error) {
      console.error('Error updating trip:', error);
      toast.error('Failed to update trip');
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-display text-2xl font-bold text-card-foreground">
                  Edit Trip
                </h1>
                <p className="text-muted-foreground">
                  Update your trip details
                </p>
                {hasBookings && (
                  <p className="text-sm text-amber-600 mt-2">
                    ⚠️ This trip has bookings. Some fields cannot be changed.
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Active</span>
                <Switch 
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                />
              </div>
            </div>

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
                    disabled={hasBookings}
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
                      disabled={hasBookings}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <select
                      id="category"
                      className="w-full h-10 rounded-md border border-input bg-background px-3 mt-1"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      disabled={hasBookings}
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
                      disabled={hasBookings}
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
                      disabled={hasBookings}
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
                      disabled={hasBookings}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="meetingPoint">Meeting Point</Label>
                  <Input
                    id="meetingPoint"
                    value={formData.meetingPoint}
                    onChange={(e) => setFormData({...formData, meetingPoint: e.target.value})}
                    placeholder="e.g., Delhi Railway Station"
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
                {formData.inclusions.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => {
                        const updated = [...formData.inclusions];
                        updated[index] = e.target.value;
                        setFormData({...formData, inclusions: updated});
                      }}
                      placeholder="e.g., Accommodation, Meals, Transport"
                    />
                    {formData.inclusions.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleRemoveInclusion(index)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
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
                {formData.exclusions.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => {
                        const updated = [...formData.exclusions];
                        updated[index] = e.target.value;
                        setFormData({...formData, exclusions: updated});
                      }}
                      placeholder="e.g., Personal expenses, Travel insurance"
                    />
                    {formData.exclusions.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleRemoveExclusion(index)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => navigate('/organizer/trips')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="hero" 
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
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
