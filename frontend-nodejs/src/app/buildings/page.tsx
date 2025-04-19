"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Loader2,
  Home,
  ArrowLeft,
  ShoppingBag,
  Coins,
  Leaf,
  TreeDeciduous,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// HTMLImageElementを使用するために明示的に参照
const HTMLImage = globalThis.Image;

// Types for our building data
interface Building {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  createdAt: string;
}

// API response types
interface APIBuilding {
  ID: number;
  ExteriorImageURL: string;
  InteriorImageURL: string;
  DefaultName: string;
  CustomName: string;
  RequiredCoinCount: number;
  IsInStore: boolean;
}

interface APIResponse {
  OwnBuildings?: APIBuilding[];
  Buildings?: APIBuilding[]; // For store buildings
  Error?: string;
}

export default function BuildingsPage() {
  const router = useRouter();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [storeBuildings, setStoreBuildings] = useState<APIBuilding[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isStoreLoading, setIsStoreLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showStore, setShowStore] = useState<boolean>(false);
  const [deletingBuildingId, setDeletingBuildingId] = useState<string | null>(
    null,
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);

  const loadBuildingsFromLocalStorage = useCallback(() => {
    try {
      // Try to get buildings from local storage
      const storedBuildings = localStorage.getItem("userBuildings");

      if (storedBuildings) {
        setBuildings(JSON.parse(storedBuildings));
        toast.info("ローカルに保存された建物データを読み込みました");
      } else {
        // If no buildings found, initialize with empty array
        setBuildings([]);
      }
    } catch (error) {
      console.error("Error loading buildings from local storage:", error);
      toast.error("建物データの読み込みに失敗しました");
      setBuildings([]);
    }
  }, []);

  const fetchBuildingsFromAPI = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("認証情報がありません");
      }

      // API call to get buildings
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/buildings/get-own`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("認証エラー - 再ログインが必要です");
        }
        throw new Error(`建物データの取得に失敗しました (${response.status})`);
      }

      const data: APIResponse = await response.json();

      if (data.Error) {
        throw new Error(data.Error);
      }

      if (!data.OwnBuildings) {
        throw new Error("建物データが見つかりません");
      }

      // Transform API buildings to our local format
      const transformedBuildings: Building[] = data.OwnBuildings.map(
        (apiBuilding) => ({
          id: apiBuilding.ID.toString(),
          name: apiBuilding.CustomName || apiBuilding.DefaultName,
          description: "APIから取得した建物です",
          imageUrl: apiBuilding.ExteriorImageURL,
          createdAt: new Date().toISOString(),
        }),
      );

      setBuildings(transformedBuildings);

      // Also save to local storage as backup
      localStorage.setItem(
        "userBuildings",
        JSON.stringify(transformedBuildings),
      );
    } catch (error) {
      console.error("API Building fetch error:", error);
      setIsError(true);
      setErrorMessage(
        error instanceof Error ? error.message : "不明なエラーが発生しました",
      );

      // Fall back to local storage
      loadBuildingsFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  }, [loadBuildingsFromLocalStorage]);

  useEffect(() => {
    // First try to fetch buildings from API, then fall back to local storage
    fetchBuildingsFromAPI();
  }, [fetchBuildingsFromAPI]);

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
          // 画像サイズの制限（最大幅・高さ）- 高画質化のため値を増加
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 600;

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

          // 画質向上のため圧縮率を0.9に上げる（0.7→0.9）
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.9);
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

  const updateBuildingImage = async (id: string, file: File) => {
    // Validate that the file is an image
    if (!file.type.startsWith("image/")) {
      toast.error("画像ファイルのみアップロードできます");
      return;
    }

    // Validate file size (max 5MB - 画質向上のため上限を引き上げ)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ファイルサイズは5MB以下にしてください");
      return;
    }

    try {
      // 画像を圧縮してDataURLに変換
      const compressedImageUrl = await compressImage(file);
      if (!compressedImageUrl) {
        toast.error("画像の処理に失敗しました");
        return;
      }

      // Update the building with the new image URL
      const updatedBuildings = buildings.map((building) =>
        building.id === id
          ? { ...building, imageUrl: compressedImageUrl }
          : building,
      );

      setBuildings(updatedBuildings);

      // Save to local storage
      localStorage.setItem("userBuildings", JSON.stringify(updatedBuildings));

      toast.success("建物の画像が更新されました");
    } catch (error) {
      console.error("Error updating building image:", error);
      toast.error("画像の更新に失敗しました");
    }
  };

  // Handler for file input change
  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    buildingId: string,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      updateBuildingImage(buildingId, file);
    }
  };

  const handleRefresh = () => {
    fetchBuildingsFromAPI();
  };

  // Function to fetch buildings available in the store
  const fetchStoreBuildings = async () => {
    setIsStoreLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("認証情報がありません");
      }

      // API call to get store buildings
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/buildings/get-store`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("認証エラー - 再ログインが必要です");
        }
        throw new Error(
          `ストア建物データの取得に失敗しました (${response.status})`,
        );
      }

      const data: APIResponse = await response.json();

      if (data.Error) {
        throw new Error(data.Error);
      }

      if (!data.Buildings) {
        throw new Error("ストア建物データが見つかりません");
      }

      setStoreBuildings(data.Buildings);
    } catch (error) {
      console.error("Store building fetch error:", error);
      toast.error("ストアからの建物データ取得に失敗しました");
    } finally {
      setIsStoreLoading(false);
    }
  };

  // Function to buy a building from the store
  const buyBuilding = async (buildingId: number) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("認証情報がありません");
        return;
      }

      // API call to buy a building
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/store/buy`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            BuildingID: buildingId,
          }),
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("認証エラー - 再ログインが必要です");
        }
        const errorData = await response.json();
        throw new Error(
          errorData.Error || `建物の購入に失敗しました (${response.status})`,
        );
      }

      toast.success("建物を購入しました！");

      // Refresh the buildings list
      fetchBuildingsFromAPI();
      // Refresh the store list
      fetchStoreBuildings();
    } catch (error) {
      console.error("Buy building error:", error);
      toast.error(
        error instanceof Error ? error.message : "建物の購入に失敗しました",
      );
    }
  };

  // Toggle store visibility and load store buildings if needed
  const toggleStore = () => {
    if (!showStore && storeBuildings.length === 0) {
      fetchStoreBuildings();
    }
    setShowStore(!showStore);
  };

  const handleDeleteClick = (id: string) => {
    // 削除対象の建物IDを保存し、確認ダイアログを表示
    setDeletingBuildingId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    // 実際の削除処理を実行
    if (deletingBuildingId) {
      // Filter out the building with the given ID
      const updatedBuildings = buildings.filter(
        (building) => building.id !== deletingBuildingId,
      );
      setBuildings(updatedBuildings);

      // Save to local storage
      localStorage.setItem("userBuildings", JSON.stringify(updatedBuildings));

      toast.success("建物が削除されました");

      // ダイアログを閉じてステートをリセット
      closeDeleteDialog();
    }
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setDeletingBuildingId(null);
  };

  return (
    <div
      className="min-h-screen p-4 relative overflow-x-hidden"
      style={{
        backgroundImage: "linear-gradient(to bottom, #f0f4f8, #d1e3dd)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Decorative elements - 装飾要素をシンプルにするために削除 */}

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header with navigation back to profile */}
        <div className="flex items-center justify-between mb-6 bg-amber-50 p-4 rounded-xl border-4 border-amber-200 shadow-md">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-amber-800 font-medium hover:bg-amber-100 transition-all duration-300"
            onClick={() => router.push("/profile")}
          >
            <ArrowLeft className="h-4 w-4" />
            プロフィールに戻る
          </Button>
          <h1 className="text-2xl font-bold text-center text-amber-800 flex items-center gap-2">
            <TreeDeciduous className="h-6 w-6 text-green-600" />
            マイタウン
          </h1>
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-amber-100 border-2 border-amber-300 text-amber-800 hover:bg-amber-200"
            onClick={handleRefresh}
          >
            <Loader2 className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            更新
          </Button>
        </div>

        {/* Error message */}
        {isError && (
          <div className="bg-red-50 border-4 border-red-200 text-red-700 p-4 rounded-xl mb-6 shadow-md">
            <p className="font-medium">エラーが発生しました</p>
            <p className="text-sm">{errorMessage}</p>
            <p className="text-sm mt-2">ローカルのデータを表示しています。</p>
          </div>
        )}

        {/* Main Tabs - My buildings and Store */}
        <div className="flex justify-center mb-8 gap-4">
          <Button
            className={`px-6 py-3 rounded-full border-4 shadow-md flex items-center gap-2 transition-all duration-300 transform ${!showStore ? "bg-green-500 hover:bg-green-600 border-green-600 text-white scale-105" : "bg-white hover:bg-green-50 border-green-300 text-green-700"}`}
            onClick={() => setShowStore(false)}
          >
            <Home className="h-5 w-5" />
            マイハウス
          </Button>
          <Button
            className={`px-6 py-3 rounded-full border-4 shadow-md flex items-center gap-2 transition-all duration-300 transform ${showStore ? "bg-amber-500 hover:bg-amber-600 border-amber-600 text-white scale-105" : "bg-white hover:bg-amber-50 border-amber-300 text-amber-700"}`}
            onClick={toggleStore}
          >
            <ShoppingBag className="h-5 w-5" />
            ショップ
          </Button>
        </div>

        {/* Loading state */}
        {(showStore ? isStoreLoading : isLoading) ? (
          <div className="flex flex-col justify-center items-center h-64 bg-white/80 rounded-xl border-4 border-amber-200 p-8 shadow-md">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
              <Leaf className="h-6 w-6 text-green-500 absolute -top-1 -right-1 animate-bounce" />
            </div>
            <span className="mt-4 text-amber-800 font-medium">
              読み込み中...
            </span>
          </div>
        ) : showStore ? (
          // Store content
          <>
            <h2 className="text-xl font-semibold text-center text-amber-800 mb-6 flex justify-center items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-amber-600" />
              ショップ
              <ShoppingBag className="h-5 w-5 text-amber-600" />
            </h2>

            {storeBuildings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 bg-white/80 rounded-xl border-4 border-amber-200 p-8 shadow-md">
                <div className="relative w-20 h-20 mb-4">
                  <Image
                    src="/images/house.png"
                    alt="ハウス"
                    fill
                    className="object-contain"
                    unoptimized={true}
                  />
                </div>
                <h3 className="text-xl font-semibold text-amber-800 mb-2">
                  本日の商品は売り切れました
                </h3>
                <p className="text-amber-700 text-center">
                  また明日お越しください。
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {storeBuildings.map((building) => (
                  <Card
                    key={building.ID}
                    className="overflow-hidden rounded-xl border-4 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white"
                  >
                    <div className="relative h-48 w-full bg-amber-50">
                      {building.ExteriorImageURL ? (
                        <Image
                          src={building.ExteriorImageURL}
                          alt={building.DefaultName}
                          fill
                          className="object-cover rounded-t-lg"
                          unoptimized={true}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={true}
                          quality={95}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-amber-50">
                          <div className="relative w-20 h-20">
                            <Image
                              src="/images/house.png"
                              alt="デフォルトハウス"
                              fill
                              className="object-contain"
                              unoptimized={true}
                            />
                          </div>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-amber-400 text-white px-2 py-1 rounded-full text-xs font-bold border-2 border-white">
                        新着
                      </div>
                    </div>
                    <CardHeader className="bg-amber-50 border-t-4 border-amber-100">
                      <CardTitle className="text-amber-800">
                        {building.DefaultName}
                      </CardTitle>
                      <CardDescription className="flex items-center text-amber-700">
                        <Coins className="h-4 w-4 mr-1 text-amber-500" />
                        {building.RequiredCoinCount} ベル
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-center p-4 bg-amber-50">
                      <Button
                        className="bg-amber-500 hover:bg-amber-600 text-white w-full rounded-full border-2 border-amber-600 shadow-md font-medium"
                        onClick={() => buyBuilding(building.ID)}
                      >
                        購入する
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          // My buildings content
          <>
            {/* Buildings grid */}
            {buildings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 bg-white/80 rounded-xl border-4 border-amber-200 p-8 shadow-md">
                <div className="relative w-20 h-20 mb-4">
                  <Image
                    src="/images/house.png"
                    alt="はじまりの家"
                    fill
                    className="object-contain"
                    unoptimized={true}
                  />
                </div>
                <h3 className="text-xl font-semibold text-amber-800 mb-2">
                  建物がまだありません
                </h3>
                <p className="text-amber-700 mb-6 text-center">
                  勉強してコインを貯めると、ショップで建物を購入できます！
                </p>
                <Button
                  className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-full border-4 border-amber-600 shadow-md flex items-center gap-2"
                  onClick={() => router.push("/settlement")}
                >
                  <ShoppingBag className="h-5 w-5" />
                  ショップを見る
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {buildings.map((building) => (
                  <Card
                    key={building.id}
                    className="overflow-hidden rounded-xl border-4 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white"
                  >
                    <div className="relative h-48 w-full bg-amber-50">
                      {building.imageUrl ? (
                        <Image
                          src={building.imageUrl}
                          alt={building.name}
                          fill
                          className="object-cover rounded-t-lg"
                          unoptimized={true}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={true}
                          quality={95}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-amber-50">
                          <div className="relative w-20 h-20">
                            <Image
                              src="/images/house.png"
                              alt="デフォルトハウス"
                              fill
                              className="object-contain"
                              unoptimized={true}
                            />
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <label className="cursor-pointer bg-white/90 text-amber-700 px-4 py-2 rounded-full font-medium hover:bg-white border-2 border-amber-300">
                          リフォームする
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleFileInputChange(e, building.id)
                            }
                          />
                        </label>
                      </div>
                    </div>
                    <CardHeader className="bg-amber-50 border-t-4 border-amber-100">
                      <CardTitle className="text-amber-800">
                        {building.name}
                      </CardTitle>
                      <CardDescription className="text-amber-700">
                        建設日:{" "}
                        {new Date(building.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="bg-amber-50">
                      <p className="text-amber-700">{building.description}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between p-4 bg-amber-50">
                      <Button
                        variant="outline"
                        className="text-green-700 bg-green-50 border-2 border-green-300 hover:bg-green-100 rounded-full"
                        onClick={() => {
                          // Navigate to building detail view (to be implemented)
                          toast.info("この機能は開発中です");
                        }}
                      >
                        見てみる
                      </Button>
                      <Button
                        variant="destructive"
                        className="bg-red-100 text-red-700 hover:bg-red-200 border-2 border-red-300 rounded-full"
                        onClick={() => handleDeleteClick(building.id)}
                      >
                        取り壊す
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* 削除確認ダイアログ */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-white border-4 border-orange-300 rounded-xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-orange-800 text-xl font-bold">
              <AlertTriangle className="h-6 w-6 text-orange-500 mr-2" />
              建物を取り壊しますか？
            </DialogTitle>
            <DialogDescription className="text-orange-700 pt-2">
              この操作は取り消せません。建物とそのデータがすべて削除されます。
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200 my-2">
            <p className="text-orange-800 font-medium">注意事項:</p>
            <ul className="text-sm text-orange-700 list-disc list-inside mt-2 space-y-1">
              <li>保存された建物の画像データはすべて失われます</li>
              <li>取り壊し後は元に戻せません</li>
              <li>新しく建て直すには再度ベルが必要です</li>
            </ul>
          </div>
          <DialogFooter className="flex gap-4 sm:justify-center pt-2">
            <Button
              variant="outline"
              className="bg-gray-100 border-2 border-gray-300 text-gray-700 hover:bg-gray-200 rounded-full font-medium px-6"
              onClick={closeDeleteDialog}
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              className="bg-red-500 hover:bg-red-600 text-white rounded-full font-medium px-6 border-2 border-red-600"
              onClick={confirmDelete}
            >
              取り壊す
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
