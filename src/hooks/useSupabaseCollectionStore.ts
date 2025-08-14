import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

interface CollectionItem {
  id: string;
  user_id: string;
  title: string;
  category: string;
  author_or_director?: string;
  year?: number;
  rating: number;
  status: string;
  summary?: string;
  personal_notes?: string;
  created_at: string;
  updated_at: string;
}

export function useSupabaseCollectionStore() {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load items from Supabase
  const loadItems = async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error('Error loading items:', error);
      toast({
        title: "Error",
        description: "Failed to load your collection",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [user]);

  const addItem = async (item: Omit<CollectionItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('items')
        .insert([{
          ...item,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      setItems(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Item added to your collection",
      });
      return data;
    } catch (error: any) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateItem = async (id: string, updates: Partial<CollectionItem>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('items')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setItems(prev => 
        prev.map(item => 
          item.id === id ? data : item
        )
      );
      toast({
        title: "Success",
        description: "Item updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating item:', error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const getItemsByCategory = (category: string) => {
    return items.filter(item => item.category === category);
  };

  const searchItems = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return items.filter(item => 
      item.title.toLowerCase().includes(lowercaseQuery) ||
      item.author_or_director?.toLowerCase().includes(lowercaseQuery) ||
      item.summary?.toLowerCase().includes(lowercaseQuery)
    );
  };

  const getStats = () => {
    const byCategory = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byStatus = items.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

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
    loadItems,
  };
}