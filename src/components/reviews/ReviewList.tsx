import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, User, Loader2 } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user: {
    full_name: string;
    avatar_url: string | null;
  } | null;
}

interface ReviewListProps {
  tripId: string;
  refreshTrigger?: number;
}

export function ReviewList({ tripId, refreshTrigger }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [tripId, refreshTrigger]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          created_at,
          user_id
        `)
        .eq("trip_id", tripId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // Fetch profiles for each user
        const userIds = [...new Set(data.map(r => r.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

        const reviewsWithUsers = data.map(review => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          created_at: review.created_at,
          user: profileMap.get(review.user_id) || null,
        }));

        setReviews(reviewsWithUsers);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h4 className="font-semibold text-card-foreground mb-2">No reviews yet</h4>
        <p className="text-muted-foreground text-sm">Be the first to review this trip!</p>
      </div>
    );
  }

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-4 pb-4 border-b border-border">
        <div className="text-center">
          <div className="text-3xl font-bold text-card-foreground">{averageRating.toFixed(1)}</div>
          <div className="flex items-center justify-center gap-0.5 my-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(averageRating)
                    ? "fill-warning text-warning"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-muted-foreground">{reviews.length} reviews</div>
        </div>
        <div className="flex-1">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = reviews.filter(r => r.rating === stars).length;
            const percentage = (count / reviews.length) * 100;
            return (
              <div key={stars} className="flex items-center gap-2 text-sm">
                <span className="w-8 text-muted-foreground">{stars}★</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-warning rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
              {review.user?.avatar_url ? (
                <img
                  src={review.user.avatar_url}
                  alt={review.user.full_name || "User"}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-card-foreground">
                  {review.user?.full_name || "Anonymous"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-0.5 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= review.rating
                        ? "fill-warning text-warning"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground text-sm">{review.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
