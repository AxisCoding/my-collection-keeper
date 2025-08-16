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
  onAddItem: (item: Omit<CollectionItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
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
    author_or_director: '',
    year: '',
    genre: '',
    summary: '',
    rating: null as number | null,
    status: 'planned' as CollectionItem['status'],
    personal_notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rating is required for completed and dropped status, optional for in-progress and planned
    const isRatingRequired = formData.status === 'completed' || formData.status === 'dropped';
    
    if (!formData.title || !formData.category || (isRatingRequired && formData.rating === null)) {
      return;
    }

    const newItem: Omit<CollectionItem, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
      title: formData.title,
      category: formData.category,
      status: formData.status,
      ...(formData.rating !== null && { rating: formData.rating }),
      ...(formData.author_or_director && { author_or_director: formData.author_or_director }),
      ...(formData.year && { year: parseInt(formData.year) }),
      ...(formData.genre && { genre: formData.genre }),
      ...(formData.summary && { summary: formData.summary }),
      ...(formData.personal_notes && { personal_notes: formData.personal_notes }),
    };

    onAddItem(newItem);
    
    // Reset form
    setFormData({
      title: '',
      category: '' as CollectionCategory,
      author_or_director: '',
      year: '',
      genre: '',
      summary: '',
      rating: null,
      status: 'planned',
      personal_notes: '',
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
    return (
      <Input
        value={formData.author_or_director}
        onChange={(e) => setFormData({ ...formData, author_or_director: e.target.value })}
      />
    );
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
            <Label htmlFor="creator">{getCreatorLabel()}</Label>
            {getCreatorField()}
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
            <Label htmlFor="genre">Genre</Label>
            <Input
              id="genre"
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              placeholder="e.g., Sci-Fi, Romance, Action"
            />
          </div>

          <div className="space-y-2">
            <Label>Rating {(formData.status === 'completed' || formData.status === 'dropped') ? '*' : ''}</Label>
            <StarRating
              rating={formData.rating}
              onRatingChange={(rating) => setFormData({ ...formData, rating })}
              showNotRated
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