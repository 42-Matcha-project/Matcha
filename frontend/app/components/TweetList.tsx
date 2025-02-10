'use client';

import React from 'react';

interface TweetListProps {
  posts: string[];
}

const TweetList: React.FC<TweetListProps> = ({ posts }) => (
  <div>
    {posts.map((post, index) => (
      <div key={index} className="p-4 mb-2 border rounded">
        {post}
      </div>
    ))}
  </div>
);

export default TweetList;
