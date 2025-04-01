"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Note } from "../types";

interface NotesPanelProps {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  isDarkMode: boolean;
}

export function NotesPanel({ notes, setNotes, isDarkMode }: NotesPanelProps) {
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const notesListRef = useRef<HTMLDivElement>(null);
  const editAreaRef = useRef<HTMLDivElement>(null);
  const newNoteRef = useRef<HTMLDivElement>(null);

  // 新しいメモを作成したときに参照用
  const [isNewNoteCreated, setIsNewNoteCreated] = useState(false);

  // 新規メモ作成
  const createNewNote = () => {
    const newNote = {
      id: Date.now(),
      title: "新規メモ",
      content: "",
      date: new Date()
        .toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\//g, "/"),
    };

    setEditingNote(newNote);
    setNewNoteTitle(newNote.title);
    setNewNoteContent(newNote.content);
    setIsNewNoteCreated(true);
  };

  // 編集エリアが表示されたときに、テキストエリアにフォーカスする
  useEffect(() => {
    if (editingNote && isNewNoteCreated) {
      // タイトル入力にフォーカス
      const input = editAreaRef.current?.querySelector("input");
      if (input) {
        input.focus();
        setIsNewNoteCreated(false);
      }
    }
  }, [editingNote, isNewNoteCreated]);

  // メモ保存後、新しいメモが見えるようにスクロール
  useEffect(() => {
    if (!editingNote && newNoteRef.current) {
      // 編集モードから抜けた後、最新のメモにスクロール
      newNoteRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [editingNote, notes]);

  // メモ保存
  const saveNote = () => {
    if (!editingNote) return;

    const updatedNote = {
      ...editingNote,
      title: newNoteTitle,
      content: newNoteContent,
      date: new Date()
        .toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\//g, "/"),
    };

    if (notes.some((note) => note.id === editingNote.id)) {
      // 既存のメモを更新
      setNotes(
        notes.map((note) => (note.id === editingNote.id ? updatedNote : note)),
      );
    } else {
      // 新規メモを追加
      setNotes([...notes, updatedNote]);
    }

    setEditingNote(null);
  };

  return (
    <div className="h-full overflow-hidden flex flex-col">
      {editingNote ? (
        <div ref={editAreaRef} className="space-y-3 flex flex-col h-full p-3">
          <Input
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            placeholder="タイトルを入力"
            className={cn(
              isDarkMode
                ? "bg-amber-800 border-amber-700"
                : "bg-white border-amber-200",
            )}
          />

          <Textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="メモを入力"
            className={cn(
              "flex-1 min-h-[100px]",
              isDarkMode
                ? "bg-amber-800 border-amber-700"
                : "bg-white border-amber-200",
              "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2",
              "[&::-webkit-scrollbar-thumb]:rounded-full",
              isDarkMode
                ? "[&::-webkit-scrollbar-thumb]:bg-amber-700 [&::-webkit-scrollbar-track]:bg-amber-900/30"
                : "[&::-webkit-scrollbar-thumb]:bg-amber-300 [&::-webkit-scrollbar-track]:bg-amber-100/50",
            )}
          />

          <div className="flex justify-end space-x-2 pb-4 sticky bottom-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingNote(null)}
              className={cn(
                isDarkMode
                  ? "bg-amber-800 border-amber-700"
                  : "bg-white border-amber-200",
              )}
            >
              キャンセル
            </Button>

            <Button
              size="sm"
              onClick={saveNote}
              className={cn(isDarkMode ? "bg-amber-700" : "bg-amber-600")}
            >
              保存
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* ヘッダー部分 - 固定表示 */}
          <div
            className={cn(
              "flex-shrink-0 sticky top-0 z-10", // 固定表示のためのクラス追加
              isDarkMode ? "bg-amber-950" : "bg-amber-50",
            )}
          >
            {/* ヘッダー部分 - LINE風 */}
            <div
              className={cn(
                "p-2 border-b flex items-center justify-between",
                isDarkMode
                  ? "bg-amber-900 border-amber-800"
                  : "bg-amber-100 border-amber-200",
              )}
            >
              <div className="flex items-center">
                <h3 className="font-medium text-sm">メモ一覧</h3>
              </div>
              <Button
                size="sm"
                onClick={createNewNote}
                className={cn(
                  "flex items-center h-7 px-2 py-1 text-xs",
                  isDarkMode
                    ? "bg-amber-700 hover:bg-amber-600"
                    : "bg-amber-600 hover:bg-amber-500",
                )}
              >
                <Plus className="h-3 w-3 mr-1" />
                新規作成
              </Button>
            </div>

            {/* ガイダンスヒント - 常に表示 */}
            <div
              className={cn(
                "px-3 py-1 text-xs flex items-center justify-between",
                "border-b border-dashed",
                isDarkMode ? "border-amber-800/50" : "border-amber-200/70",
              )}
            >
              <span className="opacity-70">合計{notes.length}件のメモ</span>
              <span className="opacity-70">
                メモを追加するには、右上の「新規作成」ボタンをクリックしてください
              </span>
            </div>
          </div>

          {/* メモリスト - スクロール可能エリア */}
          <div
            ref={notesListRef}
            className={cn(
              "overflow-y-auto p-3 flex-1",
              "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2",
              "[&::-webkit-scrollbar-thumb]:rounded-full",
              isDarkMode
                ? "[&::-webkit-scrollbar-thumb]:bg-amber-700 [&::-webkit-scrollbar-track]:bg-amber-900/30"
                : "[&::-webkit-scrollbar-thumb]:bg-amber-300 [&::-webkit-scrollbar-track]:bg-amber-100/50",
            )}
          >
            {/* メモが空の場合のガイドメッセージ */}
            {notes.length === 0 && (
              <div
                className={cn(
                  "text-center p-4 rounded-lg opacity-80 mt-3",
                  isDarkMode ? "bg-amber-800/50" : "bg-amber-100/50",
                )}
              >
                <Info className="mx-auto h-5 w-5 mb-1" />
                <p className="text-sm mb-3">
                  メモがありません。新しいメモを作成しましょう！
                </p>
                <Button
                  size="sm"
                  onClick={createNewNote}
                  className={cn(
                    "mx-auto flex items-center",
                    isDarkMode ? "bg-amber-700" : "bg-amber-600",
                  )}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  新規メモを作成
                </Button>
              </div>
            )}

            <div className="space-y-3">
              {notes.map((note, index) => (
                <div
                  key={note.id}
                  ref={index === 0 ? newNoteRef : null}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer",
                    isDarkMode
                      ? "bg-amber-800 hover:bg-amber-700"
                      : "bg-amber-50 hover:bg-amber-100",
                  )}
                  onClick={() => {
                    setEditingNote(note);
                    setNewNoteTitle(note.title);
                    setNewNoteContent(note.content);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{note.title}</h4>
                    <span className="text-xs opacity-70">{note.date}</span>
                  </div>
                  <p className="text-sm mt-1 whitespace-pre-line line-clamp-2">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
