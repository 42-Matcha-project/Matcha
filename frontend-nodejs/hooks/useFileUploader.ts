import { useState, useCallback } from "react";

interface UseFileUploaderReturn {
  previewUrls: string[];
  fileError: string | null;
  handleFilesChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function useFileUploader(
  maxFiles: number = 5,
): UseFileUploaderReturn {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFilesChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;

      if (!files) return;

      // Reset error
      setFileError(null);

      // Check if too many files are selected
      if (files.length > maxFiles) {
        setFileError(`最大${maxFiles}枚までアップロードできます。`);
        return;
      }

      // Release previous preview URLs to avoid memory leaks
      previewUrls.forEach((url) => URL.revokeObjectURL(url));

      // Create new preview URLs
      const newPreviewUrls = Array.from(files).map((file) =>
        URL.createObjectURL(file),
      );
      setPreviewUrls(newPreviewUrls);
    },
    [maxFiles, previewUrls],
  );

  return { previewUrls, fileError, handleFilesChange };
}
