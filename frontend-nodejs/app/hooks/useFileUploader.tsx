import { useState, useCallback, ChangeEvent } from "react";

interface UseFileUploaderReturn {
  previewUrls: string[];
  uploadedFiles: File[];
  fileError: string;
  handleFilesChange: (e: ChangeEvent<HTMLInputElement>) => void;
  resetFiles: () => void;
}

/**
 * @param maxFiles アップロード可能な最大ファイル数（デフォルトは 5）
 */
export default function useFileUploader(
  maxFiles: number = 5,
): UseFileUploaderReturn {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string>("");

  const handleFilesChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        // 既にアップロード済みのファイルと合わせた枚数が最大数を超える場合はエラーを設定
        if (previewUrls.length + files.length > maxFiles) {
          setFileError(`写真はすでに${maxFiles}枚アップロードされています。`);
          e.target.value = "";
          return;
        }

        const newUrls: string[] = [];
        const newFiles: File[] = [];

        Array.from(files).forEach((file) => {
          // 重複チェック（名前とサイズが一致するか）
          const duplicate = [...uploadedFiles, ...newFiles].some(
            (uploaded) =>
              uploaded.name === file.name && uploaded.size === file.size,
          );
          if (duplicate) {
            setFileError(`"${file.name}" はすでにアップロードされています。`);
            return;
          }

          newFiles.push(file);

          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result) {
              newUrls.push(reader.result as string);
            }
            // すべてのファイルのプレビューが読み込まれたら状態を更新
            if (newUrls.length === newFiles.length) {
              setPreviewUrls((prev) => [...prev, ...newUrls]);
              setUploadedFiles((prev) => [...prev, ...newFiles]);
            }
          };
          reader.readAsDataURL(file);
        });
        e.target.value = "";
      }
    },
    [previewUrls, uploadedFiles, maxFiles],
  );

  // アップロード状態をリセットする関数
  const resetFiles = useCallback(() => {
    setPreviewUrls([]);
    setUploadedFiles([]);
    setFileError("");
  }, []);

  return {
    previewUrls,
    uploadedFiles,
    fileError,
    handleFilesChange,
    resetFiles,
  };
}
