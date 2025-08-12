import { useState } from 'react';
import { CollectionItem, CollectionCategory } from '@/types/collection';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus } from 'lucide-react';

interface AddItemDialogProps {
  onAddItem: (item: Omit<CollectionItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
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

export function AddItemDialog({ onAddItem }: AddItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '' as CollectionCategory,
    author: '',
    director: '',
    studio: '',
    year: '',
    summary: '',
    rating: 0,
    status: 'planned' as CollectionItem['status'],
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || formData.rating === 0) {
      return;
    }

    const newItem: Omit<CollectionItem, 'id' | 'createdAt' | 'updatedAt'> = {
      title: formData.title,
      category: formData.category,
      rating: formData.rating,
      status: formData.status,
      ...(formData.author && { author: formData.author }),
      ...(formData.director && { director: formData.director }),
      ...(formData.studio && { studio: formData.studio }),
      ...(formData.year && { year: parseInt(formData.year) }),
      ...(formData.summary && { summary: formData.summary }),
      ...(formData.notes && { notes: formData.notes }),
    };

    onAddItem(newItem);
    
    // Reset form
    setFormData({
      title: '',
      category: '' as CollectionCategory,
      author: '',
      director: '',
      studio: '',
      year: '',
      summary: '',
      rating: 0,
      status: 'planned',
      notes: '',
    });
    
    setOpen(false);
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

  const getCreatorField = () => {
    switch (formData.category) {
      case 'books':
        return (
          <Input
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          />
        );
      case 'movies':
      case 'tv':
        return (
          <Input
            value={formData.director}
            onChange={(e) => setFormData({ ...formData, director: e.target.value })}
          />
        );
      case 'manga':
        return (
          <Input
            value={formData.studio}
            onChange={(e) => setFormData({ ...formData, studio: e.target.value })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
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
              {getCreatorField()}
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
            <Label htmlFor="notes">Personal Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Your thoughts, recommendations, etc..."
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Add Item
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}