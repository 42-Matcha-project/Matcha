// Format time in seconds to "時間:分:秒" format
export const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}時間${minutes}分${seconds}秒`;
  }
  return `${minutes}分${seconds}秒`;
};

// Format deadline date to display with appropriate status
export const formatDeadline = (date: Date): string => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = new Date(date);
    deadline.setHours(0, 0, 0, 0);

    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Date formatting
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const formattedDate = `${year}/${month}/${day}`;

    // Display based on days remaining
    if (diffDays < 0) {
      return `${formattedDate} (期限切れ)`;
    } else if (diffDays === 0) {
      return `${formattedDate} (今日)`;
    } else if (diffDays === 1) {
      return `${formattedDate} (明日)`;
    } else if (diffDays <= 3) {
      return `${formattedDate} (残り${diffDays}日！)`;
    } else if (diffDays <= 7) {
      return `${formattedDate} (残り${diffDays}日)`;
    } else {
      return formattedDate;
    }
  } catch (error) {
    console.error("日付のフォーマットエラー:", error);
    return "無効な日付";
  }
};
