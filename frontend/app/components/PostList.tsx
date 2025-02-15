"use client";

import React, { useState, useRef, useEffect } from "react";
import { User, Post } from "../timeline/types";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface PostListProps {
  users: User[];
  posts: Post[];
}

const options = {
  year: "numeric" as const,
  month: "2-digit" as const,
  day: "2-digit" as const,
  hour: "2-digit" as const,
  minute: "2-digit" as const,
};

const PostList: React.FC<PostListProps> = ({ posts, users }) => {
  const [likes, setLikes] = useState<{ [key: number]: number }>({});
  const router = useRouter();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleLike = (postId: number) => {
    setLikes((prevLikes) => ({
      ...prevLikes,
      [postId]: (prevLikes[postId] || 0) + 1,
    }));
  };

  const handleMessage = () => {
    router.push(`/messages/${users[0].id}`);
  };

  const handleDelete = (postId: number) => {
    // 投稿を削除する処理をここに追加
    console.log(`Delete post: ${postId}`);
  };

  const handleReport = (postId: number) => {
    // 投稿を通報する処理をここに追加
    console.log(`Report post: ${postId}`);
  };

  const toggleMenu = (postId: number) => {
    setOpenMenuId((prevId) => (prevId === postId ? null : postId));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const containerClass = "w-full max-w-md bg-white p-4 rounded-lg shadow-md";

  return (
    <div className="flex flex-col items-center justify-center space-y-4 mt-4">
      {posts.map((post) => {
        const user = users.find((u) => u.id === post.userId);
        if (!user) return null;
        return (
          <div key={post.id} className={containerClass}>
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Image
                    src={user.iconImageUrl}
                    alt={`${user.username}`}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full mr-4 object-cover"
                  />
                  <h4 className="font-bold">{user.username}</h4>
                </div>
                <div className="relative">
                  <button onClick={() => toggleMenu(post.id)}>
                    <Image
                      src="/images/setting.png"
                      alt="設定アイコン"
                      width={20}
                      height={20}
                      className="w-5 h-5"
                    />
                  </button>
                  {openMenuId === post.id && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                    >
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        投稿を削除
                      </button>
                      <button
                        onClick={() => handleReport(post.id)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        投稿を通報
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className="mb-2">{post.content}</p>
              <div className="flex items-center">
                <button onClick={() => handleMessage()}>
                  <Image
                    src="/images/mail.png"
                    alt="メールアイコン"
                    width={20}
                    height={20}
                    className="w-8 h-8 mr-5 ml-3"
                  />
                </button>
                <button
                  onClick={() => handleLike(post.id)}
                  className={`text-2xl ${likes[post.id] ? "text-red-500" : "text-gray-500"} hover:text-red-700`}
                >
                  ♡
                </button>
                <span>{likes[post.id] || 0}</span>
                <span className="text-sm text-gray-500 ml-auto">
                  {new Date(post.timestamp).toLocaleString("ja-JP", options)}
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
