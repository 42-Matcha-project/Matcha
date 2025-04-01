"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
  };

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
    <>
      {editingNote ? (
        <div className="space-y-3">
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
              "min-h-[120px]",
              isDarkMode
                ? "bg-amber-800 border-amber-700"
                : "bg-white border-amber-200",
            )}
          />

          <div className="flex justify-end space-x-2">
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
        <>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">メモ一覧</h3>
            <Button
              size="sm"
              onClick={createNewNote}
              className={cn(
                "flex items-center",
                isDarkMode ? "bg-amber-700" : "bg-amber-600",
              )}
            >
              <Plus className="h-4 w-4 mr-1" />
              新規作成
            </Button>
          </div>

          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
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
        </>
      )}
    </>
  );
}
