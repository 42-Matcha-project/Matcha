import React from "react";

/* ボタンの種類 */
export type ButtonVariant = "primary" | "secondary" | "outline";

/* ボタンのプロパティ */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

/* 全てのボタンに共通する基本クラス */
const baseClasses =
  "px-6 py-2 rounded transition duration-200 focus:outline-none";

/* ボタンの種類ごとのクラス */
const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-emerald-700 text-white shadow hover:bg-emerald-900",
  secondary:
    "border border-emerald-700 text-emerald-800 hover:bg-emerald-900 hover:text-white",
  outline: "border border-gray-300 text-gray-900 hover:bg-gray-100",
};

/* ボタンコンポーネント */
const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  className = "",
  ...props
}) => {
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
};

export default Button;
