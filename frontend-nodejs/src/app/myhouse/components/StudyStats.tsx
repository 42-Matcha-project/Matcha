"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { LogOut, Play, Pause } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

interface StudyStatsProps {
  isDarkMode: boolean;
}

export function StudyStats({ isDarkMode }: StudyStatsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showEndSessionDialog, setShowEndSessionDialog] = useState(false);
  const [studyTimeMinutes, setStudyTimeMinutes] = useState(0); // 作業時間（分）
  const [studyTimeSeconds, setStudyTimeSeconds] = useState(0); // 作業時間（秒）
  const [studyTimeStarted, setStudyTimeStarted] = useState<Date | null>(null); // 作業開始時間
  const [isStudying, setIsStudying] = useState(false); // 勉強中かどうか
  const [totalStudyTimeSeconds, setTotalStudyTimeSeconds] = useState(0); // 累積作業時間（秒）
  const [pauseTime, setPauseTime] = useState<Date | null>(null); // 一時停止時間

  // コンポーネントマウント時に保存された状態を復元
  useEffect(() => {
    // localStorageから作業状態を取得
    const storedStartTime = localStorage.getItem("studyTimeStarted");
    const storedTotalTime = localStorage.getItem("totalStudyTimeSeconds");
    const storedIsStudying = localStorage.getItem("isStudying");
    const storedPauseTime = localStorage.getItem("pauseTime");

    if (storedTotalTime) {
      setTotalStudyTimeSeconds(parseInt(storedTotalTime, 10));
    }

    if (storedIsStudying === "true") {
      setIsStudying(true);

      if (storedStartTime) {
        setStudyTimeStarted(new Date(storedStartTime));
      }
    } else {
      // 勉強中でない場合は、一時停止状態をクリアする
      setPauseTime(null);
      localStorage.removeItem("pauseTime");
    }

    // 勉強中の場合のみ一時停止状態を復元
    if (storedIsStudying === "true" && storedPauseTime) {
      setPauseTime(new Date(storedPauseTime));
    }

    // クリーンアップ関数: コンポーネントのアンマウント時に実行
    return () => {
      // 作業部屋から抜けた時点ですべての作業状態をリセット
      // isStudyingの状態に関わらず、すべてのタイマー関連の状態をクリア
      localStorage.removeItem("studyTimeStarted");
      localStorage.removeItem("isStudying");
      localStorage.removeItem("pauseTime");

      // 累積時間はリセットしない（自習終了時のみリセット）
      // これにより再入室時にタイマーが0から始まるが、累積時間は維持される
      // 完全にリセットしたい場合は以下の行もコメント解除する
      // localStorage.removeItem("totalStudyTimeSeconds");
    };
  }, []);

  // 作業状態が変わったらlocalStorageに保存
  useEffect(() => {
    if (isStudying && studyTimeStarted) {
      localStorage.setItem("studyTimeStarted", studyTimeStarted.toISOString());
    }
    localStorage.setItem("isStudying", isStudying.toString());
    localStorage.setItem(
      "totalStudyTimeSeconds",
      totalStudyTimeSeconds.toString(),
    );

    if (pauseTime) {
      localStorage.setItem("pauseTime", pauseTime.toISOString());
    } else {
      localStorage.removeItem("pauseTime");
    }
  }, [isStudying, studyTimeStarted, totalStudyTimeSeconds, pauseTime]);

  // 1秒ごとに作業時間を更新
  useEffect(() => {
    if (!isStudying || !studyTimeStarted) {
      // タイマーが停止している場合は何もしない
      return;
    }

    // 現在の作業時間を計算して設定
    const calcStudyTime = () => {
      const now = new Date();
      const diffMs = now.getTime() - studyTimeStarted.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);

      setStudyTimeSeconds(diffSeconds % 60);
      setStudyTimeMinutes(Math.floor(diffSeconds / 60));
    };

    // 初回計算
    calcStudyTime();

    // 1秒ごとに更新
    const timer = setInterval(calcStudyTime, 1000);

    // クリーンアップ関数：コンポーネントのアンマウント時またはisStudying/studyTimeStartedが変更された時に実行
    return () => {
      clearInterval(timer);
    };
  }, [isStudying, studyTimeStarted]);

  // 勉強開始
  const startStudy = () => {
    if (isStudying) return;

    const now = new Date();
    setStudyTimeStarted(now);
    setIsStudying(true);
    setPauseTime(null);

    toast.success("勉強を開始しました！");
  };

  // 勉強一時停止
  const pauseStudy = () => {
    if (!isStudying) return;

    // まずタイマー状態を変更して停止させる
    setIsStudying(false);

    // 現在の累積時間に今回の勉強時間を追加
    const now = new Date();
    if (studyTimeStarted) {
      const diffMs = now.getTime() - studyTimeStarted.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      setTotalStudyTimeSeconds((prev) => prev + diffSeconds);
    }

    setPauseTime(now);
    setStudyTimeStarted(null);

    toast.info("勉強を一時停止しました");
  };

  // 勉強再開
  const resumeStudy = () => {
    if (isStudying) return;

    const now = new Date();
    setStudyTimeStarted(now);
    setIsStudying(true);
    setPauseTime(null);

    toast.success("勉強を再開しました！");
  };

  // 自習終了ダイアログを表示
  const openEndSessionDialog = () => {
    if (isStudying) {
      pauseStudy(); // 作業中なら一時停止
    }
    setShowEndSessionDialog(true);
  };

  // 自習終了ダイアログをキャンセル
  const cancelEndSession = () => {
    setShowEndSessionDialog(false);
  };

  // 自習を終了する
  const endStudySession = async () => {
    setIsLoading(true);

    try {
      // まずタイマーを確実に停止（最優先）
      const wasStudying = isStudying;
      setIsStudying(false);

      // 現在のセッション時間を計算して累積時間に追加
      if (wasStudying && studyTimeStarted) {
        const now = new Date();
        const diffMs = now.getTime() - studyTimeStarted.getTime();
        const diffSeconds = Math.floor(diffMs / 1000);
        setTotalStudyTimeSeconds((prev) => prev + diffSeconds);
        setStudyTimeStarted(null);
      }

      // 少し待機して状態更新が反映されるのを待つ
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 現在のセッション情報を取得
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("認証情報がありません。再ログインしてください。");

        // タイマー状態を確実にクリア
        setIsStudying(false);
        setStudyTimeStarted(null);
        localStorage.removeItem("studyTimeStarted");
        localStorage.removeItem("isStudying");

        // ログイン画面へリダイレクト
        setTimeout(() => {
          router.push("/login");
        }, 1500); // トーストメッセージを表示した後、1.5秒後にリダイレクト
        return;
      }

      // 最終的な作業時間を計算
      const finalTotalSeconds = totalStudyTimeSeconds;

      // 秒を分に変換（端数は切り捨て）
      const minutesStudied = Math.floor(finalTotalSeconds / 60);
      const remainingSeconds = finalTotalSeconds % 60;

      // デバッグ用トースト
      toast.info(`作業ログを追加します... (作業時間: ${minutesStudied}分)`);

      // 作業ログを追加（fetch APIを使用）
      let logSuccess = false;
      let retryCount = 0;
      const maxRetries = 3;

      while (!logSuccess && retryCount < maxRetries) {
        try {
          retryCount++;
          if (retryCount > 1) {
            toast.info(
              `作業ログの追加を再試行しています (${retryCount - 1}/${maxRetries - 1})...`,
            );
          }

          // リクエストデータを準備
          const requestData = {
            WorkID: 1,
            Minutes: minutesStudied > 0 ? minutesStudied : 1, // 0分の場合は最低1分を保証
          };

          // fetchを使用してPOSTリクエストを送信
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/works/log`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(requestData),
            },
          );

          // レスポンスの詳細をログ出力
          const responseText = await response.text();

          if (response.ok) {
            toast.success("作業ログを追加しました");
            logSuccess = true;
            break; // 成功したらループを抜ける
          } else {
            console.warn(
              `作業ログの追加に失敗しました (${response.status}): ${responseText}`,
            );

            if (retryCount === maxRetries) {
              toast.error(
                "作業ログの追加に失敗しました。最大リトライ回数に達しました。",
              );
            } else {
              // 少し待ってから再試行
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }
        } catch (error) {
          console.error(
            `作業ログ追加中にエラーが発生 (試行 ${retryCount}/${maxRetries}):`,
            error,
          );

          if (retryCount === maxRetries) {
            toast.error(
              "作業ログの追加中にエラーが発生しました。最大リトライ回数に達しました。",
            );
          } else {
            // 少し待ってから再試行
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      }

      // 作業ログの追加に失敗した場合は警告を表示し、確認ダイアログを表示
      if (!logSuccess) {
        toast.warning(
          "作業ログの追加に失敗しました。タイマーはリセットされていません。",
        );

        // 確認ダイアログを表示
        if (
          confirm(
            "作業ログの追加に失敗しました。タイマーをリセットせずに処理を終了しますか？キャンセルを押すと自習を継続できます。",
          )
        ) {
          setIsLoading(false);
          setShowEndSessionDialog(false);
          return; // キャンセルされた場合は処理を終了
        } else {
          // ユーザーが自習を継続する場合
          setIsLoading(false);
          setShowEndSessionDialog(false);
          return;
        }
      }

      // 作業ログが正常に追加された場合のみ作業部屋削除処理に進む
      console.log("作業部屋削除処理開始");
      console.log(
        `最終的な作業時間は ${finalTotalSeconds}秒 (${minutesStudied}分${remainingSeconds}秒、切り捨てで${minutesStudied}分として記録) でした`,
      );

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/study-room/delete`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("作業部屋削除結果:", {
        status: response.status,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "テキスト取得失敗");
        throw new Error(
          `自習の終了に失敗しました (${response.status}): ${errorText}`,
        );
      }

      // ここで作業状態をクリア（POSTとDELETEが両方成功した場合のみ）
      setIsStudying(false);
      setStudyTimeStarted(null);
      setPauseTime(null);
      setTotalStudyTimeSeconds(0);
      localStorage.removeItem("studyTimeStarted");
      localStorage.removeItem("isStudying");
      localStorage.removeItem("totalStudyTimeSeconds");
      localStorage.removeItem("pauseTime");

      toast.success("自習を終了しました");
      console.log("処理完了、リダイレクト準備中...");

      // 全ての処理が完了してから1秒待機してからリダイレクト
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // settlementページへリダイレクト
      console.log("settlementページへリダイレクト実行");
      router.push("/settlement");
    } catch (error) {
      console.error("自習終了エラー:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "自習の終了中にエラーが発生しました",
      );
    } finally {
      setIsLoading(false);
      setShowEndSessionDialog(false);
    }
  };

  // 作業時間のフォーマット
  const formatStudyTime = (minutes: number, seconds: number = 0) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}時間${mins}分${seconds}秒`;
    }
    return `${mins}分${seconds}秒`;
  };

  // 合計作業時間のフォーマット（秒から）
  const formatTotalTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}時間${minutes}分${seconds}秒`;
    }
    return `${minutes}分${seconds}秒`;
  };

  // 合計作業時間（現在のセッション + 過去のセッション）
  let displayTotalTime = totalStudyTimeSeconds;
  if (isStudying && studyTimeStarted) {
    const now = new Date();
    const diffMs = now.getTime() - studyTimeStarted.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    displayTotalTime += diffSeconds;
  }

  return (
    <div
      className={cn(
        "rounded-2xl p-6 mb-8 shadow-md",
        isDarkMode
          ? "bg-amber-800/90 border border-amber-700 text-amber-50"
          : "bg-white border border-amber-200 text-amber-900",
      )}
    >
      {/* <h3 className="text-xl font-bold mb-4 border-b pb-2 border-amber-200">
        学習ステータス
      </h3> */}

      {/* タイマーと作業時間表示 */}
      <div
        className={cn(
          "mb-6 p-4 rounded-lg",
          isDarkMode ? "bg-amber-700/80" : "bg-amber-100/70",
        )}
      >
        <div className="flex justify-between items-center mb-3">
          <span className="font-semibold">現在の学習時間</span>
          <div className="flex space-x-2">
            {isStudying ? (
              <button
                onClick={pauseStudy}
                className={cn(
                  "flex items-center px-3 py-1 rounded text-white font-medium text-sm",
                  "bg-amber-600 hover:bg-amber-500 transition-colors",
                )}
              >
                <Pause className="h-4 w-4 mr-1" /> 一時停止
              </button>
            ) : (
              <button
                onClick={studyTimeStarted ? resumeStudy : startStudy}
                className={cn(
                  "flex items-center px-3 py-1 rounded text-white font-medium text-sm",
                  "bg-green-600 hover:bg-green-500 transition-colors",
                )}
              >
                <Play className="h-4 w-4 mr-1" />
                {studyTimeStarted ? "再開" : "スタート"}
              </button>
            )}
            <button
              onClick={openEndSessionDialog}
              className={cn(
                "flex items-center px-3 py-1 rounded font-medium text-sm",
                "bg-red-500 hover:bg-red-400 text-white transition-colors",
              )}
            >
              <LogOut className="h-4 w-4 mr-1" /> 終了
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div
            className={cn(
              "rounded-lg p-3 text-center",
              isDarkMode ? "bg-amber-900/70" : "bg-white",
            )}
          >
            <div className="text-sm mb-1">今回の学習時間</div>
            <div
              className={cn(
                "text-2xl font-mono",
                isDarkMode ? "text-amber-100" : "text-amber-900",
              )}
            >
              {formatStudyTime(studyTimeMinutes, studyTimeSeconds)}
            </div>
          </div>

          <div
            className={cn(
              "rounded-lg p-3 text-center",
              isDarkMode ? "bg-amber-900/70" : "bg-white",
            )}
          >
            <div className="text-sm mb-1">今日の累計</div>
            <div
              className={cn(
                "text-2xl font-mono",
                isDarkMode ? "text-amber-100" : "text-amber-900",
              )}
            >
              {formatTotalTime(totalStudyTimeSeconds)}
            </div>
          </div>
        </div>
      </div>

      {/* End Study Session Dialog */}
      <Dialog
        open={showEndSessionDialog}
        onOpenChange={setShowEndSessionDialog}
      >
        <DialogContent
          className={cn(
            "sm:max-w-xl w-[90%]",
            isDarkMode
              ? "bg-amber-900 border-amber-800 text-amber-50"
              : "bg-amber-50 border-amber-200 text-amber-950",
          )}
        >
          <DialogHeader className="p-2">
            <DialogTitle className="flex items-center gap-3 text-xl mb-2">
              <LogOut className="h-6 w-6" />
              自習を終了しますか？
            </DialogTitle>
            <DialogDescription
              className={cn(
                "text-base",
                isDarkMode ? "text-amber-300" : "text-amber-700",
              )}
            >
              自習を終了すると、現在の作業タイマーがリセットされます。タイマーの進捗はプロフィールに記録されます。
              <span className="mt-2 font-medium block">
                今回の作業時間: {formatTotalTime(displayTotalTime)}
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between flex-row gap-3 mt-6 mb-2">
            <button
              onClick={cancelEndSession}
              disabled={isLoading}
              className={cn(
                "flex-1 py-3 px-5 rounded-lg text-base font-medium transition-colors",
                isDarkMode
                  ? "bg-amber-800 hover:bg-amber-700"
                  : "bg-amber-100 hover:bg-amber-200",
              )}
            >
              キャンセル
            </button>
            <button
              onClick={endStudySession}
              disabled={isLoading}
              className={cn(
                "flex-1 py-3 px-5 rounded-lg text-base font-medium transition-colors flex justify-center items-center",
                isDarkMode
                  ? "bg-red-800 hover:bg-red-700 text-red-50"
                  : "bg-red-100 hover:bg-red-200 text-red-800",
                isLoading && "opacity-70 cursor-not-allowed",
              )}
            >
              {isLoading ? (
                "処理中..."
              ) : (
                <>
                  <LogOut className="h-5 w-5 mr-2" />
                  終了する
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
