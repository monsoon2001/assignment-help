import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  showValue?: boolean;
  reviewCount?: number;
}

export default function StarRating({ rating, maxRating = 5, size = 16, showValue = true, reviewCount }: StarRatingProps) {
  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: maxRating }).map((_, i) => (
          <Star
            key={i}
            size={size}
            className={i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "text-outline-variant"}
          />
        ))}
      </div>
      {showValue && <span className="text-sm font-semibold text-on-surface">{rating}</span>}
      {reviewCount !== undefined && (
        <span className="text-xs text-on-surface-variant">({reviewCount})</span>
      )}
    </div>
  );
}
