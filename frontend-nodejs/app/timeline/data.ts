import { User, Post } from "./types";

export const users: User[] = [
  { id: 1, username: "oaoba", iconImageUrl: "/images/user1.png" },
  { id: 2, username: "kkodaira", iconImageUrl: "/images/user2.png" },
];

export const initialPosts: Post[] = [
  { id: 1, userId: 1, content: "dummy dataでテスト中", timestamp: new Date() },
  { id: 2, userId: 2, content: "user2でテスト中", timestamp: new Date() },
];
