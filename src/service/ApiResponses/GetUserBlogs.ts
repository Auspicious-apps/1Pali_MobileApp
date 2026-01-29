export interface GetUserBlogsResponse {
  blogs: Blog[];
  pagination: Pagination;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  coverPhotoUrl: string;
  photos: string[];
  slug: string;
  excerpt: any;
  tags: any[];
  status: string;
  scheduledAt: any;
  publishedAt: string;
  publishMonth: number;
  publishYear: number;
  publishMonthYear: string;
  likesCount: number;
  comments: any[];
  commentsCount: number;
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
