import * as XLSX from 'xlsx';
import { CollectionItem } from '@/types/collection';
import { supabase } from '@/integrations/supabase/client';

export const exportToXLSX = async (items: CollectionItem[]) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    
    // Prepare data for Excel
    const excelData = items.map(item => ({
      'Title': item.title,
      'Category': item.category,
      'Author/Director': item.author_or_director || '',
      'Year': item.year || '',
      'Genre': item.genre || '',
      'Rating (out of 10)': item.rating || '',
      'Status': item.status,
      'Summary': item.summary || '',
      'Personal Notes': item.personal_notes || '',
      'Created Date': new Date(item.created_at).toLocaleDateString(),
      'Last Updated': new Date(item.updated_at).toLocaleDateString()
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Auto-size columns
    const cols = [
      { wch: 30 }, // Title
      { wch: 15 }, // Category
      { wch: 25 }, // Author/Director
      { wch: 8 },  // Year
      { wch: 15 }, // Genre
      { wch: 10 }, // Rating
      { wch: 12 }, // Status
      { wch: 40 }, // Summary
      { wch: 40 }, // Personal Notes
      { wch: 15 }, // Created Date
      { wch: 15 }  // Last Updated
    ];
    worksheet['!cols'] = cols;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Collection');

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const filename = `collection-export-${new Date().toISOString().split('T')[0]}.xlsx`;

    // Create blob and upload to Supabase Storage
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const file = new File([blob], filename, { type: blob.type });

    const filePath = `${user.id}/${filename}`;
    const { data, error } = await supabase.storage
      .from('User-Data-Exports')
      .upload(filePath, file, { upsert: true });

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
    console.error('Excel export error:', error);
    throw error;
  }
};

export const exportToCSV = async (items: CollectionItem[]) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const headers = ['Title', 'Category', 'Author/Director', 'Year', 'Genre', 'Rating', 'Status', 'Summary', 'Personal Notes', 'Created At', 'Updated At'];
    const csvContent = [
      headers.join(','),
      ...items.map(item => [
        `"${item.title.replace(/"/g, '""')}"`,
        `"${item.category}"`,
        `"${item.author_or_director || ''}"`,
        `"${item.year || ''}"`,
        `"${item.genre || ''}"`,
        `"${item.rating || ''}"`,
        `"${item.status}"`,
        `"${(item.summary || '').replace(/"/g, '""')}"`,
        `"${(item.personal_notes || '').replace(/"/g, '""')}"`,
        `"${new Date(item.created_at).toLocaleDateString()}"`,
        `"${new Date(item.updated_at).toLocaleDateString()}"`
      ].join(','))
    ].join('\n');

    const filename = `collection-export-${new Date().toISOString().split('T')[0]}.csv`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const file = new File([blob], filename, { type: blob.type });

    // Upload to Supabase Storage
    const filePath = `${user.id}/${filename}`;
    const { data, error } = await supabase.storage
      .from('User-Data-Exports')
      .upload(filePath, file, { upsert: true });

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
    console.error('CSV export error:', error);
    throw error;
  }
};

export const exportToAnki = async (items: CollectionItem[]) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Create CSV content without headers for Anki import
    const csvContent = items.map(item => [
      `"${item.title.replace(/"/g, '""')}"`,
      `"${item.category}"`,
      `"${item.author_or_director || ''}"`,
      `"${item.year || ''}"`,
      `"${item.genre || ''}"`,
      `"${item.rating || ''}"`,
      `"${item.status}"`,
      `"${(item.summary || '').replace(/"/g, '""')}"`,
      `"${(item.personal_notes || '').replace(/"/g, '""')}"`,
      `"${new Date(item.created_at).toLocaleDateString()}"`,
      `"${new Date(item.updated_at).toLocaleDateString()}"`
    ].join(',')).join('\n');

    const filename = `anki-export-${new Date().toISOString().split('T')[0]}.csv`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const file = new File([blob], filename, { type: blob.type });

    // Upload to Supabase Storage
    const filePath = `${user.id}/${filename}`;
    const { data, error } = await supabase.storage
      .from('User-Data-Exports')
      .upload(filePath, file, { upsert: true });

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
    console.error('Anki export error:', error);
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
                  case 'genre':
                    item.genre = value;
                    break;
                  case 'rating':
                  case 'rating (out of 10)':
                    item.rating = value ? parseFloat(value) : undefined;
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