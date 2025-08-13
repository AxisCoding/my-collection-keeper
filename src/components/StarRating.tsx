import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  maxRating?: number;
}

export function StarRating({ rating, onRatingChange, readonly = false, size = 'md', maxRating = 10 }: StarRatingProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleStarClick = (starRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleStarHover = (event: React.MouseEvent<HTMLButtonElement>, starValue: number) => {
    if (readonly || !onRatingChange) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    const newRating = isLeftHalf ? starValue - 0.5 : starValue;
    onRatingChange(newRating);
  };

  const getStarFill = (starValue: number) => {
    if (rating >= starValue) return 'fill-yellow-400 text-yellow-400';
    if (rating >= starValue - 0.5) return 'fill-yellow-400/50 text-yellow-400';
    return 'fill-muted text-muted-foreground';
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(star)}
            onMouseMove={(e) => handleStarHover(e, star)}
            disabled={readonly}
            className={cn(
              'transition-colors duration-200 relative',
              !readonly && 'hover:scale-110 cursor-pointer',
              readonly && 'cursor-default'
            )}
          >
            <Star
              className={cn(
                sizes[size],
                'transition-all duration-200',
                getStarFill(star)
              )}
            />
          </button>
        ))}
      </div>
      {!readonly && (
        <span className="text-sm text-muted-foreground ml-2">
          {rating}/10
        </span>
      )}
    </div>
  );
}