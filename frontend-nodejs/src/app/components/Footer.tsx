import React from "react";

export default function Footer() {
  return (
    <footer
      className="bottom-0 left-0 w-full z-[100] flex items-center justify-center shadow-xl"
      style={{
        background: "linear-gradient(105deg, #f7e9b0 0%, #e6c97a 100%)",
        backgroundColor: "#f7e9b0",
        opacity: 0.97,
        minHeight: "56px",
      }}
    >
      <div className="text-center font-bold text-lg text-gray-700">Matcha</div>
    </footer>
  );
}
