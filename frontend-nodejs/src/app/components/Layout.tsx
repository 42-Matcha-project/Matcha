import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="relative flex items-center justify-center min-h-screen">
      <div className="absolute inset-0 bg-[url('/images/Welcome-background.png')] bg-cover bg-center bg-no-repeat" />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};

export default Layout;
