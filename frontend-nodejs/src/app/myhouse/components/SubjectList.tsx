"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { BookOpen, RefreshCw } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

// 科目（Work）の型定義
interface Subject {
  ID: number;
  WorkName: string;
  IconImageURL: string;
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

  // 科目リストを取得する
  const fetchSubjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setHasAttemptedFetch(true);

      const token = localStorage.getItem("token");
      if (!token) {
        // トークンがない場合は静かに失敗する（エラーメッセージを表示しない）
        console.log("認証情報がありません - 科目一覧の取得をスキップします");
        setSubjects([]);
        return;
      }

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
          "科目リスト取得エラー:",
          response.status,
          response.statusText,
        );
        setSubjects([]);
        return;
      }

      const data = await response.json();
      setSubjects(data.Works || []);
    } catch (error) {
      console.error("科目リスト取得エラー:", error);
      // エラーをコンソールに記録するだけで、UIには表示しない
      setSubjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 科目アイコンを更新する
  const updateSubjectIcon = async (subjectId: number, iconFile: File) => {
    try {
      setIsUploading(subjectId);

      // バリデーション
      if (!iconFile.type.startsWith("image/")) {
        toast.error("画像ファイルのみアップロードできます");
        return;
      }

      // ファイルサイズのチェック (5MB制限)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (iconFile.size > maxSize) {
        toast.error("ファイルサイズは5MB以下にしてください");
        return;
      }

      // ここでは画像を仮にDataURLに変換して使用
      // 実環境では適切なストレージサービスにアップロードする処理を追加する必要があります
      const reader = new FileReader();
      reader.onloadend = async () => {
        const iconDataUrl = reader.result as string;

        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("認証情報がありません");
          return;
        }

        // 更新APIを呼び出し
        const subject = subjects.find((s) => s.ID === subjectId);
        if (!subject) return;

        // WorkNameとIconImageURLを含むリクエストを作成
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/works/add`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              WorkName: subject.WorkName,
              IconImageURL: iconDataUrl,
            }),
          },
        );

        if (!response.ok) {
          toast.error("アイコンの更新に失敗しました");
          return;
        }

        // 成功したらリストを更新
        fetchSubjects();
        toast.success("アイコンを更新しました");
      };

      reader.readAsDataURL(iconFile);
    } catch (error) {
      console.error("アイコン更新エラー:", error);
      toast.error("アイコンの更新に失敗しました");
    } finally {
      setIsUploading(null);
      setDraggedOverId(null);
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
        <h3 className="text-lg font-bold">登録済み科目</h3>
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
          <p className="text-sm opacity-70">科目を読み込み中...</p>
        </div>
      ) : subjects.length === 0 ? (
        <div className="p-4 text-center bg-amber-100/30 rounded-lg">
          <BookOpen className="h-6 w-6 mx-auto mb-2 opacity-50" />
          <p className="text-sm opacity-70">登録されている科目はありません</p>
          <p className="text-xs opacity-50 mt-1">
            「科目登録」から新しい科目を追加してください
          </p>
          {hasAttemptedFetch && !isLoading && error && (
            <p className="text-xs text-amber-700 mt-2">
              （科目リストの取得中にエラーが発生しました。更新ボタンを押して再試行してください）
            </p>
          )}
        </div>
      ) : (
        <ul className="space-y-2 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-transparent will-change-transform">
          {subjects.map((subject, index) => (
            <li
              key={subject.ID}
              className={cn(
                "p-3 rounded-lg flex items-center transition-all ease-in-out duration-300",
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
              onDragOver={(e) => handleDragOver(e, subject.ID)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, subject.ID)}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center mr-3 relative cursor-pointer",
                  isDarkMode ? "bg-amber-700" : "bg-amber-100",
                  draggedOverId === subject.ID && "border-2 border-amber-400",
                )}
                onClick={() => openFileSelector(subject.ID)}
                title="クリックまたは画像をドロップしてアイコンを変更"
              >
                {isUploading === subject.ID ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : subject.IconImageURL ? (
                  <Image
                    src={subject.IconImageURL}
                    alt=""
                    className="w-6 h-6 object-cover rounded-full"
                    width={24}
                    height={24}
                  />
                ) : (
                  <BookOpen className="h-4 w-4 opacity-70" />
                )}
              </div>
              <span className="font-medium">{subject.WorkName}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
