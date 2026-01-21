// Type for v1/auth/google response
export type GoogleSigninResponse = {
  user: {
    id: string;
    email: string;
    name: string;
    profilePicture: string;
    provider: string;
    assignedNumber: number | null;
    joinedPosition: number;
    createdAt: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  isNewUser: boolean;
};
