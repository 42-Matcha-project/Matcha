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
  Upload,
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
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);

  // タスク追加フォームの状態
  const [formData, setFormData] = useState({
    workName: "",
    notes: "",
    // iconImage: null as File | null, // 画像機能は現在準備中
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  // const [imagePreview, setImagePreview] = useState<string | null>(null); // 画像機能は現在準備中
  // const fileInputRef = useRef<HTMLInputElement>(null); // 画像機能は現在準備中

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

      // タイムスタンプを追加してキャッシュを回避
      const timestamp = Date.now();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/works/get?t=${timestamp}`,
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

      // データの存在確認とフォーマット検証を柔軟に行う
      const worksData = data.Works || data.works || [];
      setTasks(worksData);
    } catch (error) {
      console.error("タスク取得エラー:", error);
      setTasksError(
        error instanceof Error ? error.message : "不明なエラーが発生しました",
      );
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    // 文字数制限を設定
    let limitedValue = value;
    if (name === "workName" && value.length > 20) {
      limitedValue = value.slice(0, 20);
    } else if (name === "notes" && value.length > 100) {
      limitedValue = value.slice(0, 100);
    }

    setFormData({
      ...formData,
      [name]: limitedValue,
    });
  };

  // 画像機能は現在準備中のため、コメントアウト
  /*
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check file size
      if (file.size > 1 * 1024 * 1024) {
        // 1MB limit
        setFormError("画像サイズが大きすぎます（上限1MB）。より小さい画像を選択してください。");
        return;
      }

      setFormData({
        ...formData,
        iconImage: file,
      });

      // プレビュー用URLを作成
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // エラーメッセージをクリア
      setFormError(null);
    }
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };
  */

  // タスク追加関数
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    if (!formData.workName.trim()) {
      setFormError("タスク名を入力してください");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);
      setFormSuccess(null);

      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // APIにタスクを登録するリクエスト
      // 画像アップロードは一時的に無効化
      const taskData = {
        WorkName: formData.workName,
        Notes: formData.notes || null,
        // IconImageURL: null // 画像機能は現在準備中
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/works/add`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskData),
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        // レスポンスのエラーメッセージを取得
        try {
          const errorData = await response.json();
          throw new Error(
            `タスクの登録に失敗しました: ${errorData.Error || response.status}`,
          );
        } catch {
          throw new Error(`タスクの登録に失敗しました (${response.status})`);
        }
      }

      // 成功レスポンスの処理
      const responseData = await response.json();
      console.log("Task created successfully:", responseData);

      setFormSuccess("タスクを登録しました！");

      // フォームをリセット
      setFormData({
        workName: "",
        notes: "",
        // iconImage: null, // 画像機能は現在準備中
      });
      // setImagePreview(null); // 画像機能は現在準備中

      // 少し待ってからタスク一覧を更新してモーダルを閉じる
      setTimeout(() => {
        fetchTasks();
        setShowAddTaskModal(false);
        setFormSuccess(null);
      }, 1500);
    } catch (error) {
      console.error("タスク登録エラー:", error);
      setFormError(
        error instanceof Error ? error.message : "不明なエラーが発生しました",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // タスクモーダルを開く関数
  const openTasksModal = () => {
    setShowTasksModal(true);
    fetchTasks();
  };

  // タスク追加モーダルを開く関数
  const openAddTaskModal = () => {
    setShowAddTaskModal(true);
    // フォームの状態をリセット
    setFormData({
      workName: "",
      notes: "",
      // iconImage: null  // 画像機能は現在準備中
    });
    // setImagePreview(null); // 画像機能は現在準備中
    setFormError(null);
    setFormSuccess(null);
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

        // データの存在確認とフォーマット検証を柔軟に行う
        const userData = data.User || data.user || data;

        if (
          !userData ||
          (typeof userData === "object" && Object.keys(userData).length === 0)
        ) {
          throw new Error("プロフィールデータが見つかりません");
        }

        setProfile(userData);
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
      onClick: openAddTaskModal,
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
                onError={(e) => {
                  // 画像読み込みエラー時にデフォルトアイコンを表示
                  const target = e.target as HTMLImageElement;
                  target.onerror = null; // エラーループ防止
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    parent.classList.add("bg-[#8cc750]");
                    // デフォルトアイコンをDOMに追加
                    const iconDiv = document.createElement("div");
                    iconDiv.className =
                      "w-full h-full flex items-center justify-center";
                    iconDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8 text-white"><path d="M10 10a2 2 0 1 0 4 0c0-1.5-2-2.5-2-5"></path><path d="M7 16a6 6 0 1 0 10 0"></path><path d="M2 22v-1a8 8 0 0 1 16 0v1"></path></svg>`;
                    parent.appendChild(iconDiv);
                  }
                }}
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
                      openAddTaskModal();
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
                      className={`bg-white rounded-xl border-2 ${task.notes ? "border-purple-200" : "border-[#e4cbac]"} p-3 flex items-center shadow-sm hover:shadow-md transition-shadow`}
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-200 bg-purple-100 relative flex-shrink-0 mr-3">
                        {task.IconImageURL ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={`${task.IconImageURL}?t=${Date.now()}`}
                              alt={task.WorkName}
                              fill
                              className="object-cover"
                              unoptimized={true}
                              onError={(e) => {
                                // 画像読み込みエラー時にデフォルトアイコンを表示
                                const target = e.target as HTMLImageElement;
                                target.onerror = null; // エラーループ防止
                                target.style.display = "none";
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.classList.add("bg-purple-100");
                                  // デフォルトアイコンをDOMに追加
                                  const iconDiv = document.createElement("div");
                                  iconDiv.className =
                                    "w-full h-full flex items-center justify-center";
                                  iconDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6 text-purple-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`;
                                  parent.appendChild(iconDiv);
                                }
                              }}
                            />
                          </div>
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
                          <p className="text-xs text-[#9b8e7e] truncate mt-1 italic">
                            <span className="inline-block mr-1 text-violet-500">
                              📝
                            </span>
                            {task.notes}
                          </p>
                        )}
                      </div>

                      <div
                        className={`${task.notes ? "bg-purple-100 border-purple-200" : "bg-amber-100 border-amber-200"} px-2 py-1 rounded-full border text-xs flex items-center ml-2`}
                      >
                        <Check
                          className={`h-3 w-3 mr-1 ${task.notes ? "text-purple-700" : "text-amber-700"}`}
                        />
                        {task.notes ? "メモあり" : "タスク"}
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
                    openAddTaskModal();
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

      {/* タスク追加モーダル */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#f8eddc] rounded-2xl border-2 border-[#e4cbac] shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center border-b-2 border-[#e4cbac] p-4">
              <h3 className="text-xl font-bold text-[#7b6c5d] flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-900" />
                新しいタスクを追加する
              </h3>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="p-2 rounded-full hover:bg-[#e4cbac]/50 transition-colors"
              >
                <X className="h-5 w-5 text-[#7b6c5d]" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[70vh]">
              {isSubmitting ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-10 w-10 text-purple-600 animate-spin mb-4" />
                  <p className="text-[#7b6c5d]">タスクを登録中...</p>
                </div>
              ) : formError ? (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center">
                  <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-red-600 font-medium">{formError}</p>
                  <button
                    onClick={() => setFormError(null)}
                    className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 transition-colors rounded-lg text-red-700 border border-red-300"
                  >
                    閉じる
                  </button>
                </div>
              ) : formSuccess ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
                  <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-green-600 font-medium">{formSuccess}</p>
                  <button
                    onClick={() => {
                      setShowAddTaskModal(false);
                      setFormSuccess(null);
                    }}
                    className="mt-4 px-4 py-2 bg-green-100 hover:bg-green-200 transition-colors rounded-lg text-green-700 border border-green-300"
                  >
                    閉じる
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAddTask}>
                  <div className="space-y-5">
                    <div>
                      <label
                        htmlFor="workName"
                        className="text-sm font-medium text-[#7b6c5d] flex items-center"
                      >
                        <FileText className="h-4 w-4 mr-1 text-purple-700" />{" "}
                        タスク名 <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        id="workName"
                        name="workName"
                        value={formData.workName}
                        onChange={handleInputChange}
                        placeholder="プログラミングの勉強、英語、etc..."
                        className="mt-2 block w-full rounded-md border-2 border-[#e4cbac] p-3 text-[#7b6c5d] focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                        maxLength={20}
                      />
                      <div className="text-xs text-gray-600 mt-1 text-right">
                        {formData.workName.length}/20
                      </div>
                      {formData.workName.length >= 18 &&
                        formData.workName.length < 20 && (
                          <span className="text-amber-500 text-xs block mt-1">
                            制限に近づいています
                          </span>
                        )}
                      {formData.workName.length >= 20 && (
                        <span className="text-red-500 text-xs block mt-1">
                          文字数制限に達しました
                        </span>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="notes"
                        className="text-sm font-medium text-[#7b6c5d] flex items-center"
                      >
                        <Edit className="h-4 w-4 mr-1 text-purple-700" />{" "}
                        メモ（任意）
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        rows={4}
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="詰まっていることや、達成したい目標などを書いておきましょう..."
                        className="mt-2 block w-full rounded-md border-2 border-[#e4cbac] p-3 text-[#7b6c5d] focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                        maxLength={100}
                      />
                      <div className="text-xs text-gray-600 mt-1 text-right">
                        {formData.notes.length}/100
                      </div>
                      {formData.notes.length >= 90 &&
                        formData.notes.length < 100 && (
                          <span className="text-amber-500 text-xs block mt-1">
                            制限に近づいています
                          </span>
                        )}
                      {formData.notes.length >= 100 && (
                        <span className="text-red-500 text-xs block mt-1">
                          文字数制限に達しました
                        </span>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="iconImage"
                        className="text-sm font-medium text-[#7b6c5d] flex items-center"
                      >
                        <Upload className="h-4 w-4 mr-1 text-purple-700" />{" "}
                        アイコン画像（準備中）
                      </label>
                      <div className="mt-2 bg-violet-50 rounded-lg p-3 border border-violet-200">
                        <p className="text-sm text-violet-700 flex items-start">
                          <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-violet-500 flex-shrink-0" />
                          <span>
                            画像アップロード機能は現在準備中です。タスク名とメモのみ保存できます。
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3 border-t border-[#e4cbac] pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddTaskModal(false)}
                      className="px-4 py-2 bg-[#e4cbac] text-[#7b6c5d] rounded-md hover:bg-[#d9b796] transition-colors border border-[#d9b796]"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center shadow-md"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      タスクを登録する
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
