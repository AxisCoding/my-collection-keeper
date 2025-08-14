export type CollectionCategory = 'books' | 'movies' | 'manga' | 'tv';

export interface CollectionItem {
  id: string;
  user_id: string;
  title: string;
  category: CollectionCategory;
  author_or_director?: string;
  year?: number;
  summary?: string;
  rating: number; // 1-10 stars with half increments
  status: 'completed' | 'in-progress' | 'planned' | 'dropped';
  personal_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CollectionStats {
  total: number;
  byCategory: Record<CollectionCategory, number>;
  byStatus: Record<CollectionItem['status'], number>;
  averageRating: number;
}