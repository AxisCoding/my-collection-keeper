import { CollectionItem } from '@/types/collection';

export function exportToExcel(items: CollectionItem[]) {
  // Create CSV content (Excel can open CSV files)
  const headers = [
    'Title',
    'Category',
    'Author/Director/Studio',
    'Year',
    'Rating (out of 10)',
    'Status',
    'Summary',
    'Personal Notes',
    'Created Date',
    'Last Updated'
  ];

  const csvContent = [
    headers.join(','),
    ...items.map(item => {
      const creator = item.author || item.director || item.studio || '';
      const row = [
        `"${item.title.replace(/"/g, '""')}"`,
        item.category,
        `"${creator.replace(/"/g, '""')}"`,
        item.year || '',
        item.rating,
        item.status,
        `"${(item.summary || '').replace(/"/g, '""')}"`,
        `"${(item.notes || '').replace(/"/g, '""')}"`,
        item.createdAt.toLocaleDateString(),
        item.updatedAt.toLocaleDateString()
      ];
      return row.join(',');
    })
  ].join('\n');

  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `collection_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function exportToJSON(items: CollectionItem[]) {
  const jsonContent = JSON.stringify(items, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `collection_backup_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}