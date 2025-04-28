import { useState } from "react";

const useFileUploader = (maxFiles: number = 5) => {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    setFileError(null);

    if (!files) {
      return;
    }

    // 最大ファイル数のチェック
    if (files.length > maxFiles) {
      setFileError(`ファイルは最大${maxFiles}枚までアップロードできます。`);
      return;
    }

    // ファイルタイプのチェック
    const invalidFiles = Array.from(files).filter(
      (file) => !file.type.startsWith("image/"),
    );

    if (invalidFiles.length > 0) {
      setFileError("画像ファイルのみアップロードできます。");
      return;
    }

    // ファイルサイズのチェック (5MB制限)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = Array.from(files).filter(
      (file) => file.size > maxSize,
    );

    if (oversizedFiles.length > 0) {
      setFileError("ファイルサイズは5MB以下にしてください。");
      return;
    }

    // プレビューURLの作成
    const urls = Array.from(files).map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  return {
    previewUrls,
    fileError,
    handleFilesChange,
  };
};

export default useFileUploader;
