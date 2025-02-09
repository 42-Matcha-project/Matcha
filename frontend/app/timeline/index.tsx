import { Home, User, Bell, Mail, Settings } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

interface NavItemProps {
  href: string;
  icon: ReactNode;
  text: string;
}

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 h-screen bg-gray-100 p-5 flex flex-col">
      <nav className="space-y-20">
        <NavItem href="#" icon={<Home size={20} />} text="タイムライン" />
        <NavItem href="#" icon={<User size={20} />} text="プロフィール一覧" />
        <NavItem href="#" icon={<Bell size={20} />} text="通知" />
        <NavItem href="#" icon={<Mail size={20} />} text="メール" />
        <NavItem href="#" icon={<Settings size={20} />} text="My profile" />
      </nav>
    </div>
  );
};

const NavItem: React.FC<NavItemProps> = ({ href, icon, text }) => {
    return (
      <Link
        href={href}
        className="flex items-center space-x-3 p-2 rounded-md bg-green-900 transition-transform duration-300 ease-in-out hover:translate-x-12 hover:bg-gray-500"
      >
        {icon}
        <span>{text}</span>
      </Link>
    );
  };

export default Sidebar;
