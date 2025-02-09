import { Home, User, Bell, Mail, Settings } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

interface NavItemProps {
  href: string;
  icon: ReactNode;
  text: string;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, text }) => {
  return (
    <Link
      href={href}
      className="flex items-center space-x-3 p-2 rounded-md transition-transform duration-300 ease-in-out hover:translate-x-20 hover:bg-[#662E1C]"
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
};

export const Sidebar: React.FC = () => {
  return (
    <div className="w-60 h-screen bg-[#8B5E5E] text-[#ECF0F1] p-10 flex flex-col">
      <nav className="space-y-5">
        <NavItem href="/timeline_posts" icon={<Home size={20} />} text="タイムライン" />
        <NavItem href="#" icon={<User size={20} />} text="プロフィール一覧" />
        <NavItem href="#" icon={<Bell size={20} />} text="通知" />
        <NavItem href="#" icon={<Mail size={20} />} text="メール" />
        <NavItem href="#" icon={<Settings size={20} />} text="myプロフィール" />
      </nav>
    </div>
  );
};
