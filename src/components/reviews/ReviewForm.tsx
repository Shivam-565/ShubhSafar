import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Star, Loader2 } from "lucide-react";

interface ReviewFormProps {
  tripId: string;
  bookingId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({ tripId, bookingId, onSuccess, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (comment.trim().length < 10) {
      toast.error("Please write at least 10 characters");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to submit a review");
        return;
      }

      const { error } = await supabase.from("reviews").insert({
        trip_id: tripId,
        booking_id: bookingId || null,
        user_id: user.id,
        rating,
        comment: comment.trim(),
      });

      if (error) {
        if (error.code === '23505') {
          toast.error("You've already reviewed this trip");
        } else {
          throw error;
        }
        return;
      }

      // Update trip rating stats
      const { data: reviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("trip_id", tripId);

      if (reviews && reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await supabase
          .from("trips")
          .update({ 
            rating: Math.round(avgRating * 10) / 10,
            review_count: reviews.length 
          })
          .eq("id", tripId);
      }

      toast.success("Review submitted successfully!");
      setRating(0);
      setComment("");
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-card-foreground mb-2">
          Your Rating
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoveredRating || rating)
                    ? "fill-warning text-warning"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select rating'}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-card-foreground mb-2">
          Your Review
        </label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this trip..."
          rows={4}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {comment.length}/500 characters
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Review"
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
