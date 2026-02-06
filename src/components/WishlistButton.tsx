import { Heart } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  tripId: string;
  variant?: 'icon' | 'button';
  className?: string;
}

export function WishlistButton({ tripId, variant = 'icon', className = '' }: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist, loading } = useWishlist();
  const isWishlisted = isInWishlist(tripId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(tripId);
  };

  if (variant === 'icon') {
    return (
      <button 
        onClick={handleClick}
        disabled={loading}
        className={cn(
          "w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-colors",
          isWishlisted 
            ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" 
            : "bg-background/20 text-background hover:bg-background/30",
          loading && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <Heart className={cn("w-5 h-5", isWishlisted && "fill-current")} />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        isWishlisted
          ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
          : "bg-muted text-muted-foreground hover:bg-muted/80",
        loading && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
      {isWishlisted ? "Saved" : "Save"}
    </button>
  );
}
