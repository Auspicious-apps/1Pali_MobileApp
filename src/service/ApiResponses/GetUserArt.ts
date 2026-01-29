export interface GetUserArtResponse {
  artworks: Artwork[];
  pagination: Pagination;
}

export interface Artwork {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  thumbnailUrl: any;
  slug: string;
  medium: any;
  dimensions: any;
  tags: any[];
  status: string;
  publishedAt?: string;
  likesCount: number;
  commentsCount: number;
  comments: any[];
  sharesCount: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
