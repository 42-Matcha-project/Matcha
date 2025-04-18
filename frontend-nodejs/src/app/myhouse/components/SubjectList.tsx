"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { BookOpen, RefreshCw } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

// HTMLImageElementを使用するために明示的に参照
const HTMLImage = globalThis.Image;

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

      // トークンを取得
      let token = localStorage.getItem("token");
      if (!token) {
        // トークンがない場合は静かに失敗する（エラーメッセージを表示しない）
        console.log("認証情報がありません - 科目一覧の取得をスキップします");
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
          console.log("認証エラー - 再認証を試みます");

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
              console.log("再認証成功 - 新しいトークンを取得しました");
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

      // 科目リストを取得
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

  // 科目アイコンを更新する (ローカルストレージのみ)
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

      // 科目の存在チェック
      const subject = subjects.find((s) => s.ID === subjectId);
      if (!subject) {
        toast.error("科目が見つかりません");
        return;
      }

      // 画像を圧縮してDataURLに変換
      const compressedImageUrl = await compressImage(iconFile);
      if (!compressedImageUrl) {
        toast.error("画像の処理に失敗しました");
        return;
      }

      console.log("画像処理成功: 圧縮後サイズ", compressedImageUrl.length);

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
          // 画像サイズの制限（最大幅・高さ）を大きくして画質向上
          const MAX_WIDTH = 120; // サイズを大きく
          const MAX_HEIGHT = 120; // サイズを大きく

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

          // 圧縮率を上げて画質向上（0.2→0.7）
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7); // 圧縮率を0.7に上げて画質向上

          // 画像サイズをログに出力
          console.log("圧縮後のDataURL長さ:", compressedDataUrl.length);

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

  // ローカルで科目アイコンを更新する
  const updateLocalIcon = (subjectId: number, iconUrl: string) => {
    // 現在の科目リストをコピー
    const updatedSubjects = subjects.map((subject) => {
      if (subject.ID === subjectId) {
        // 対象の科目のアイコンを更新（ローカルでは圧縮したDataURLを使用）
        return {
          ...subject,
          IconImageURL: iconUrl,
        };
      }
      return subject;
    });

    // 科目リストを更新
    setSubjects(updatedSubjects);

    // ローカルストレージに画像URLを保存して、リロード後も表示できるようにする
    try {
      // 既存のキャッシュデータを取得
      const cachedIcons = JSON.parse(
        localStorage.getItem("subjectIcons") || "{}",
      );

      // 現在の科目IDとアイコンURLを追加
      cachedIcons[subjectId] = iconUrl;

      // キャッシュを更新
      localStorage.setItem("subjectIcons", JSON.stringify(cachedIcons));
      console.log(
        "アイコンをローカルストレージにキャッシュしました:",
        subjectId,
      );
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

  // 初期表示時の科目リスト読み込み
  useEffect(() => {
    // コンポーネントマウント時に一度だけ実行
    fetchSubjects();
    console.log("初期科目リスト読み込み");

    // ローカルストレージからキャッシュされたアイコンを復元
    try {
      const cachedIcons = JSON.parse(
        localStorage.getItem("subjectIcons") || "{}",
      );
      if (Object.keys(cachedIcons).length > 0) {
        console.log("キャッシュされたアイコンを復元します");

        // 少し遅延させて科目リストが読み込まれた後に適用
        setTimeout(() => {
          setSubjects((prevSubjects) => {
            return prevSubjects.map((subject) => {
              // この科目IDのキャッシュがあれば適用
              if (cachedIcons[subject.ID]) {
                return {
                  ...subject,
                  IconImageURL: cachedIcons[subject.ID],
                };
              }
              return subject;
            });
          });
        }, 500);
      }
    } catch (error) {
      console.error("キャッシュされたアイコンの復元に失敗:", error);
    }
  }, []);

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
                  "w-10 h-10 rounded-full flex items-center justify-center mr-3 relative cursor-pointer overflow-hidden",
                  isDarkMode ? "bg-amber-700" : "bg-amber-100",
                  draggedOverId === subject.ID && "border-2 border-amber-400",
                )}
                onClick={() => openFileSelector(subject.ID)}
                title="クリックまたは画像をドロップしてアイコンを変更"
              >
                {isUploading === subject.ID ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : subject.IconImageURL && subject.IconImageURL.length > 0 ? (
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
              <span className="font-medium">{subject.WorkName}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
