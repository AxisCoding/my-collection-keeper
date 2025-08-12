import { useState, useEffect } from 'react';
import { CollectionItem, CollectionCategory, CollectionStats } from '@/types/collection';

const STORAGE_KEY = 'personal-collection';

export function useCollectionStore() {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const itemsWithDates = parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        }));
        setItems(itemsWithDates);
      }
    } catch (error) {
      console.error('Failed to load collection from storage:', error);
    }
    setLoading(false);
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, loading]);

  const addItem = (item: Omit<CollectionItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: CollectionItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setItems(prev => [newItem, ...prev]);
    return newItem;
  };

  const updateItem = (id: string, updates: Partial<CollectionItem>) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, ...updates, updatedAt: new Date() }
          : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const getItemsByCategory = (category: CollectionCategory) => {
    return items.filter(item => item.category === category);
  };

  const searchItems = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return items.filter(item => 
      item.title.toLowerCase().includes(lowercaseQuery) ||
      item.author?.toLowerCase().includes(lowercaseQuery) ||
      item.director?.toLowerCase().includes(lowercaseQuery) ||
      item.studio?.toLowerCase().includes(lowercaseQuery) ||
      item.summary?.toLowerCase().includes(lowercaseQuery)
    );
  };

  const getStats = (): CollectionStats => {
    const byCategory = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<CollectionCategory, number>);

    const byStatus = items.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<CollectionItem['status'], number>);

    const averageRating = items.length > 0
      ? items.reduce((sum, item) => sum + item.rating, 0) / items.length
      : 0;

    return {
      total: items.length,
      byCategory: {
        books: byCategory.books || 0,
        movies: byCategory.movies || 0,
        manga: byCategory.manga || 0,
        tv: byCategory.tv || 0,
      },
      byStatus: {
        completed: byStatus.completed || 0,
        'in-progress': byStatus['in-progress'] || 0,
        planned: byStatus.planned || 0,
        dropped: byStatus.dropped || 0,
      },
      averageRating,
    };
  };

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    getItemsByCategory,
    searchItems,
    getStats,
  };
}