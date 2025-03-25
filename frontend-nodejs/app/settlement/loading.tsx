import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-amber-800 mx-auto mb-4" />
        <h2 className="text-xl font-medium text-amber-800">
          開拓地を読み込み中...
        </h2>
        <p className="text-amber-700 mt-2">あなたの開拓地を準備しています</p>
      </div>
    </div>
  );
}
