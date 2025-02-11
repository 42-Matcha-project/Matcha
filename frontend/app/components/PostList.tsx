'use client';

import React from 'react';
import { User, Post } from '../timeline/types';

interface PostListProps {
  users: User[];
  posts: Post[];
}

const PostList: React.FC<PostListProps> = ({ posts, users }) => {
  return (
    <div>
      {posts.map((post) => {
        const user = users.find((u) => u.id === post.userId);
        if (!user) return null;
        return (
          <div key={post.id} className="p-4 border-b border-gray-200">
            <div className="flex items-start space-x-4">
              <img
                src={user.iconImageUrl}
                alt={`${user.username}`}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h4 className="font-bold">{user.username}</h4>
                <p>{post.content}</p>
                <span className="text-sm text-gray-500">
                  {new Date().toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PostList;
