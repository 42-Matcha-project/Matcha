'use client'

import { Sidebar } from '../components/Sidebar';
import React, { useState } from 'react';

const Timeline: React.FC = () => {
  const [post, setPost] = useState('');
  const [posts, setPosts] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (post.trim()) {
      setPosts([post, ...posts]);
      setPost('');
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="p-5">
        <h1 className="text-2xl mb-4">タイムライン</h1>
        <form onSubmit={handleSubmit} className="mb-4">
          <textarea
            value={post}
            onChange={(e) => setPost(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="今何をしていますか？"
          />
          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            投稿
          </button>
        </form>
        <div>
          {posts.map((p, index) => (
            <div key={index} className="p-4 mb-2 border rounded">
              {p}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
