// Type for user profile response
export type GetUserProfileResponse = {
  id: string;
  email: string;
  name: string;
  profilePicture: string;
  provider: string;
  assignedNumber: number | null;
  joinedPosition: number;
  createdAt: string;
  updatedAt: string;
};
