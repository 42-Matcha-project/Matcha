"use client";

interface FileInputButtonProps {
  onClick: () => void;
}

export default function FileInputButton({ onClick }: FileInputButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md bg-emerald-700 text-white px-4 py-2 hover:bg-emerald-900 transition duration-200"
    >
      ファイル選択
    </button>
  );
}
