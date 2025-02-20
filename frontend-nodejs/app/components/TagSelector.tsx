import React from "react";

interface TagSelectorProps {
  availableTags: string[];
  selectedTags: string[];
  onChange: (newSelectedTags: string[]) => void;
}

export default function TagSelector({
  availableTags,
  selectedTags,
  onChange,
}: TagSelectorProps) {
  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      // 既に選択されている場合は外す
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      // 選択されていなければ追加
      onChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {availableTags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => handleTagClick(tag)}
          className={`px-3 py-1 rounded-full border transition-all ${
            selectedTags.includes(tag)
              ? "bg-emerald-700 text-white border-emerald-700 hover:bg-emerald-600"
              : "bg-white text-gray-900 border-gray-300 hover:bg-emerald-600"
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
