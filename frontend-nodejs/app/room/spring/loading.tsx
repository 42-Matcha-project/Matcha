import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-pink-500 mx-auto mb-4" />
        <h2 className="text-xl font-medium text-pink-800">
          春の自習室を準備中...
        </h2>
        <p className="text-pink-600 mt-2">桜の季節、一緒に頑張りましょう🌸</p>
      </div>
    </div>
  );
}
