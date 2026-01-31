export interface GetUserArtResponse {
  artworks: Artwork[];
  pagination: Pagination;
}

export interface Artwork {
  id: string;
  title: string;
  description?: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  slug: string;
  medium: any;
  dimensions: any;
  artistAge?: number;
  artistName?: string;
  mediaType: string;
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
  commentsPagination: CommentsPagination;
}

export interface CommentsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

