import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseCollectionStore } from '@/hooks/useSupabaseCollectionStore';
import { useAuth } from '@/hooks/useAuth';
import { CollectionItem, CollectionCategory } from '@/types/collection';
import { CollectionItemCard } from '@/components/CollectionItemCard';
import { AddItemDialog } from '@/components/AddItemDialog';
import { EditItemDialog } from '@/components/EditItemDialog';
import { CollectionStats } from '@/components/CollectionStats';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, BookOpen, Library, Download, FileSpreadsheet, FileJson, Upload, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { exportToXLSX, exportToCSV, parseImportFile } from '@/utils/enhancedExportUtils';
import { ViewItemDialog } from '@/components/ViewItemDialog';
import { BulkActionsBar } from '@/components/BulkActionsBar';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    deleteMultipleItems,
    getStats,
    loadItems,
    findDuplicateItem,
  } = useSupabaseCollectionStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CollectionCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<CollectionItem['status'] | 'all'>('all');
  const [editingItem, setEditingItem] = useState<CollectionItem | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<CollectionItem | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const filteredItems = useMemo(() => {
    let filtered = items;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.author_or_director?.toLowerCase().includes(query) ||
        item.summary?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    return filtered;
  }, [items, searchQuery, selectedCategory, selectedStatus]);

  const stats = getStats();

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
  };

  const handleEditItem = (item: CollectionItem) => {
    setEditingItem(item);
    setEditDialogOpen(true);
  };

  const handleViewItem = (item: CollectionItem) => {
    setViewingItem(item);
    setViewDialogOpen(true);
  };

  const handleToggleSelectItem = (itemId: string) => {
    setSelectedItems(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(itemId)) {
        newSelected.delete(itemId);
      } else {
        newSelected.add(itemId);
      }
      return newSelected;
    });
  };

  const handleClearSelection = () => {
    setSelectedItems(new Set());
  };

  const handleDeleteSelected = async () => {
    const idsToDelete = Array.from(selectedItems);
    await deleteMultipleItems(idsToDelete);
    setSelectedItems(new Set());
  };

  const handleExportXLSX = async () => {
    try {
      await exportToXLSX(items);
      toast({
        title: "Export Complete",
        description: "Your collection has been exported to Excel and stored in your account.",
      });
    } catch (error) {
      toast({
        title: "Export Error",
        description: "Failed to export your collection.",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = async () => {
    try {
      await exportToCSV(items);
      toast({
        title: "Export Complete",
        description: "Your collection has been exported to CSV and stored in your account.",
      });
    } catch (error) {
      toast({
        title: "Export Error",
        description: "Failed to export your collection.",
        variant: "destructive",
      });
    }
  };

  const handleExportJSON = async () => {
    try {
      const { exportToSupabaseStorage } = await import('@/utils/supabaseExportUtils');
      await exportToSupabaseStorage(items as any, 'json');
      toast({
        title: "Backup Complete", 
        description: "Your collection has been backed up to JSON and stored in your account.",
      });
    } catch (error) {
      toast({
        title: "Backup Error",
        description: "Failed to backup your collection.",
        variant: "destructive",
      });
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const importedData = await parseImportFile(file);
      
      let successCount = 0;
      let errorCount = 0;

      for (const itemData of importedData) {
        if (itemData.title && itemData.category && itemData.status) {
          // Check for duplicates
          const duplicate = findDuplicateItem({
            title: itemData.title,
            category: itemData.category as any,
            author_or_director: itemData.author_or_director,
          });

          if (duplicate) {
            // Skip duplicate
            continue;
          }

          const result = await addItem({
            title: itemData.title,
            category: itemData.category as any,
            author_or_director: itemData.author_or_director,
            year: itemData.year,
            genre: itemData.genre,
            rating: itemData.rating ? Math.max(1, Math.min(10, itemData.rating)) : undefined,
            status: itemData.status as any,
            summary: itemData.summary,
            personal_notes: itemData.personal_notes,
          });
          
          if (result) {
            successCount++;
          } else {
            errorCount++;
          }
        } else {
          errorCount++;
        }
      }

      toast({
        title: "Import Complete",
        description: `Successfully imported ${successCount} items${errorCount > 0 ? `. ${errorCount} items failed to import.` : '.'}`,
      });

      // Refresh the collection
      await loadItems();
    } catch (error) {
      toast({
        title: "Import Error",
        description: "Failed to import file. Please check the format and try again.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all';

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Library className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading your collection...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div></div>
            <div className="flex items-center justify-center gap-3">
              <BookOpen className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                My Collection
              </h1>
            </div>
            <Button variant="outline" onClick={signOut} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Organize and track your personal collection of books, movies, manga, and TV series
          </p>
        </div>

        {/* Stats */}
        {stats.total > 0 && (
          <CollectionStats stats={stats} />
        )}

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search titles, authors, directors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 backdrop-blur-sm"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)}>
                <SelectTrigger className="w-32 bg-background/50 backdrop-blur-sm">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="books">Books</SelectItem>
                  <SelectItem value="movies">Movies</SelectItem>
                  <SelectItem value="manga">Manga</SelectItem>
                  <SelectItem value="tv">TV Series</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as any)}>
                <SelectTrigger className="w-32 bg-background/50 backdrop-blur-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="dropped">Dropped</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={items.length === 0}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportXLSX}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export to Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportCSV}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export to CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportJSON}>
                  <FileJson className="w-4 h-4 mr-2" />
                  Backup as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              onClick={handleImport}
              disabled={importing}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {importing ? 'Importing...' : 'Import'}
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              onChange={handleFileImport}
              className="hidden"
            />

            <AddItemDialog onAddItem={addItem} />
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Search: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedCategory !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Category: {selectedCategory}
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedStatus !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Status: {selectedStatus}
                <button
                  onClick={() => setSelectedStatus('all')}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Collection Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <CollectionItemCard
                key={item.id}
                item={item}
                selected={selectedItems.has(item.id)}
                onToggleSelect={() => handleToggleSelectItem(item.id)}
                onEdit={handleEditItem}
                onDelete={(item) => {
                  if (confirm('Are you sure you want to delete this item?')) {
                    deleteItem(item.id);
                  }
                }}
                onView={handleViewItem}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            {items.length === 0 ? (
              <div className="space-y-4">
                <Library className="w-16 h-16 text-muted-foreground mx-auto" />
                <h3 className="text-xl font-semibold">Your collection is empty</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Start building your personal collection by adding your favorite books, movies, manga, and TV series.
                </p>
                <AddItemDialog onAddItem={addItem} />
              </div>
            ) : (
              <div className="space-y-4">
                <Search className="w-16 h-16 text-muted-foreground mx-auto" />
                <h3 className="text-xl font-semibold">No items found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or filters to find what you're looking for.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        )}

        <EditItemDialog
          item={editingItem}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onUpdateItem={updateItem}
        />

        <ViewItemDialog
          item={viewingItem}
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
        />

        <BulkActionsBar
          selectedCount={selectedItems.size}
          onClearSelection={handleClearSelection}
          onDeleteSelected={handleDeleteSelected}
        />
      </div>
    </div>
  );
};

export default Index;