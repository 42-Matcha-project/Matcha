/**
 * 認証関連のデバッグユーティリティ
 */

/**
 * JWTトークンをデコードして内容を取得する
 */
export const decodeJwtToken = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("トークンのデコードに失敗しました:", error);
    return null;
  }
};

/**
 * サーバーへの直接認証テスト
 */
export const testAuthentication = async (baseUrl: string, token: string) => {
  try {
    // トークン情報を出力
    const tokenInfo = decodeJwtToken(token);
    console.log("トークン情報:", tokenInfo);

    // トークンの有効期限チェック
    if (tokenInfo && tokenInfo.exp) {
      const expiryDate = new Date(tokenInfo.exp * 1000);
      const now = new Date();
      console.log("トークン有効期限:", expiryDate);
      console.log("現在時刻:", now);
      console.log("有効期限切れ?:", expiryDate < now);
    }

    // 直接APIを呼び出し
    const response = await fetch(`${baseUrl}/profile/get`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await (response.ok
      ? response.json()
      : response.text().then((text) => ({ error: text })));

    return {
      status: response.status,
      ok: response.ok,
      data,
      headers: Object.fromEntries([...response.headers.entries()]),
    };
  } catch (error) {
    console.error("認証テストに失敗しました:", error);
    return {
      status: "error",
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * 別の方法でバックエンドへアクセスを試みる
 */
export const tryAlternativeAuth = async (baseUrl: string, token: string) => {
  // 1. カスタムヘッダー設定
  try {
    const response = await fetch(`${baseUrl}/profile/get`, {
      method: "GET",
      headers: {
        "X-Auth-Token": token,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      return {
        method: "custom-header",
        success: true,
        status: response.status,
        data: await response.json(),
      };
    }
  } catch (error) {
    console.error("カスタムヘッダー認証に失敗:", error);
  }

  // 2. クエリパラメータでの認証試行
  try {
    const response = await fetch(
      `${baseUrl}/profile/get?token=${encodeURIComponent(token)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (response.ok) {
      return {
        method: "query-param",
        success: true,
        status: response.status,
        data: await response.json(),
      };
    }
  } catch (error) {
    console.error("クエリパラメータ認証に失敗:", error);
  }

  // 3. POSTリクエストでの試行
  try {
    const response = await fetch(`${baseUrl}/profile/get`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    if (response.ok) {
      return {
        method: "post-body",
        success: true,
        status: response.status,
        data: await response.json(),
      };
    }
  } catch (error) {
    console.error("POSTリクエスト認証に失敗:", error);
  }

  return {
    method: "all",
    success: false,
    message: "全ての認証方法が失敗しました",
  };
};
