import { Participant } from "../types/room";

/**
 * 部屋コードをフォーマットする（大文字化、空白除去など）
 * @param code 入力された部屋コード
 * @returns フォーマット済みコード
 */
export function formatRoomCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

/**
 * 部屋コードが有効かチェックする
 * @param code 部屋コード
 * @returns 有効な場合はtrue
 */
export function isValidRoomCode(code: string): boolean {
  // 部屋コードが空の場合
  if (!code || code.trim() === "") {
    return false;
  }

  // 部屋コードのフォーマット
  const formatted = formatRoomCode(code);

  // 無効な予約コードをチェック
  const invalidTestCodes = ["MYUSER", "ABCDEF", "123456", "TEST12"];
  if (invalidTestCodes.includes(formatted)) {
    console.warn(
      `予約済みまたはテスト用のルームコードが使用されました: ${formatted}`,
    );
    return false;
  }

  // 部屋コードのバリデーションルール
  // 6桁の英数字
  return /^[A-Z0-9]{6}$/.test(formatted);
}

/**
 * 参加者のステータス表示用の色を取得
 * @param status 参加者のステータス
 * @returns CSSで使用する色名
 */
export function getStatusColor(status: Participant["status"]): string {
  switch (status) {
    case "online":
      return "bg-green-500";
    case "away":
      return "bg-yellow-500";
    case "offline":
      return "bg-gray-400";
    default:
      return "bg-gray-400";
  }
}

/**
 * 参加者のステータスのラベルを取得
 * @param status 参加者のステータス
 * @returns 日本語のステータスラベル
 */
export function getStatusLabel(status: Participant["status"]): string {
  switch (status) {
    case "online":
      return "オンライン";
    case "away":
      return "一時退席中";
    case "offline":
      return "オフライン";
    default:
      return "不明";
  }
}

/**
 * 現在の部屋内の参加者数を表示用にフォーマット
 * @param count 参加者数
 * @returns フォーマットされた表示文字列
 */
export function formatParticipantCount(count: number): string {
  return `${count}人が参加中`;
}
