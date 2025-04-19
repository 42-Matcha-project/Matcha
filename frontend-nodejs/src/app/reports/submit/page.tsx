"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Send,
  AlertTriangle,
  Info,
  Users,
  Settings,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// レポートのカテゴリタイプ
type ReportCategory = "user" | "bug" | "feature" | "other";

// 各カテゴリの情報
const categoryInfo = {
  user: {
    title: "ユーザー報告",
    description: "他のユーザーについての問題や懸念を報告",
    icon: <Users className="h-5 w-5 text-amber-600" />,
    placeholder: "報告したいユーザーの問題について詳しく教えてください...",
    color: "amber",
  },
  bug: {
    title: "バグ報告",
    description: "アプリの不具合や問題について",
    icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
    placeholder: "発生している不具合や問題について詳しく教えてください...",
    color: "red",
  },
  feature: {
    title: "機能リクエスト",
    description: "新機能の提案や改善点について",
    icon: <Settings className="h-5 w-5 text-green-600" />,
    placeholder: "追加してほしい機能や改善点について詳しく教えてください...",
    color: "green",
  },
  other: {
    title: "その他のお問い合わせ",
    description: "上記以外のご質問やご意見",
    icon: <HelpCircle className="h-5 w-5 text-blue-600" />,
    placeholder: "その他のお問い合わせ内容を詳しく教えてください...",
    color: "blue",
  },
};

