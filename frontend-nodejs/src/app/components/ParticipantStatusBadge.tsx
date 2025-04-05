"use client";

import { cn } from "@/lib/utils";
import { Participant } from "../../types/room";
import { getStatusColor, getStatusLabel } from "../../utils/roomUtils";

interface ParticipantStatusBadgeProps {
  status: Participant["status"];
  className?: string;
  showLabel?: boolean;
}

/**
 * 参加者のステータスを示すバッジコンポーネント
 */
export default function ParticipantStatusBadge({
  status,
  className,
  showLabel = false,
}: ParticipantStatusBadgeProps) {
  return (
    <div className="flex items-center">
      <span
        className={cn(
          "inline-block w-2 h-2 rounded-full mr-2",
          getStatusColor(status),
          className,
        )}
        aria-label={`ステータス: ${getStatusLabel(status)}`}
      />
      {showLabel && (
        <span className="text-xs text-gray-600">{getStatusLabel(status)}</span>
      )}
    </div>
  );
}
