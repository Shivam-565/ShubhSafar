import { Link } from "react-router-dom";
import { Trip } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, Users, BadgeCheck, Heart } from "lucide-react";
import { WishlistButton } from "@/components/WishlistButton";

interface TripCardProps {
  trip: Trip;
  featured?: boolean;
}

export function TripCard({ trip, featured = false }: TripCardProps) {
  const discountPercent = trip.originalPrice 
    ? Math.round((1 - trip.price / trip.originalPrice) * 100) 
    : 0;

  return (
    <div className={`group block bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${featured ? "md:flex" : ""}`}>
      {/* Image */}
      <div className={`relative overflow-hidden ${featured ? "md:w-2/5" : "aspect-[4/3]"}`}>
        <Link to={`/trips/${trip.id}`}>
          <img 
            src={trip.image} 
            alt={trip.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        <div className="absolute inset-0 bg-gradient-overlay opacity-60 pointer-events-none" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {trip.isFeatured && (
            <Badge className="bg-gradient-golden text-accent-foreground font-semibold">
              Featured
            </Badge>
          )}
          {trip.type === "college" && (
            <Badge className="bg-gradient-coral text-secondary-foreground">
              🎓 College Special
            </Badge>
          )}
          {trip.type === "school" && (
            <Badge className="bg-primary text-primary-foreground">
              🎒 School Trip
            </Badge>
          )}
          {discountPercent > 0 && (
            <Badge variant="destructive">
              {discountPercent}% OFF
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <div className="absolute top-3 right-3">
          <WishlistButton tripId={trip.id} />
        </div>

        {/* Spots Left */}
        {trip.spotsLeft <= 10 && (
          <div className="absolute bottom-3 left-3 bg-destructive/90 text-destructive-foreground px-3 py-1 rounded-full text-sm font-medium">
            Only {trip.spotsLeft} spots left!
          </div>
        )}
      </div>

      {/* Content */}
      <Link to={`/trips/${trip.id}`} className={`block p-5 ${featured ? "md:w-3/5 md:p-6" : ""}`}>
        {/* Organizer */}
        <div className="flex items-center gap-2 mb-3">
          <img 
            src={trip.organizer.avatar} 
            alt={trip.organizer.name}
            className="w-6 h-6 rounded-full bg-muted"
          />
          <span className="text-sm text-muted-foreground">{trip.organizer.name}</span>
          {trip.organizer.verified && (
            <BadgeCheck className="w-4 h-4 text-primary" />
          )}
        </div>

        {/* Title & Destination */}
        <h3 className="font-display text-lg font-bold text-card-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
          {trip.title}
        </h3>
        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
          <MapPin className="w-4 h-4" />
          <span className="line-clamp-1">{trip.destination}</span>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{trip.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{trip.spotsLeft}/{trip.totalSpots} spots</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-warning text-warning" />
            <span className="font-medium text-card-foreground">{trip.rating}</span>
            <span>({trip.reviewCount})</span>
          </div>
        </div>

        {/* Difficulty */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
            trip.difficulty === "easy" 
              ? "bg-success/10 text-success" 
              : trip.difficulty === "moderate"
              ? "bg-warning/10 text-warning"
              : "bg-destructive/10 text-destructive"
          }`}>
            {trip.difficulty.charAt(0).toUpperCase() + trip.difficulty.slice(1)}
          </span>
          <span className="text-xs text-muted-foreground">{trip.category}</span>
        </div>

        {/* Price */}
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-display font-bold text-card-foreground">
                ₹{trip.price.toLocaleString()}
              </span>
              {trip.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{trip.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">per person</span>
          </div>
          <span className="text-sm font-medium text-primary group-hover:underline">
            View Details →
          </span>
        </div>
      </Link>
    </div>
  );
}
