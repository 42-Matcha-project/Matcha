'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FaUserCircle } from 'react-icons/fa';

interface TweetFormProps {
  onAddTweet: (tweet: string) => void;
}

const TweetForm: React.FC<TweetFormProps> = ({ onAddTweet }) => {
  const [tweet, setTweet] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tweet.trim()) {
      onAddTweet(tweet);
      setTweet('');
      setIsDialogOpen(true);

      // 1.2秒後にダイアログを閉じる
      setTimeout(() => {
        setIsDialogOpen(false);
    }, 1200);
  };
};

  return (
    <form onSubmit={handleSubmit} className="p-4 border-b border-gray-200">
      <div className="flex-1">
      <Textarea
        placeholder="今どうしてる？"
        value={tweet}
        onChange={(e) => setTweet(e.target.value)}
        className="w-full p-2 border rounded-md"
        icon={FaUserCircle}
      />
      <div className="flex justify-end mt-2">
        <Button type="submit" disabled={!tweet.trim()}>
          投稿
        </Button>
      </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  <DialogContent  className="custom-dialog [&>button:last-child]:hidden">
    <DialogHeader>
      <DialogTitle>投稿しました</DialogTitle>
    </DialogHeader>
  </DialogContent>
</Dialog>
    </form>
  );
};

export default TweetForm;
