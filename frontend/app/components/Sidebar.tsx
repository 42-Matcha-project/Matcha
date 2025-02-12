"use client";

import classnames from "classnames";
import { Home, User, Bell, Mail, Settings } from "lucide-react";
import Link from "next/link";
import { useContext } from "react";
import { SidebarContext } from "../contexts/SidebarContext";

const Sidebar: React.FC = () => {
  const { isOpen } = useContext(SidebarContext);

  return (
    <div
      className={classnames(
        "fixed top-0 left-0 h-full bg-black text-white p-12 flex flex-col transition-transform duration-500 ease-in-out",
        { "translate-x-0": isOpen, "-translate-x-0": !isOpen },
      )}
    >
      <nav className="space-y-10">
        <NavItem href="/timeline" icon={<Home size={20} />} text="timeline" />
        <NavItem href="/profilelist" icon={<User size={20} />} text="profile list" />
        <NavItem href="/notification" icon={<Bell size={20} />} text="notification" />
        <NavItem href="/messages" icon={<Mail size={20} />} text="message" />
        <NavItem href="/myprofiles" icon={<Settings size={20} />} text="my profile" />
      </nav>
    </div>
  );
};

const NavItem: React.FC<{
  href: string;
  icon: React.ReactNode;
  text: string;
}> = ({ href, icon, text }) => (
  <Link
    href={href}
    className="flex items-center space-x-1 p-2 rounded-md transition-transform duration-700 ease-in-out hover:translate-x-7 hover:bg-[#662E1C]"
  >
    {icon}
    <span>{text}</span>
  </Link>
);

export default Sidebar;
