"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<number | null>(null);

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
        const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/profile/get`;
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: headers,
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
  }, []);

  const questCards = [
    {
      title: "建物たんけん",
      description: "あなたの所有している建物をみてみよう！",
      icon: <Building className="h-7 w-7" />,
      onClick: () => router.push("/buildings"),
      difficulty: "★★☆",
      reward: "5000ベル",
      color: "bg-sky-50",
      borderColor: "border-sky-200",
      iconBg: "bg-sky-100",
      iconBorder: "border-sky-300",
      emoji: "🏠",
    },
    {
      title: "作業ログチェック",
      description: "これまでの作業記録を見てみよう！",
      icon: <Clock className="h-7 w-7" />,
      onClick: () => router.push("/works/log"),
      difficulty: "★☆☆",
      reward: "2000ベル",
      color: "bg-lime-50",
      borderColor: "border-lime-200",
      iconBg: "bg-lime-100",
      iconBorder: "border-lime-300",
      emoji: "📝",
    },
    {
      title: "特別レポート",
      description: "街の運営さんに問題を報告しよう！",
      icon: <AlertTriangle className="h-7 w-7" />,
      onClick: () => router.push("/reports/submit"),
      difficulty: "★★★",
      reward: "3000ベル",
      color: "bg-amber-50",
      borderColor: "border-amber-200",
      iconBg: "bg-amber-100",
      iconBorder: "border-amber-300",
      emoji: "📮",
    },
    {
      title: "今までのタスク",
      description: "あなたのタスクを確認しよう！",
      icon: <FileText className="h-7 w-7" />,
      onClick: () => router.push("/works"),
      difficulty: "★☆☆",
      reward: "2500ベル",
      color: "bg-violet-50",
      borderColor: "border-violet-200",
      iconBg: "bg-violet-100",
      iconBorder: "border-violet-300",
      emoji: "📚",
    },
    {
      title: "プロフィールアップデート",
      description: "プロフィールを整えよう！",
      icon: <Edit className="h-7 w-7" />,
      onClick: () => router.push("/profile/edit"),
      difficulty: "★★☆",
      reward: "4000ベル",
      color: "bg-pink-50",
      borderColor: "border-pink-200",
      iconBg: "bg-pink-100",
      iconBorder: "border-pink-300",
      emoji: "✨",
    },
    {
      title: "新しいタスク",
      description: "新しいタスクを追加しよう！",
      icon: <Plus className="h-7 w-7" />,
      onClick: () => router.push("/works/add"),
      difficulty: "★★★",
      reward: "5000ベル",
      color: "bg-teal-50",
      borderColor: "border-teal-200",
      iconBg: "bg-teal-100",
      iconBorder: "border-teal-300",
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
          <div className="w-16 h-16 bg-[#8cc750] rounded-full flex items-center justify-center border-2 border-[#7ab145] shadow-md">
            <PawPrint className="h-8 w-8 text-white" />
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
                        className={`${quest.iconBg} p-4 rounded-full border-2 ${quest.iconBorder} shadow-sm`}
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
    </div>
  );
}
