/**
 * APIリクエストの基本関数
 */
export async function fetcher<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  // .env.localファイルからAPIのベースURLを取得

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const response = await fetch(`${baseUrl}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });
  console.log("APIリクエスト:", response);

  // レスポンスのJSONを取得
  const data = await response.json();

  // エラーレスポンスの場合
  if (!response.ok) {
    const error = new Error(
      data.message || data.error || "APIリクエスト中にエラーが発生しました",
    );
    throw error;
  }

  return data;
}

// レスポンスの型定義
export interface RegisterResponse {
  user: {
    ID: number;
    Username: string;
    DisplayName: string;
    Gender: string;
    Introduction: string;
    IconImageURL: string;
    SexualPreference: string;
    Affiliations: Array<{ ID: number; Name: string }>;
    InterestTags: Array<{ ID: number; Name: string }>;
  };
}

/**
 * ユーザー登録API
 */
export async function registerUser(userData: {
  username: FormDataEntryValue | null;
  nickname: FormDataEntryValue | null;
  gender: FormDataEntryValue | null;
  email: FormDataEntryValue | null;
  password: FormDataEntryValue | null;
}): Promise<RegisterResponse> {
  // バックエンド側の期待する形式に変換
  const requestData = {
    Username: userData.username?.toString() || "",
    Email: userData.email?.toString() || "",
    Password: userData.password?.toString() || "",
    DisplayName: userData.nickname?.toString() || "",
    Gender: userData.gender?.toString() || "",
    Introduction: "",
    Affiliations: [],
    InterestTags: [],
    SexualPreference: "",
  };

  console.log("送信データ:", JSON.stringify(requestData, null, 2));

  return fetcher<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(requestData),
  });
}

/**
 * ユーザー画像アップロードAPI
 */
export async function uploadUserImage(userId: number, imageFile: File) {
  const formData = new FormData();
  formData.append("userId", userId.toString());
  formData.append("image", imageFile);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const response = await fetch(`${baseUrl}/settings/user/image`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "画像アップロード中にエラーが発生しました");
  }

  return data;
}
