'use client';

import React, { useContext, useEffect, useState, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { SidebarContext } from '../contexts/SidebarContext';
import TweetForm from '../components/TweetForm';
import TweetList from '../components/TweetList';

const Timeline: React.FC = () => {
  const { setIsOpen } = useContext(SidebarContext);
  const [posts, setPosts] = useState<string[]>([]);

  const addTweet = useCallback((tweet: string) => {
    setPosts((prevPosts) => [tweet, ...prevPosts]);
  }, []);

  useEffect(() => {
    setIsOpen(true);
    return () => setIsOpen(false);
  }, [setIsOpen]);

  return (
    <div className="flex">
      <Sidebar />
      <div className="p-5 flex-1">
        <h1 className="text-2xl mb-4">Timeline</h1>
        <TweetForm onAddTweet={addTweet} />
        <TweetList posts={posts} />
      </div>
    </div>
  );
};

export default Timeline;
