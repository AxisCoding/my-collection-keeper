import { useState, useEffect } from 'react';
import { CollectionItem, CollectionCategory } from '@/types/collection';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StarRating } from './StarRating';

interface EditItemDialogProps {
  item: CollectionItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateItem: (id: string, updates: Partial<CollectionItem>) => void;
}

const categoryOptions = [
  { value: 'books', label: 'Book' },
  { value: 'movies', label: 'Movie' },
  { value: 'manga', label: 'Manga' },
  { value: 'tv', label: 'TV Series' },
];

const statusOptions = [
  { value: 'completed', label: 'Completed' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'planned', label: 'Planned' },
  { value: 'dropped', label: 'Dropped' },
];

export function EditItemDialog({ item, open, onOpenChange, onUpdateItem }: EditItemDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    category: '' as CollectionCategory,
    author_or_director: '',
    year: '',
    summary: '',
    rating: 0,
    status: 'planned' as CollectionItem['status'],
    personal_notes: '',
  });

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        category: item.category,
        author_or_director: item.author_or_director || '',
        year: item.year?.toString() || '',
        summary: item.summary || '',
        rating: item.rating,
        status: item.status,
        personal_notes: item.personal_notes || '',
      });
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!item || !formData.title || !formData.category || formData.rating === 0) {
      return;
    }

    const updates: Partial<CollectionItem> = {
      title: formData.title,
      category: formData.category,
      rating: formData.rating,
      status: formData.status,
      summary: formData.summary || undefined,
      year: formData.year ? parseInt(formData.year) : undefined,
      personal_notes: formData.personal_notes || undefined,
      author_or_director: formData.author_or_director || undefined,
    };

    onUpdateItem(item.id, updates);
    onOpenChange(false);
  };

  const getCreatorLabel = () => {
    switch (formData.category) {
      case 'books':
        return 'Author';
      case 'movies':
      case 'tv':
        return 'Director';
      case 'manga':
        return 'Studio/Author';
      default:
        return 'Creator';
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value as CollectionCategory })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.category && (
            <div className="space-y-2">
              <Label htmlFor="creator">{getCreatorLabel()}</Label>
              <Input
                value={formData.author_or_director}
                onChange={(e) => setFormData({ ...formData, author_or_director: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              placeholder="e.g., 2023"
            />
          </div>

          <div className="space-y-2">
            <Label>Rating *</Label>
            <StarRating
              rating={formData.rating}
              onRatingChange={(rating) => setFormData({ ...formData, rating })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as CollectionItem['status'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Brief description..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="personal_notes">Personal Notes</Label>
            <Textarea
              id="personal_notes"
              value={formData.personal_notes}
              onChange={(e) => setFormData({ ...formData, personal_notes: e.target.value })}
              placeholder="Your thoughts, recommendations, etc..."
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Update Item
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}