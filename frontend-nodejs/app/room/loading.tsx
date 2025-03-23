import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
        <h2 className="text-xl font-medium text-slate-800">
          自習室を準備中...
        </h2>
        <p className="text-slate-600 mt-2">少々お待ちください</p>
      </div>
    </div>
  );
}
