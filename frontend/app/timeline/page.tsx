"use client";

import React, { useContext, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { SidebarContext } from "../contexts/SidebarContext";
import TweetForm from "../components/TweetForm";
import PostList from "../components/PostList";
import { Post } from "./types";
import { users, initialPosts } from "./data";
import Layout from "../components/Layout";

const currentUser = users[0]; // 仮のログインユーザー

const Timeline: React.FC = () => {
  const { setIsOpen } = useContext(SidebarContext);
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  const handleAddTweet = (content: string) => {
    const newPost: Post = {
      id: posts.length + 1,
      userId: currentUser.id,
      content,
      timestamp: new Date(),
    };
    setPosts([newPost, ...posts]);
  };

  useEffect(() => {
    setIsOpen(true);
    return () => setIsOpen(false);
  }, [setIsOpen]);

  return (
    <Layout>
      <div className="flex">
        <Sidebar />
        <div className="p-10 flex-1">
          <h1 className="text-2xl mb-4">Timeline</h1>
          <TweetForm onAddTweet={handleAddTweet} currentUser={currentUser} />
          <PostList posts={posts} users={users} />
        </div>
      </div>
    </Layout>
  );
};

export default Timeline;
