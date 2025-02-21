"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from "@/app/timeline/types";
import Image from "next/image";

interface TweetFormProps {
  onAddTweet: (tweet: string) => void;
  currentUser: User;
}

const TweetForm: React.FC<TweetFormProps> = ({ onAddTweet, currentUser }) => {
  const [tweet, setTweet] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tweet.trim()) {
      onAddTweet(tweet);
      setTweet("");
      setIsDialogOpen(true);

      // 1.2秒後にダイアログを閉じる
      setTimeout(() => {
        setIsDialogOpen(false);
      }, 1200);
    }
  };

  const containerClass = "w-full max-w-md bg-gray-200 p-4 rounded-lg shadow-md";

  return (
    <div className="flex top justify-center">
      <div className={containerClass}>
        <form onSubmit={handleSubmit} className="p-2 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Image
              src={currentUser.iconImageUrl}
              alt={`${currentUser.username}`}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
            <Textarea
              placeholder="今どうしてる？"
              value={tweet}
              onChange={(e) => setTweet(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
            <div className="flex justify-end mt-5">
              <Button type="submit" disabled={!tweet.trim()}>
                投稿
              </Button>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="custom-dialog [&>button:last-child]:hidden">
              <DialogHeader>
                <DialogTitle>投稿しました</DialogTitle>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </form>
      </div>
    </div>
  );
};

export default TweetForm;
