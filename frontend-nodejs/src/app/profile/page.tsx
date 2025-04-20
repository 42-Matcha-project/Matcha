"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Building,
  Clock,
  FileText,
  AlertTriangle,
  Edit,
  Plus,
  Star,
  Leaf,
  PawPrint,
  Trees,
  Heart,
  Music,
  X,
  Loader2,
  Check,
} from "lucide-react";
import { UserProfile } from "@/types/profile";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

// タスクのインターフェース定義
interface Task {
  ID: number;
  WorkName: string;
  IconImageURL: string;
  notes?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [imageKey, setImageKey] = useState<number>(0);

  // タスク関連の状態
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);

  // タスク取得関数
  const fetchTasks = async () => {
    try {
      setIsLoadingTasks(true);
      setTasksError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setTasksError("認証情報がありません");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/works/get`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error(`タスクの取得に失敗しました (${response.status})`);
      }

      const data = await response.json();
      setTasks(data.Works || []);
    } catch (error) {
      console.error("タスク取得エラー:", error);
      setTasksError(
        error instanceof Error ? error.message : "不明なエラーが発生しました",
      );
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // タスクモーダルを開く関数
  const openTasksModal = () => {
    setShowTasksModal(true);
    fetchTasks();
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          setError("認証情報がありません");
          setIsLoading(false);
          return;
        }

        // APIエンドポイントを呼び出し
        // タイムスタンプをクエリパラメータに追加してキャッシュを回避
        const timestamp = Date.now();
        const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/profile/get?t=${timestamp}`;
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: headers,
          cache: "no-store",
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("認証エラー");
          }
          throw new Error(
            `プロフィールの取得に失敗しました (${response.status})`,
          );
        }

        const data = await response.json();
        if (!data.User) {
          throw new Error("プロフィールデータが見つかりません");
        }

        setProfile(data.User);
        setImageKey((prev) => prev + 1);
      } catch (error) {
        console.error("プロフィール取得エラー:", error);
        setError(
          error instanceof Error ? error.message : "不明なエラーが発生しました",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchProfile();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const questCards = [
    {
      title: "マイ建物リスト",
      description: "あなたの所有している建物をみてみよう！",
      icon: <Building className="h-8 w-8 text-blue-900" />,
      onClick: () => router.push("/buildings"),
      difficulty: "★★☆",
      reward: "5000ベル",
      color: "bg-sky-50",
      borderColor: "border-sky-200",
      iconBg: "bg-sky-200",
      iconBorder: "border-sky-400",
      emoji: "🏠",
    },
    {
      title: "作業ログチェック",
      description: "これまでの作業記録を見てみよう！",
      icon: <Clock className="h-8 w-8 text-green-900" />,
      onClick: () => router.push("/works/log"),
      difficulty: "★☆☆",
      reward: "2000ベル",
      color: "bg-lime-50",
      borderColor: "border-lime-200",
      iconBg: "bg-lime-200",
      iconBorder: "border-lime-400",
      emoji: "📝",
    },
    {
      title: "今までのタスク",
      description: "あなたのタスクを確認しよう！",
      icon: <FileText className="h-8 w-8 text-purple-900" />,
      onClick: openTasksModal,
      difficulty: "★☆☆",
      reward: "2500ベル",
      color: "bg-violet-50",
      borderColor: "border-violet-200",
      iconBg: "bg-violet-200",
      iconBorder: "border-violet-400",
      emoji: "📚",
    },
    {
      title: "プロフィールアップデート",
      description: "プロフィールを整えよう！",
      icon: <Edit className="h-8 w-8 text-pink-900" />,
      onClick: () => router.push("/profile/edit"),
      difficulty: "★★☆",
      reward: "4000ベル",
      color: "bg-pink-50",
      borderColor: "border-pink-200",
      iconBg: "bg-pink-200",
      iconBorder: "border-pink-400",
      emoji: "✨",
    },
    {
      title: "新しいタスク",
      description: "新しいタスクを追加しよう！",
      icon: <Plus className="h-8 w-8 text-teal-900" />,
      onClick: () => router.push("/profile/add-task"),
      difficulty: "★★★",
      reward: "5000ベル",
      color: "bg-teal-50",
      borderColor: "border-teal-200",
      iconBg: "bg-teal-200",
      iconBorder: "border-teal-400",
      emoji: "🎓",
    },
  ];

  const handleBackClick = () => {
    router.push("/settlement");
  };

  return (
    <div className="min-h-screen bg-[#e8f3d8] p-6 text-[#6a6359]">
      <div className="flex items-center mb-8">
        <button
          onClick={handleBackClick}
          className="p-2 mr-4 rounded-full bg-[#f8eddc] hover:bg-[#f3e6d0] transition-colors border-2 border-[#e4cbac] shadow-md"
        >
          <ArrowLeft className="h-5 w-5 text-[#7b6c5d]" />
        </button>
        <div className="relative">
          <h1 className="text-3xl font-bold text-[#7b6c5d]">
            プロフィールボード
          </h1>
          <div className="absolute -bottom-1 left-0 right-4 h-[3px] bg-[#bbd894]"></div>
        </div>
        <div className="ml-auto flex space-x-2">
          <div className="py-1 px-3 bg-[#f8eddc] rounded-xl border-2 border-[#e4cbac] flex items-center shadow-md">
            <Star className="h-4 w-4 text-[#e38b31] mr-2" />
            <span className="font-medium text-[#7b6c5d]">
              {profile?.CoinCount || 0}ベル
            </span>
          </div>
          <div className="py-1 px-3 bg-[#f8eddc] rounded-xl border-2 border-[#e4cbac] flex items-center shadow-md">
            <Leaf className="h-4 w-4 text-[#8cc750] mr-2" />
            <span className="font-medium text-[#7b6c5d]">
              ポイント{Math.floor((profile?.CoinCount || 0) / 10)}
            </span>
          </div>
        </div>
      </div>

      {/* プレイヤー情報 */}
      <div className="mb-8 p-4 bg-[#f8eddc] rounded-2xl border-2 border-[#e4cbac] shadow-md">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-[#8cc750] rounded-full flex items-center justify-center border-2 border-[#7ab145] shadow-md overflow-hidden relative">
            {profile?.IconImageURL ? (
              <Image
                src={profile.IconImageURL}
                alt="ユーザーアイコン"
                fill
                className="object-cover"
                key={imageKey}
              />
            ) : (
              <PawPrint className="h-8 w-8 text-white" />
            )}
          </div>
          <div className="ml-4">
            <h2 className="text-2xl font-bold text-[#7b6c5d]">
              {profile?.DisplayName || profile?.Username || "むらびと"}
            </h2>
            <p className="text-[#9b8e7e]">
              <span className="inline-block mr-1">🏝️</span> {profile?.TownName}
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-bounce mb-4">
            <Trees className="h-12 w-12 text-[#8cc750]" />
          </div>
          <p className="text-lg text-[#7b6c5d] font-medium">
            ロード中<span className="animate-pulse">...</span>
          </p>
        </div>
      ) : error ? (
        <div className="p-5 bg-[#f8eddc] border-2 border-[#e4a067] rounded-2xl shadow-md mb-6">
          <h3 className="text-lg font-medium text-[#e38b31] mb-2 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" /> おっと！
          </h3>
          <p className="text-[#7b6c5d]">{error}</p>
          <p className="text-[#9b8e7e] mt-3 text-sm">
            またあとでためしてみるか、運営に相談してみよう！
          </p>
        </div>
      ) : (
        <div>
          {/* クエストカードグリッド */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {questCards.map((quest, index) => (
              <div
                key={index}
                className={`group relative transform transition-all duration-300 ${activeCard === index ? "scale-105" : "hover:scale-102"}`}
                onMouseEnter={() => setActiveCard(index)}
                onMouseLeave={() => setActiveCard(null)}
              >
                <Card
                  className={`${quest.color} border-2 ${quest.borderColor} rounded-xl shadow-md overflow-hidden cursor-pointer`}
                  onClick={quest.onClick}
                >
                  <CardHeader className="pb-2 relative">
                    <div className="absolute -top-0 -left-0 bg-white rounded-br-xl px-2 pt-1 pb-2 border-r-2 border-b-2 border-[#e4cbac]">
                      <span className="text-xl">{quest.emoji}</span>
                    </div>
                    <div className="absolute top-1 right-2 bg-[#f8eddc] text-xs font-medium py-0.5 px-2 rounded-full border border-[#e4cbac]">
                      {quest.difficulty}
                    </div>
                    <CardTitle className="text-lg font-bold text-[#7b6c5d] mt-5 ml-2">
                      {quest.title}
                    </CardTitle>
                    <CardDescription className="text-[#9b8e7e] ml-2">
                      {quest.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 min-h-[80px] pb-2">
                    <div className="flex justify-center items-center h-full">
                      <div
                        className={`${quest.iconBg} p-4 rounded-full border-2 ${quest.iconBorder} shadow-md flex items-center justify-center`}
                      >
                        {quest.icon}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter
                    className={`border-t-2 border-[#e4cbac] pt-3 pb-3 bg-[#f8eddc]/60`}
                  >
                    <div className="flex items-center w-full justify-between">
                      <div className="text-xs font-medium text-[#9b8e7e] flex items-center">
                        <Music className="h-3 w-3 mr-1" /> ミッション No.
                        {index + 1}
                      </div>
                      <div className="bg-[#f8eddc] py-1 px-3 rounded-full text-xs text-[#7b6c5d] font-medium border border-[#e4cbac] flex items-center">
                        <Star className="h-3 w-3 text-[#e38b31] mr-1" />
                        {quest.reward}
                      </div>
                    </div>
                  </CardFooter>
                </Card>
                {activeCard === index && (
                  <div className="absolute -bottom-2 right-3 transform animate-bounce-slow">
                    <Heart className="h-5 w-5 text-[#f87171]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 運営への報告ボタン - メタ機能 */}
      {!isLoading && !error && (
        <>
          <div className="mt-16 mb-6 flex items-center gap-3">
            <div className="h-px bg-red-300 flex-grow"></div>
            <span className="text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
              アプリサポート
            </span>
            <div className="h-px bg-red-300 flex-grow"></div>
          </div>

          <div className="flex justify-center">
            <div className="relative transform hover:scale-105 transition-all duration-300">
              <button
                onClick={() => router.push("/reports/submit")}
                className="group px-8 py-4 bg-gradient-to-r from-red-50 to-white text-gray-800 rounded-lg border-2 border-red-300 transition-all duration-300 flex items-center gap-4 shadow-lg"
                style={{
                  fontFamily: "sans-serif",
                }}
              >
                <div className="bg-red-100 p-2.5 rounded-full border-2 border-red-300 shadow-inner">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold text-sm uppercase tracking-wider text-red-500">
                    SUPPORT CENTER
                  </span>
                  <span className="font-semibold text-lg">
                    運営へのレポート / お問い合わせ
                  </span>
                </div>
                <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-white font-bold">→</span>
                </div>
              </button>
              <div className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-red-600 rounded-full"></div>
            </div>
          </div>

          <p className="text-center text-sm text-red-600 font-medium mt-3 mb-4">
            アプリの問題報告やご意見・ご要望はこちらからお願いします
          </p>
        </>
      )}

      {/* タスクモーダル */}
      {showTasksModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#f8eddc] rounded-2xl border-2 border-[#e4cbac] shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center border-b-2 border-[#e4cbac] p-4">
              <h3 className="text-xl font-bold text-[#7b6c5d] flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-900" />
                あなたのタスク一覧
              </h3>
              <button
                onClick={() => setShowTasksModal(false)}
                className="p-2 rounded-full hover:bg-[#e4cbac]/50 transition-colors"
              >
                <X className="h-5 w-5 text-[#7b6c5d]" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[70vh]">
              {isLoadingTasks ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-10 w-10 text-purple-600 animate-spin mb-4" />
                  <p className="text-[#7b6c5d]">タスクを読み込み中...</p>
                </div>
              ) : tasksError ? (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center">
                  <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-red-600 font-medium">{tasksError}</p>
                  <button
                    onClick={fetchTasks}
                    className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 transition-colors rounded-lg text-red-700 border border-red-300"
                  >
                    再試行
                  </button>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-10 bg-purple-50 rounded-xl border-2 border-purple-100">
                  <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-purple-800" />
                  </div>
                  <h4 className="text-lg font-medium text-purple-900 mb-2">
                    タスクがまだありません
                  </h4>
                  <p className="text-purple-700 mb-2">
                    新しいタスクを追加して、学習の進捗を管理しましょう！
                  </p>
                  <p className="text-purple-600 text-sm mb-4">
                    日々の学習や課題をタスクとして登録すると、進捗の把握や振り返りに役立ちます
                  </p>
                  <button
                    onClick={() => {
                      setShowTasksModal(false);
                      router.push("/profile/add-task");
                    }}
                    className="px-4 py-2 bg-purple-200 hover:bg-purple-300 transition-colors rounded-lg text-purple-800 border border-purple-300 inline-flex items-center shadow-sm"
                  >
                    <Plus className="h-4 w-4 mr-1" /> 最初のタスクを追加する
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.ID}
                      className="bg-white rounded-xl border-2 border-[#e4cbac] p-3 flex items-center shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-200 bg-purple-100 relative flex-shrink-0 mr-3">
                        {task.IconImageURL ? (
                          <Image
                            src={task.IconImageURL}
                            alt={task.WorkName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="h-6 w-6 text-purple-500" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-[#7b6c5d] truncate">
                          {task.WorkName}
                        </h4>
                        {task.notes && (
                          <p className="text-sm text-[#9b8e7e] truncate">
                            {task.notes}
                          </p>
                        )}
                      </div>

                      <div className="bg-purple-100 px-2 py-1 rounded-full border border-purple-200 text-purple-700 text-xs flex items-center ml-2">
                        <Check className="h-3 w-3 mr-1" /> タスク
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t-2 border-[#e4cbac] p-4 bg-[#f8eddc] flex justify-between items-center">
              <div className="text-sm text-[#9b8e7e]">
                <span className="font-medium">{tasks.length}</span> 件のタスク
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowTasksModal(false)}
                  className="px-4 py-2 bg-[#e4cbac] hover:bg-[#d9b796] transition-colors rounded-lg text-[#7b6c5d]"
                >
                  閉じる
                </button>
                <button
                  onClick={() => {
                    setShowTasksModal(false);
                    router.push("/profile/add-task");
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 transition-colors rounded-lg text-white flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" /> 新規タスク
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
