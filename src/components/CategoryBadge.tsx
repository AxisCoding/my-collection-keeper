import { CollectionCategory } from '@/types/collection';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Book, Film, Tv, Heart } from 'lucide-react';

interface CategoryBadgeProps {
  category: CollectionCategory;
  className?: string;
}

const categoryConfig = {
  books: {
    icon: Book,
    label: 'Book',
    className: 'bg-books/10 text-books border-books/20 hover:bg-books/20',
  },
  movies: {
    icon: Film,
    label: 'Movie',
    className: 'bg-movies/10 text-movies border-movies/20 hover:bg-movies/20',
  },
  manga: {
    icon: Heart,
    label: 'Manga',
    className: 'bg-manga/10 text-manga border-manga/20 hover:bg-manga/20',
  },
  tv: {
    icon: Tv,
    label: 'TV Series',
    className: 'bg-tv/10 text-tv border-tv/20 hover:bg-tv/20',
  },
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const config = categoryConfig[category];
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'transition-all duration-200 font-medium',
        config.className,
        className
      )}
    >
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}