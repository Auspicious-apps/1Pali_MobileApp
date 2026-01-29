export interface GetBlogByIdResponse {
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
  comments: Comment[];
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  isLikedByUser: boolean;
  commentsPagination: CommentsPagination;
}

export interface Comment {
  id: string;
  userId: string;
  blogId: string;
  parentCommentId: any;
  content: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface User {
  name: any;
  id: string;
  profilePicture: any;
  email: string;
  assignedNumber: number;
}

export interface CommentsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
