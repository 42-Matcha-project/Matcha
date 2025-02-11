'use client';

import React, { useState } from 'react';
import { User, Post } from '../timeline/types';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  const handleLike = (postId: number) => {
    setLikes((prevLikes) => ({
      ...prevLikes,
      [postId]: (prevLikes[postId] || 0) + 1,
    }));
  };

  const handleMessage = (userId: number) => {
    // router.push(`/messages/${userId}`);
    router.push(`/messages`);
  };

  const containerClass = 'w-full max-w-md bg-white p-4 rounded-lg shadow-md';

  return (
    <div className="flex flex-col items-center space-y-4 mt-4">
      {posts.map((post) => {
        const user = users.find((u) => u.id === post.userId);
        if (!user) return null;
        return (
          <div key={post.id} className={containerClass}>
            <div className="flex flex-col">
              <div className="flex items-center mb-2">
                <img
                  src={user.iconImageUrl}
                  alt={`${user.username}`}
                  className="w-10 h-10 rounded-full mr-4 object-cover"
                />
                <h4 className="font-bold">{user.username}</h4>
              </div>
              <p className="mb-2">{post.content}</p>
              <div className="flex items-center">
                <button onClick={() => handleMessage(user.id)}>
                  <img
                    src="/images/mail.png"
                    alt="メールアイコン"
                    className="w-8 h-8 mr-5 ml-3"
                  />
                </button>
                <button
                  onClick={() => handleLike(post.id)}
                  className={`text-2xl ${likes ? 'text-red-500' : 'text-gray-500'} hover:text-red-700 `}
                >
                  ♡
                </button>
                <span>{likes[post.id] || 0}</span>
                <span className="text-sm text-gray-500 ml-auto">
                  {new Date(post.timestamp).toLocaleString('ja-JP', options)}
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
