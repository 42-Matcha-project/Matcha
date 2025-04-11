"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Users } from "lucide-react";
import { useRoomParticipants } from "../../hooks/useRoomParticipants";
import ParticipantStatusBadge from "./ParticipantStatusBadge";

interface ParticipantsDialogProps {
  roomCode: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ParticipantsDialog({
  roomCode,
  isOpen,
  onClose,
}: ParticipantsDialogProps) {
  // リファクタリングしたカスタムフックを使用
  const { participants, isLoading } = useRoomParticipants(roomCode, isOpen);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-amber-200">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-amber-700 mr-2" />
              <h3 className="font-semibold text-lg text-amber-800">
                参加者一覧
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-amber-500 hover:text-amber-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4">
            <div className="mb-4 bg-amber-50 p-3 rounded-md text-amber-800 text-sm flex items-center">
              <span className="font-medium">ルームコード:</span>
              <span className="ml-2 font-bold tracking-wider">{roomCode}</span>
            </div>

            {isLoading ? (
              <div className="py-8 flex justify-center">
                <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[40vh]">
                <div className="space-y-3">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-3 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center">
                        <ParticipantStatusBadge status={participant.status} />
                        <span className="font-medium">{participant.name}</span>
                        {participant.role === "host" && (
                          <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full">
                            ホスト
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-amber-600">
                        {new Date(participant.joinedAt).toLocaleTimeString(
                          "ja-JP",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                        から参加
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-amber-200 bg-amber-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              閉じる
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
