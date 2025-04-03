export interface User {
  id: number;
  username: string;
  iconImageUrl: string;
}

export interface Post {
  id: number;
  userId: number;
  content: string;
  timestamp: Date;
}
