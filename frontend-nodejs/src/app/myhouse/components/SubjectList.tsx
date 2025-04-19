"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { BookOpen, RefreshCw, Trash2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

// HTMLImageElementを使用するために明示的に参照
const HTMLImage = globalThis.Image;

// タスク（Work）の型定義
interface Subject {
  ID: number;
  WorkName: string;
  IconImageURL: string;
  notes?: string; // タスクごとのメモ
}

interface SubjectListProps {
  isDarkMode: boolean;
  refreshTrigger?: number; // 親コンポーネントからのリフレッシュトリガー
  isPanelExpanded?: boolean;
}

export function SubjectList({
  isDarkMode,
  refreshTrigger = 0,
  isPanelExpanded = true,
}: SubjectListProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const [draggedOverId, setDraggedOverId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
    null,
  );
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState<string>("");
  const [showNotesMap, setShowNotesMap] = useState<Record<number, boolean>>({});
  const [deleteConfirmSubjectId, setDeleteConfirmSubjectId] = useState<
    number | null
  >(null);
  const [deleteNoteConfirmSubjectId, setDeleteNoteConfirmSubjectId] = useState<
    number | null
  >(null);

  // タスクリストを取得する
  const fetchSubjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setHasAttemptedFetch(true);

      // トークンを取得
      let token = localStorage.getItem("token");
      if (!token) {
        // トークンがない場合は静かに失敗する（エラーメッセージを表示しない）
        setSubjects([]);
        return;
      }

      // 認証テスト
      try {
        const testResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/profile/get`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        // 認証に失敗した場合、ログインし直す
        if (!testResponse.ok) {
          // テストアカウントでログイン
          const loginResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/auth/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                Username: "test",
                Password: "test",
              }),
            },
          );

          if (!loginResponse.ok) {
            console.error("再認証に失敗しました");
            setSubjects([]);
            return;
          }

          const data = await loginResponse.json();
          if (typeof data.Token === "string") {
            token = data.Token;
            if (token) {
              localStorage.setItem("token", token);
            }
          } else {
            console.error("無効なトークン形式");
            setSubjects([]);
            return;
          }
        }
      } catch (error) {
        console.error("認証テストエラー:", error);
        setSubjects([]);
        return;
      }

      // タスクリストを取得
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/works/get`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        // エラーをコンソールにログするが、UIにはメッセージを表示しない
        console.error(
          "タスクリスト取得エラー:",
          response.status,
          response.statusText,
        );
        setSubjects([]);
        return;
      }

      const data = await response.json();
      setSubjects(data.Works || []);
    } catch (error) {
      console.error("タスクリスト取得エラー:", error);
      // エラーをコンソールに記録するだけで、UIには表示しない
      setSubjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  // タスクアイコンを更新する (ローカルストレージのみ)
  const updateSubjectIcon = async (subjectId: number, iconFile: File) => {
    try {
      // ローディング状態を設定
      setIsUploading(subjectId);

      // バリデーション - 画像ファイルのみ
      if (!iconFile.type.startsWith("image/")) {
        toast.error("画像ファイルのみアップロードできます");
        return;
      }

      // ファイルサイズのチェック (1MB制限)
      const maxSize = 1 * 1024 * 1024;
      if (iconFile.size > maxSize) {
        toast.error("ファイルサイズは1MB以下にしてください");
        return;
      }

      // タスクの存在チェック
      const subject = subjects.find((s) => s.ID === subjectId);
      if (!subject) {
        toast.error("タスクが見つかりません");
        return;
      }

      // 画像を圧縮してDataURLに変換
      const compressedImageUrl = await compressImage(iconFile);
      if (!compressedImageUrl) {
        toast.error("画像の処理に失敗しました");
        return;
      }

      // ローカルでアイコンを更新（UIの更新とローカルストレージへの保存）
      updateLocalIcon(subjectId, compressedImageUrl);

      // 成功メッセージ
      toast.success("アイコンを更新しました");
    } catch (error) {
      console.error("アイコン更新エラー:", error);
      toast.error("アイコンの更新に失敗しました");
    } finally {
      // ローディング状態とドラッグ状態をリセット
      setIsUploading(null);
      setDraggedOverId(null);
    }
  };

  // 画像の圧縮処理
  const compressImage = async (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (!event.target || typeof event.target.result !== "string") {
          resolve(null);
          return;
        }

        // HTMLImageElementを使用
        const img = new HTMLImage();
        img.onload = () => {
          // 画像サイズの制限（最大幅・高さ）
          const MAX_WIDTH = 120;
          const MAX_HEIGHT = 120;

          let width = img.width;
          let height = img.height;

          // アスペクト比を維持しつつリサイズ
          if (width > height && width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(null);
            return;
          }

          ctx.fillStyle = "#FFFFFF"; // 背景を白に
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // 画質向上のため圧縮率0.7で保存
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
          resolve(compressedDataUrl);
        };

        img.onerror = () => {
          resolve(null);
        };

        img.src = event.target.result;
      };

      reader.onerror = () => {
        resolve(null);
      };

      reader.readAsDataURL(file);
    });
  };

  // 初期表示時のタスクリスト読み込み
  useEffect(() => {
    // コンポーネントマウント時に一度だけ実行
    fetchSubjects().then(() => {
      // fetchSubjects完了後にキャッシュ復元処理を行う
      restoreIconsFromCache();
    });
  }, []);

  // ローカルストレージからアイコンとノートを復元する関数
  const restoreIconsFromCache = () => {
    try {
      const cachedIcons = JSON.parse(
        localStorage.getItem("subjectIcons") || "{}",
      );

      // ノートの復元
      const cachedNotes = JSON.parse(
        localStorage.getItem("subjectNotes") || "{}",
      );

      if (
        Object.keys(cachedIcons).length > 0 ||
        Object.keys(cachedNotes).length > 0
      ) {
        setSubjects((prevSubjects) => {
          const updatedSubjects = prevSubjects.map((subject) => {
            // キャッシュのキーは文字列化されているので、文字列比較も行う
            const cacheKey = subject.ID.toString();
            const hasIconCache =
              cachedIcons[subject.ID] || cachedIcons[cacheKey];
            const hasNoteCache =
              cachedNotes[subject.ID] || cachedNotes[cacheKey];

            const updatedSubject = { ...subject };

            if (hasIconCache) {
              // アイコンキャッシュデータを使用
              const iconData = cachedIcons[subject.ID] || cachedIcons[cacheKey];
              updatedSubject.IconImageURL = iconData;
            }

            if (hasNoteCache) {
              // ノートキャッシュデータを使用
              const noteData = cachedNotes[subject.ID] || cachedNotes[cacheKey];
              updatedSubject.notes = noteData;
            }

            return updatedSubject;
          });

          return updatedSubjects;
        });
      }
    } catch (error) {
      console.error("キャッシュされたデータの復元に失敗:", error);
    }
  };

  // ローカルでタスクアイコンを更新する
  const updateLocalIcon = (subjectId: number, iconUrl: string) => {
    // 現在のタスクリストをコピー
    const updatedSubjects = subjects.map((subject) => {
      if (subject.ID === subjectId) {
        // 対象のタスクのアイコンを更新（ローカルでは圧縮したDataURLを使用）
        return {
          ...subject,
          IconImageURL: iconUrl,
        };
      }
      return subject;
    });

    // タスクリストを更新
    setSubjects(updatedSubjects);

    // ローカルストレージに画像URLを保存して、リロード後も表示できるようにする
    try {
      // 既存のキャッシュデータを取得
      const cachedIcons = JSON.parse(
        localStorage.getItem("subjectIcons") || "{}",
      );

      // 現在のタスクIDとアイコンURLを追加（IDを文字列化して保存）
      const cacheKey = subjectId.toString();
      cachedIcons[cacheKey] = iconUrl;

      // キャッシュを更新
      localStorage.setItem("subjectIcons", JSON.stringify(cachedIcons));
    } catch (error) {
      console.error("アイコンのローカルストレージキャッシュに失敗:", error);
    }
  };

  // ドラッグイベントハンドラ
  const handleDragOver = (e: React.DragEvent, subjectId: number) => {
    e.preventDefault();
    setDraggedOverId(subjectId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOverId(null);
  };

  const handleDrop = (e: React.DragEvent, subjectId: number) => {
    e.preventDefault();
    setDraggedOverId(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      updateSubjectIcon(subjectId, file);
    }
  };

  // ファイル選択ハンドラ
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (
      e.target.files &&
      e.target.files.length > 0 &&
      selectedSubjectId !== null
    ) {
      const file = e.target.files[0];
      updateSubjectIcon(selectedSubjectId, file);
      e.target.value = ""; // リセット
    }
  };

  // ファイル選択ダイアログを開く
  const openFileSelector = (subjectId: number) => {
    setSelectedSubjectId(subjectId);
    fileInputRef.current?.click();
  };

  // refreshTriggerが変更された場合のみAPIを呼び出す
  // 初期表示時（refreshTrigger=0の場合）はAPIを呼び出さない
  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchSubjects();
    }
  }, [refreshTrigger]);

  // 手動リフレッシュ - ユーザーが明示的に更新ボタンをクリックした場合
  const handleRefresh = () => {
    fetchSubjects();
  };

  // ノートを保存する
  const saveNote = (subjectId: number) => {
    if (noteText.trim() === "") return;

    // タスクリストを更新
    const updatedSubjects = subjects.map((subject) => {
      if (subject.ID === subjectId) {
        return {
          ...subject,
          notes: noteText.trim(),
        };
      }
      return subject;
    });

    setSubjects(updatedSubjects);

    // ローカルストレージに保存
    try {
      const cachedNotes = JSON.parse(
        localStorage.getItem("subjectNotes") || "{}",
      );

      cachedNotes[subjectId.toString()] = noteText.trim();

      localStorage.setItem("subjectNotes", JSON.stringify(cachedNotes));
      toast.success("メモを保存しました");
    } catch (error) {
      console.error("ノートの保存に失敗:", error);
      toast.error("メモの保存に失敗しました");
    }

    // 編集モードを終了
    setEditingNoteId(null);
    setNoteText("");
  };

  // ノートを削除する
  const deleteNote = (subjectId: number) => {
    // 確認ダイアログを閉じる
    setDeleteNoteConfirmSubjectId(null);

    // タスクリストを更新
    const updatedSubjects = subjects.map((subject) => {
      if (subject.ID === subjectId) {
        // notesプロパティを削除（スプレッド演算子を使って残りのプロパティを新しいオブジェクトにコピー）
        const subjectCopy = { ...subject };
        delete subjectCopy.notes;
        return subjectCopy;
      }
      return subject;
    });

    setSubjects(updatedSubjects);

    // ローカルストレージから削除
    try {
      const cachedNotes = JSON.parse(
        localStorage.getItem("subjectNotes") || "{}",
      );

      delete cachedNotes[subjectId.toString()];

      localStorage.setItem("subjectNotes", JSON.stringify(cachedNotes));
      toast.success("メモを削除しました");
    } catch (error) {
      console.error("ノートの削除に失敗:", error);
      toast.error("メモの削除に失敗しました");
    }

    // 編集モードを終了して、メモ表示も閉じる
    setEditingNoteId(null);
    setNoteText("");
    setShowNotesMap((prev) => ({
      ...prev,
      [subjectId]: false,
    }));
  };

  // タスクを削除する
  const deleteSubject = async (subjectId: number) => {
    // 確認ダイアログを閉じる
    setDeleteConfirmSubjectId(null);

    try {
      setIsLoading(true);

      // トークンを取得
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("認証情報がありません。再ログインしてください。");
        return;
      }

      // APIでタスクを削除
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/works/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            WorkID: subjectId,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`タスクの削除に失敗しました (${response.status})`);
      }

      // タスクリストから対象のタスクを削除
      setSubjects(subjects.filter((subject) => subject.ID !== subjectId));

      // ローカルストレージからアイコンとノートを削除
      const cachedIcons = JSON.parse(
        localStorage.getItem("subjectIcons") || "{}",
      );
      const cachedNotes = JSON.parse(
        localStorage.getItem("subjectNotes") || "{}",
      );

      delete cachedIcons[subjectId.toString()];
      delete cachedNotes[subjectId.toString()];

      localStorage.setItem("subjectIcons", JSON.stringify(cachedIcons));
      localStorage.setItem("subjectNotes", JSON.stringify(cachedNotes));

      toast.success("タスクを削除しました");
    } catch (error) {
      console.error("タスク削除エラー:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "タスクの削除中にエラーが発生しました",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ノート表示を切り替え
  const toggleShowNotes = (subjectId: number) => {
    // すでに開いている場合は閉じる
    if (showNotesMap[subjectId]) {
      setShowNotesMap((prev) => ({
        ...prev,
        [subjectId]: false,
      }));
      // 編集モードも解除
      if (editingNoteId === subjectId) {
        setEditingNoteId(null);
      }
    } else {
      // 閉じている場合は開いて、同時に編集モードにする
      setShowNotesMap((prev) => ({
        ...prev,
        [subjectId]: true,
      }));
      // 編集モードに設定し、既存のメモをセット
      const subject = subjects.find((s) => s.ID === subjectId);
      setEditingNoteId(subjectId);
      setNoteText(subject?.notes || "");
    }
  };

  return (
    <div className="mb-6">
      {/* 非表示のファイル入力 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold">登録済みタスク</h3>
        <button
          onClick={handleRefresh}
          className={cn(
            "text-xs px-2 py-1 rounded-full flex items-center",
            isDarkMode
              ? "bg-amber-800 hover:bg-amber-700"
              : "bg-amber-100 hover:bg-amber-200",
          )}
          disabled={isLoading}
        ></button>
      </div>

      {isLoading ? (
        <div className="p-4 text-center">
          <RefreshCw className="h-6 w-6 mx-auto mb-2 animate-spin opacity-50" />
          <p className="text-sm opacity-70">タスクを読み込み中...</p>
        </div>
      ) : subjects.length === 0 ? (
        <div className="p-4 text-center bg-amber-100/30 rounded-lg">
          <BookOpen className="h-6 w-6 mx-auto mb-2 opacity-50" />
          <p className="text-sm opacity-70">登録されているタスクはありません</p>
          <p className="text-xs opacity-50 mt-1">
            「タスク登録」から新しいタスクを追加してください
          </p>
          {hasAttemptedFetch && !isLoading && error && (
            <p className="text-xs text-amber-700 mt-2">
              （タスクリストの取得中にエラーが発生しました。更新ボタンを押して再試行してください）
            </p>
          )}
        </div>
      ) : (
        <ul className="space-y-2 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-transparent will-change-transform">
          {subjects.map((subject, index) => (
            <li
              key={subject.ID}
              className={cn(
                "rounded-lg transition-all ease-in-out duration-300 cursor-pointer",
                "animate-fadeIn",
                isDarkMode
                  ? "bg-amber-800/60 hover:bg-amber-800/80"
                  : "bg-white hover:bg-amber-50 border border-amber-100",
                draggedOverId === subject.ID && "ring-2 ring-amber-400",
              )}
              style={{
                animationDelay: `${index * 50}ms`,
                transform: `translateY(${isPanelExpanded ? "0" : "10px"})`,
                opacity: isPanelExpanded ? 1 : 0,
              }}
              onClick={() => toggleShowNotes(subject.ID)}
            >
              <div
                className="p-3 flex items-center"
                onDragOver={(e) => {
                  e.stopPropagation();
                  handleDragOver(e, subject.ID);
                }}
                onDragLeave={(e) => {
                  e.stopPropagation();
                  handleDragLeave(e);
                }}
                onDrop={(e) => {
                  e.stopPropagation();
                  handleDrop(e, subject.ID);
                }}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center mr-3 relative cursor-pointer overflow-hidden",
                    isDarkMode ? "bg-amber-700" : "bg-amber-100",
                    draggedOverId === subject.ID && "border-2 border-amber-400",
                  )}
                  onClick={(e) => {
                    e.stopPropagation(); // カード全体のクリックイベントに伝播しないようにする
                    openFileSelector(subject.ID);
                  }}
                  title="クリックまたは画像をドロップしてアイコンを変更"
                >
                  {isUploading === subject.ID ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : subject.IconImageURL &&
                    subject.IconImageURL.length > 0 ? (
                    <div className="w-full h-full relative">
                      <Image
                        src={subject.IconImageURL}
                        alt={subject.WorkName}
                        className="object-cover"
                        fill
                        sizes="40px"
                        unoptimized={true}
                        onError={(e) => {
                          // 画像読み込みエラー時にプレースホルダーを表示
                          console.error(
                            "画像読み込みエラー:",
                            subject.IconImageURL,
                          );
                          const target = e.target as HTMLImageElement;
                          target.onerror = null; // エラーループ防止
                          target.src = "/placeholder.svg";
                        }}
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  ) : (
                    <BookOpen className="h-5 w-5 opacity-70" />
                  )}
                </div>
                <div className="flex-grow">
                  <span className="font-medium">{subject.WorkName}</span>

                  {/* Notes indicator */}
                  {subject.notes && (
                    <div className="text-xs mt-0.5 opacity-70">メモあり</div>
                  )}
                </div>

                {/* Note and Delete Buttons */}
                <div className="flex items-center">
                  {/* Show/Hide Notes Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // カード全体のクリックイベントに伝播しないようにする
                      toggleShowNotes(subject.ID);
                    }}
                    className={cn(
                      "ml-2 text-xs px-2 py-1 rounded",
                      isDarkMode
                        ? "bg-amber-700 hover:bg-amber-600"
                        : "bg-amber-50 hover:bg-amber-100 border border-amber-200",
                    )}
                  >
                    {showNotesMap[subject.ID] ? "閉じる" : "メモ"}
                  </button>

                  {/* Subject Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // カード全体のクリックイベントに伝播しないようにする
                      setDeleteConfirmSubjectId(subject.ID);
                    }}
                    className={cn(
                      "ml-2 p-1 rounded-full",
                      isDarkMode
                        ? "hover:bg-red-800/50 text-red-300"
                        : "hover:bg-red-100 text-red-500",
                    )}
                    title="タスクを削除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Notes Section */}
              {showNotesMap[subject.ID] && (
                <div
                  className={cn(
                    "px-4 pb-4 mt-0 border-t",
                    isDarkMode ? "border-amber-700" : "border-amber-200",
                  )}
                  onClick={(e) => e.stopPropagation()} // メモエリア内のクリックがカード全体のクリックとして扱われないようにする
                >
                  <div className="mt-3">
                    <textarea
                      className={cn(
                        "w-full p-2 rounded-lg text-sm resize-none min-h-[80px]",
                        isDarkMode
                          ? "bg-amber-700 border-amber-600 text-amber-50"
                          : "bg-amber-50 border border-amber-200 text-amber-950",
                      )}
                      placeholder="詰まっていること、わからないことなどをメモしておきましょう..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      onKeyDown={(e) => {
                        // Enterを押した場合（Shiftキーを押していない場合）は保存
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault(); // デフォルトの改行を防止
                          if (noteText.trim()) {
                            saveNote(subject.ID);
                          }
                        }
                      }}
                      autoFocus
                    />
                    <div className="flex justify-between mt-2">
                      <div className="text-xs opacity-70">
                        Enter: 保存　Shift+Enter: 改行
                      </div>
                      <div className="flex space-x-2">
                        {subject.notes && (
                          <button
                            className={cn(
                              "px-3 py-1 rounded-lg text-xs flex items-center",
                              isDarkMode
                                ? "bg-red-800 hover:bg-red-700 text-red-100"
                                : "bg-red-100 hover:bg-red-200 text-red-700",
                            )}
                            onClick={() =>
                              setDeleteNoteConfirmSubjectId(subject.ID)
                            }
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            削除
                          </button>
                        )}
                        <button
                          className={cn(
                            "px-3 py-1 rounded-lg text-xs",
                            isDarkMode
                              ? "bg-amber-700 hover:bg-amber-600"
                              : "bg-amber-100 hover:bg-amber-200",
                          )}
                          onClick={() => {
                            // メモが空なら閉じる、そうでなければ表示モードに切り替え
                            if (!noteText.trim()) {
                              setShowNotesMap((prev) => ({
                                ...prev,
                                [subject.ID]: false,
                              }));
                            }
                            setEditingNoteId(null);
                          }}
                        >
                          キャンセル
                        </button>
                        <button
                          className={cn(
                            "px-3 py-1 rounded-lg text-xs",
                            isDarkMode
                              ? "bg-amber-600 hover:bg-amber-500"
                              : "bg-amber-300 hover:bg-amber-400",
                          )}
                          onClick={() => saveNote(subject.ID)}
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Subject Delete Confirmation */}
              {deleteConfirmSubjectId === subject.ID && (
                <div
                  className={cn(
                    "px-4 py-4 mt-0 border-t",
                    isDarkMode
                      ? "border-red-700 bg-red-900/30"
                      : "border-red-200 bg-red-50",
                  )}
                  onClick={(e) => e.stopPropagation()} // 確認ダイアログ内のクリックがカード全体のクリックとして扱われないようにする
                >
                  <p
                    className={cn(
                      "text-sm mb-2",
                      isDarkMode ? "text-red-200" : "text-red-700",
                    )}
                  >
                    <strong>警告:</strong>{" "}
                    このタスクと関連するメモをすべて削除します。この操作は元に戻せません。
                  </p>
                  <div className="flex justify-end space-x-2">
                    <button
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs",
                        isDarkMode
                          ? "bg-amber-700 hover:bg-amber-600"
                          : "bg-amber-100 hover:bg-amber-200",
                      )}
                      onClick={() => setDeleteConfirmSubjectId(null)}
                    >
                      キャンセル
                    </button>
                    <button
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs flex items-center",
                        isDarkMode
                          ? "bg-red-800 hover:bg-red-700 text-red-100"
                          : "bg-red-600 hover:bg-red-700 text-white",
                      )}
                      onClick={() => deleteSubject(subject.ID)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      削除する
                    </button>
                  </div>
                </div>
              )}

              {/* Note Delete Confirmation */}
              {deleteNoteConfirmSubjectId === subject.ID && (
                <div
                  className={cn(
                    "px-4 py-4 mt-2 border rounded-lg",
                    isDarkMode
                      ? "border-red-700 bg-red-900/30"
                      : "border-red-200 bg-red-50",
                  )}
                  onClick={(e) => e.stopPropagation()} // 確認ダイアログ内のクリックがカード全体のクリックとして扱われないようにする
                >
                  <p
                    className={cn(
                      "text-sm mb-2",
                      isDarkMode ? "text-red-200" : "text-red-700",
                    )}
                  >
                    このメモを削除しますか？この操作は元に戻せません。
                  </p>
                  <div className="flex justify-end space-x-2">
                    <button
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs",
                        isDarkMode
                          ? "bg-amber-700 hover:bg-amber-600"
                          : "bg-amber-100 hover:bg-amber-200",
                      )}
                      onClick={() => setDeleteNoteConfirmSubjectId(null)}
                    >
                      キャンセル
                    </button>
                    <button
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs flex items-center",
                        isDarkMode
                          ? "bg-red-800 hover:bg-red-700 text-red-100"
                          : "bg-red-600 hover:bg-red-700 text-white",
                      )}
                      onClick={() => deleteNote(subject.ID)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      削除する
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
