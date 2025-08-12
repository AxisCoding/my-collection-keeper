export type CollectionCategory = 'books' | 'movies' | 'manga' | 'tv';

export interface CollectionItem {
  id: string;
  title: string;
  category: CollectionCategory;
  author?: string; // For books
  director?: string; // For movies/TV
  studio?: string; // For manga/anime
  year?: number;
  summary?: string;
  rating: number; // 1-5 stars
  status: 'completed' | 'in-progress' | 'planned' | 'dropped';
  notes?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollectionStats {
  total: number;
  byCategory: Record<CollectionCategory, number>;
  byStatus: Record<CollectionItem['status'], number>;
  averageRating: number;
}