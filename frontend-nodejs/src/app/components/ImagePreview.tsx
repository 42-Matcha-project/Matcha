"use client";

import Image from "next/image";

interface ImagePreviewProps {
  previewUrls: string[];
  maxFiles: number;
}

export default function ImagePreview({
  previewUrls,
  maxFiles,
}: ImagePreviewProps) {
  if (maxFiles === 1) {
    // 1枚モードの場合：配列の最初の要素のみ表示
    return (
      <div className="mt-4">
        {previewUrls.length > 0 && previewUrls[0].length > 0 ? (
          <Image
            src={previewUrls[0]}
            alt="プレビュー"
            width={128}
            height={128}
            className="w-32 h-32 object-cover rounded-full"
          />
        ) : (
          <div className="w-32 h-32 border border-dashed border-gray-400 flex items-center justify-center rounded-full">
            <span className="text-sm text-gray-500">画像なし</span>
          </div>
        )}
      </div>
    );
  } else {
    // 複数枚モードの場合：maxFiles枚分表示
    return (
      <div className="mt-4 flex gap-4">
        {Array.from({ length: maxFiles }).map((_, index) => {
          const url = previewUrls[index];
          return url ? (
            <Image
              key={index}
              src={url}
              alt={`プレビュー ${index + 1}`}
              width={128}
              height={128}
              className="w-32 h-32 object-cover rounded-md"
            />
          ) : (
            <div
              key={index}
              className="w-32 h-32 border border-dashed border-gray-400 flex items-center justify-center rounded-md"
            >
              <span className="text-sm text-gray-500">画像なし</span>
            </div>
          );
        })}
      </div>
    );
  }
}
