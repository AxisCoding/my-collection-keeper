import { CollectionItem } from '@/types/collection';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StarRating } from './StarRating';
import { CategoryBadge } from './CategoryBadge';
import { Button } from '@/components/ui/button';
import { Edit3, Trash2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollectionItemCardProps {
  item: CollectionItem;
  selected?: boolean;
  onToggleSelect?: () => void;
  onEdit?: (item: CollectionItem) => void;
  onDelete?: (item: CollectionItem) => void;
  onView?: (item: CollectionItem) => void;
}

export function CollectionItemCard({ item, selected = false, onToggleSelect, onEdit, onDelete, onView }: CollectionItemCardProps) {
  const getCreatorName = () => {
    return item.author_or_director || null;
  };

  const getStatusBadge = () => {
    const statusConfig = {
      completed: { label: 'Completed', className: 'bg-green-100 text-green-800' },
      'in-progress': { label: 'In Progress', className: 'bg-blue-100 text-blue-800' },
      planned: { label: 'Planned', className: 'bg-gray-100 text-gray-800' },
      dropped: { label: 'Dropped', className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[item.status];
    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <Card className={cn(
      'group relative overflow-hidden transition-all duration-300',
      'hover:shadow-lg hover:-translate-y-1',
      'bg-gradient-to-br from-card to-card/95',
      selected && "ring-2 ring-primary bg-primary/5"
    )}>
      {onToggleSelect && (
        <div className="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            className="w-4 h-4 rounded border-border bg-background"
          />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight truncate group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            {getCreatorName() && (
              <p className="text-sm text-muted-foreground mt-1">
                by {getCreatorName()}
              </p>
            )}
            {item.year && (
              <p className="text-xs text-muted-foreground">
                {item.year}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <CategoryBadge category={item.category} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          {item.rating && <StarRating rating={item.rating} readonly size="sm" />}
          {getStatusBadge()}
        </div>

        {item.summary && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {item.summary}
          </p>
        )}

        <div className="flex items-center gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(item)}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(item)}
              className="flex-1"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(item)}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}