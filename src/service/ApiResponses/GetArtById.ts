export interface GetArtByIdResponse {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  thumbnailUrl: any;
  slug: string;
  medium: any;
  dimensions: any;
  artistAge: number;
  artistName: string;
  mediaType: string;
  tags: any[];
  status: string;
  publishedAt: string;
  likesCount: number;
  commentsCount: number;
  comments: Comment[];
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
  artId: string;
  parentCommentId: any;
  content: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface User {
  id: string;
  name: any;
  email: string;
  profilePicture: any;
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
