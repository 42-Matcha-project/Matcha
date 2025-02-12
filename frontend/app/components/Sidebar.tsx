"use client";

import classnames from "classnames";
import { Home, User, Bell, Mail, Settings } from "lucide-react";
import Link from "next/link";
import { useContext } from "react";
import { SidebarContext } from "../contexts/SidebarContext";
import { usePathname } from "next/navigation";

const Sidebar: React.FC = () => {
  const { isOpen } = useContext(SidebarContext);
  const pathname = usePathname();

  return (
    <div
      className={classnames(
        "fixed top-0 left-0 h-full bg-black text-white p-12 flex flex-col transition-transform duration-500 ease-in-out",
        { "translate-x-0": isOpen, "-translate-x-0": !isOpen },
      )}
    >
      <nav className="space-y-10">
        <NavItem href="/timeline" icon={<Home size={20} />} text="timeline" isActive={pathname === "/timeline"} />
        <NavItem href="/profilelist" icon={<User size={20} />} text="profile list" isActive={pathname === "/profilelist"} />
        <NavItem href="/notification" icon={<Bell size={20} />} text="notification" isActive={pathname === "/notification"}/>
        <NavItem href="/messages" icon={<Mail size={20} />} text="message" isActive={pathname === "/messages"}/>
        <NavItem href="/myprofiles" icon={<Settings size={20} />} text="my profile" isActive={pathname === "/myprofiles"} />
      </nav>
    </div>
  );
};

const NavItem: React.FC<{
  href: string;
  icon: React.ReactNode;
  text: string;
  isActive: boolean;
}> = ({ href, icon, text, isActive}) => (
  <Link
    href={href}
    className={`flex items-center space-x-1 p-2 rounded-md transition-transform duration-700 ease-in-out ${
      isActive ? "bg-[#662E1C] translate-x-10 shadow-[0_0_10px_rgba(255,255,0.9,0.7)]": "hover:bg-[#662E1C] hover:translate-x-10 hover:shadow-[0_0_10px_rgba(255,255,255,1)]"
    }`}
  >
    {icon}
    <span>{text}</span>
  </Link>
);

export default Sidebar;
