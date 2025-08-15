import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CategoryBadge } from './CategoryBadge';
import { StarRating } from './StarRating';
import { CollectionItem } from '@/types/collection';

interface ViewItemDialogProps {
  item: CollectionItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewItemDialog({ item, open, onOpenChange }: ViewItemDialogProps) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{item.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Category and Status */}
          <div className="flex items-center gap-3">
            <CategoryBadge category={item.category as any} />
            <Badge 
              variant={
                item.status === 'completed' ? 'default' :
                item.status === 'in-progress' ? 'secondary' :
                item.status === 'planned' ? 'outline' : 'destructive'
              }
            >
              {item.status === 'in-progress' ? 'In Progress' : 
               item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Badge>
          </div>

          <Separator />

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {item.author_or_director && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  {item.category === 'books' ? 'Author' : 'Director'}
                </h4>
                <p className="text-base">{item.author_or_director}</p>
              </div>
            )}
            
            {item.year && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Year</h4>
                <p className="text-base">{item.year}</p>
              </div>
            )}
            
            {item.genre && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Genre</h4>
                <p className="text-base">{item.genre}</p>
              </div>
            )}
            
            {item.rating && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Rating</h4>
                <div className="flex items-center gap-2">
                  <StarRating rating={item.rating} readonly />
                  <span className="text-sm text-muted-foreground">({item.rating}/10)</span>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          {item.summary && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Summary</h4>
                <p className="text-base leading-relaxed">{item.summary}</p>
              </div>
            </>
          )}

          {/* Personal Notes */}
          {item.personal_notes && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Personal Notes</h4>
                <p className="text-base leading-relaxed">{item.personal_notes}</p>
              </div>
            </>
          )}

          {/* Metadata */}
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <span className="font-medium">Added:</span> {new Date(item.created_at).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span> {new Date(item.updated_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}