'use client';

import React from 'react';
import { User, Post } from '../timeline/types';
import { useState } from 'react';

interface PostListProps {
  users: User[];
  posts: Post[];
}

const options = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
};

const PostList: React.FC<PostListProps> = ({ posts, users }) => {
  const [likes, setLikes] = useState<{[key: number]: number }>({});

  const handleLike = (postId: number) => {
    setLikes((prevLikes) => ({
      ...prevLikes,
      [postId]: (prevLikes[postId] || 0) + 1,
    }));
  };  

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
                  {new Date(post.timestamp).toLocaleString('ja-JP', options)}
                </span>
                <button onClick={() => handleLike(post.id)}
                  className="text-red-500"
                >
                  ♡
                </button>
                <span>{likes[post.id] || 0}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PostList;