export default function ReportSubmitPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] =
    useState<ReportCategory>("user");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDarkMode] = useState(false);

  // カテゴリーの選択変更を処理する関数
  const handleCategoryChange = (category: ReportCategory) => {
    setSelectedCategory(category);
  };

  // 送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 入力検証
    if (!title.trim()) {
      toast.error("タイトルを入力してください");
      return;
    }

    if (!content.trim() || content.length < 10) {
      toast.error("内容は最低10文字以上入力してください");
      return;
    }

    setIsSubmitting(true);

    // カテゴリをバックエンドの期待する形式に変換
    let reportType;
    switch (selectedCategory) {
      case "user":
        reportType = "UserReport";
        break;
      case "bug":
        reportType = "BugReport";
        break;
      case "feature":
        reportType = "FeatureRequest";
        break;
      case "other":
        reportType = "AppFeedback";
        break;
      default:
        reportType = "AppFeedback";
    }

    // APIに送信するデータ
    const reportData = {
      Type: reportType,
      Text: `【タイトル】${title}\n\n【内容】${content}${email ? `\n\n【連絡先】${email}` : ""}`,
    };

    try {
      // JWT トークンを localStorage から取得
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("ログインが必要です。ログインページに移動します。");
        router.push("/login");
        return;
      }

      // APIを呼び出してデータを送信
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/reports/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify(reportData),
        },
      );

      // エラーハンドリングの強化
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Error response:", response.status, errorData);

        if (response.status === 401) {
          toast.error("ログインが必要です。ログインページに移動します。");
          router.push("/login");
          return;
        }

        throw new Error(
          `API error: ${response.status} ${errorData ? JSON.stringify(errorData) : ""}`,
        );
      }

      // 成功メッセージ
      toast.success("レポートが送信されました！確認メールを送信しました。");

      // フォームをリセット
      setTitle("");
      setContent("");
      setEmail("");
      setSelectedCategory("user");

      // オプション: 成功後にリダイレクト
      // router.push('/reports/thanks');
    } catch (error) {
      toast.error("送信に失敗しました。後でもう一度お試しください。");
      console.error("Report submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen p-4",
        isDarkMode
          ? "bg-amber-950 text-amber-50"
          : "bg-amber-50 text-amber-950",
      )}
      style={{
        backgroundImage: "url('/images/pattern-leaves.png')",
        backgroundSize: "200px",
        backgroundRepeat: "repeat",
        backgroundBlendMode: isDarkMode ? "overlay" : "soft-light",
        backgroundColor: isDarkMode
          ? "rgba(120, 53, 15, 0.95)"
          : "rgba(255, 251, 235, 0.95)",
      }}
    >
      <div className="container mx-auto max-w-4xl">
        {/* ヘッダー */}
        <header className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl border-4 border-amber-200 shadow-md">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-amber-800 font-medium hover:bg-amber-100 transition-all duration-300"
            onClick={() => router.push("/profile")}
          >
            <ArrowLeft className="h-4 w-4" />
            プロフィールに戻る
          </Button>
          <h1 className="text-2xl font-bold text-center text-amber-800 flex items-center gap-2">
            <Info className="h-6 w-6 text-amber-600" />
            運営へのレポート
          </h1>
          <div className="w-[100px]"></div> {/* スペーサー */}
        </header>

        {/* メインコンテンツ */}
        <div className="bg-white/90 rounded-xl border-4 border-amber-200 p-6 shadow-lg">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-amber-800 mb-2">
              問題や提案を教えてください
            </h2>
            <p className="text-amber-700">
              あなたのレポートは、サービス改善のための大切な情報です。できるだけ詳しく状況を教えてくださると助かります。
            </p>
          </div>

          {/* カテゴリ選択 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {(Object.keys(categoryInfo) as ReportCategory[]).map((category) => {
              const info = categoryInfo[category];
              const isSelected = selectedCategory === category;
              const borderColorClass = isSelected
                ? `border-${info.color}-500 ring-2 ring-${info.color}-300`
                : "border-gray-200";

              return (
                <div
                  key={category}
                  className={cn(
                    "cursor-pointer rounded-xl border-4 p-4 transition-all hover:shadow-md",
                    borderColorClass,
                    isSelected ? "bg-white" : "bg-white/80 hover:bg-white",
                  )}
                  onClick={() => handleCategoryChange(category)}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-2">{info.icon}</div>
                    <h3 className="font-bold text-amber-800">{info.title}</h3>
                    <p className="text-sm text-amber-600 mt-1">
                      {info.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* レポートフォーム */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* タイトル入力 */}
              <div>
                <Label
                  htmlFor="report-title"
                  className="text-amber-800 font-semibold block mb-2"
                >
                  レポートのタイトル
                </Label>
                <Input
                  id="report-title"
                  placeholder="簡潔なタイトルをつけてください"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-2 border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                  maxLength={100}
                />
              </div>

              {/* 内容入力 */}
              <div>
                <Label
                  htmlFor="report-content"
                  className="text-amber-800 font-semibold block mb-2"
                >
                  レポートの内容
                </Label>
                <Textarea
                  id="report-content"
                  placeholder={
                    selectedCategory
                      ? categoryInfo[selectedCategory].placeholder
                      : "レポートの詳細を入力してください..."
                  }
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px] border-2 border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                />
                <p className="text-right text-xs text-amber-600 mt-1">
                  {content.length}文字 / 最低10文字
                </p>
              </div>

              {/* 連絡先メール（任意） */}
              <div>
                <Label
                  htmlFor="contact-email"
                  className="text-amber-800 font-semibold block mb-2"
                >
                  連絡先メールアドレス（任意）
                </Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="返信が必要な場合はメールアドレスを入力してください"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-2 border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                />
                <p className="text-xs text-amber-600 mt-1">
                  ※返信が必要な場合のみ入力してください
                </p>
              </div>

              {/* 注意書き */}
              <div className="p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-amber-800 font-medium">
                      送信前にご確認ください
                    </p>
                    <ul className="text-sm text-amber-700 list-disc list-inside mt-1 space-y-1">
                      <li>個人を特定できる情報は慎重にお取り扱いください</li>
                      <li>
                        緊急の問題の場合は、公式サイトのお問い合わせ先もご利用ください
                      </li>
                      <li>
                        スクリーンショットなどは現在受け付けていません。テキストでお願いします
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 送信ボタン */}
              <div className="flex justify-center mt-8">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "px-8 py-6 text-lg font-medium rounded-full border-4 transition-all",
                    "bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-lg",
                    "flex items-center gap-2",
                    isSubmitting && "opacity-70 cursor-not-allowed",
                  )}
                >
                  {isSubmitting ? (
                    "送信中..."
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      レポートを送信する
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* フッター */}
        <footer className="mt-10 text-center text-amber-700 bg-white/80 p-4 rounded-xl border-2 border-amber-100">
          <p className="text-sm">
            いつもMatcha Worldをご利用いただき、ありがとうございます！
            <br />
            みなさまからのご意見が、より良いサービスへの第一歩です。
          </p>
        </footer>
      </div>
    </div>
  );
}
