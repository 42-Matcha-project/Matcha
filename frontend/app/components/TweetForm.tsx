'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface TweetFormProps {
  onAddTweet: (tweet: string) => void;
}

const TweetForm: React.FC<TweetFormProps> = ({ onAddTweet }) => {
  const [tweet, setTweet] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tweet.trim()) {
      onAddTweet(tweet);
      setTweet('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-b border-gray-200">
      <Textarea
        placeholder="今どうしてる？"
        value={tweet}
        onChange={(e) => setTweet(e.target.value)}
        className="w-full p-2 border rounded-md"
      />
      <div className="flex justify-end mt-2">
        <Button type="submit" disabled={!tweet.trim()}>
          投稿
        </Button>
      </div>
    </form>
  );
};

export default TweetForm;
