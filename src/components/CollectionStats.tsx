import { CollectionStats as StatsType } from '@/types/collection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StarRating } from './StarRating';
import { TrendingUp, Target, Clock, Archive } from 'lucide-react';

interface CollectionStatsProps {
  stats: StatsType;
}

export function CollectionStats({ stats }: CollectionStatsProps) {
  const categoryStats = [
    { category: 'books', label: 'Books', count: stats.byCategory.books, color: 'books' },
    { category: 'movies', label: 'Movies', count: stats.byCategory.movies, color: 'movies' },
    { category: 'manga', label: 'Manga', count: stats.byCategory.manga, color: 'manga' },
    { category: 'tv', label: 'TV Series', count: stats.byCategory.tv, color: 'tv' },
  ];

  const statusStats = [
    { 
      key: 'completed', 
      label: 'Completed', 
      count: stats.byStatus.completed, 
      icon: Target,
      className: 'bg-green-50 border-green-200 text-green-800'
    },
    { 
      key: 'in-progress', 
      label: 'In Progress', 
      count: stats.byStatus['in-progress'], 
      icon: Clock,
      className: 'bg-blue-50 border-blue-200 text-blue-800'
    },
    { 
      key: 'planned', 
      label: 'Planned', 
      count: stats.byStatus.planned, 
      icon: TrendingUp,
      className: 'bg-gray-50 border-gray-200 text-gray-800'
    },
    { 
      key: 'dropped', 
      label: 'Dropped', 
      count: stats.byStatus.dropped, 
      icon: Archive,
      className: 'bg-red-50 border-red-200 text-red-800'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total & Average Rating */}
      <Card className="md:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Collection Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {stats.total}
            </div>
            <p className="text-sm text-muted-foreground">
              Total Items
            </p>
          </div>
          
          {stats.total > 0 && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <StarRating rating={Math.round(stats.averageRating)} readonly size="sm" />
                <span className="text-sm font-medium">
                  {stats.averageRating.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Average Rating
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categories */}
      <Card className="md:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            By Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {categoryStats.map((stat) => (
              <div key={stat.category} className="text-center">
                <div className={`text-lg font-bold text-${stat.color}`}>
                  {stat.count}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card className="md:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            By Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {statusStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{stat.label}</span>
                  </div>
                  <Badge variant="outline" className={stat.className}>
                    {stat.count}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}