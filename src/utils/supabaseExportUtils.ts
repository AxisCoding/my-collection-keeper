import { supabase } from '@/integrations/supabase/client';

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

export const exportToSupabaseStorage = async (items: CollectionItem[], format: 'csv' | 'json') => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let content: string;
    let filename: string;
    let contentType: string;

    if (format === 'csv') {
      const headers = ['Title', 'Category', 'Author/Director', 'Year', 'Rating', 'Status', 'Summary', 'Personal Notes', 'Created At', 'Updated At'];
      const csvContent = [
        headers.join(','),
        ...items.map(item => [
          `"${item.title.replace(/"/g, '""')}"`,
          `"${item.category}"`,
          `"${item.author_or_director || ''}"`,
          `"${item.year || ''}"`,
          `"${item.rating}"`,
          `"${item.status}"`,
          `"${(item.summary || '').replace(/"/g, '""')}"`,
          `"${(item.personal_notes || '').replace(/"/g, '""')}"`,
          `"${new Date(item.created_at).toLocaleDateString()}"`,
          `"${new Date(item.updated_at).toLocaleDateString()}"`
        ].join(','))
      ].join('\n');
      
      content = csvContent;
      filename = `collection-export-${new Date().toISOString().split('T')[0]}.csv`;
      contentType = 'text/csv';
    } else {
      content = JSON.stringify(items, null, 2);
      filename = `collection-backup-${new Date().toISOString().split('T')[0]}.json`;
      contentType = 'application/json';
    }

    const blob = new Blob([content], { type: contentType });
    const file = new File([blob], filename, { type: contentType });

    // Upload to Supabase Storage
    const filePath = `${user.id}/${filename}`;
    const { data, error } = await supabase.storage
      .from('User-Data-Exports')
      .upload(filePath, file, {
        upsert: true
      });

    if (error) throw error;

    // Also trigger download for immediate access
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return data;
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

export const getExportedFiles = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.storage
      .from('User-Data-Exports')
      .list(user.id);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting exported files:', error);
    throw error;
  }
};

export const downloadExportedFile = async (filename: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.storage
      .from('User-Data-Exports')
      .download(`${user.id}/${filename}`);

    if (error) throw error;

    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};

export const parseImportFile = async (file: File): Promise<Partial<CollectionItem>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        if (file.name.endsWith('.json')) {
          const data = JSON.parse(content);
          resolve(Array.isArray(data) ? data : [data]);
        } else if (file.name.endsWith('.csv')) {
          const lines = content.split('\n');
          const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
          const items = lines.slice(1)
            .filter(line => line.trim())
            .map(line => {
              const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
              const item: any = {};
              
              headers.forEach((header, index) => {
                const value = values[index]?.replace(/^"(.*)"$/, '$1').replace(/""/g, '"') || '';
                
                switch (header.toLowerCase()) {
                  case 'title':
                    item.title = value;
                    break;
                  case 'category':
                    item.category = value;
                    break;
                  case 'author/director':
                  case 'author_or_director':
                    item.author_or_director = value;
                    break;
                  case 'year':
                    item.year = value ? parseInt(value) : undefined;
                    break;
                  case 'rating':
                    item.rating = value ? parseFloat(value) : 1;
                    break;
                  case 'status':
                    item.status = value;
                    break;
                  case 'summary':
                    item.summary = value;
                    break;
                  case 'personal notes':
                  case 'personal_notes':
                    item.personal_notes = value;
                    break;
                }
              });
              
              return item;
            });
          
          resolve(items);
        } else {
          reject(new Error('Unsupported file format. Please use CSV or JSON.'));
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};