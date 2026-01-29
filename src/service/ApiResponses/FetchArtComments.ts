export interface FetchArtCommentsResponse {
  comments: Comment[];
  pagination: Pagination;
}

export interface Comment {
  id: string;
  content: string;
  isDeleted: boolean;
  parentCommentId: any;
  user: User;
  replies: any[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: any;
  profilePicture: any;
  assignedNumber: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
