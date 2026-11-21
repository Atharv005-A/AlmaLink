import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Mail, User, Bell, Menu, X } from "lucide-react";

interface AlumniSidebarProps {
  activeNav?: "home" | "invitations" | "profile" | "notifications";
}

export const AlumniSidebar: React.FC<AlumniSidebarProps> = ({ activeNav }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Determine active item from prop or pathname
  const currentActive =
    activeNav ||
    (location.pathname.includes("/profile")
      ? "profile"
      : location.pathname.includes("/invitations")
        ? "invitations"
        : location.pathname.includes("/notifications")
          ? "notifications"
          : "home");

  let user: { fullName?: string; email?: string; program?: string; graduationYear?: number } = {
    fullName: "Aarav Deshmukh",
    program: "MCA",
    graduationYear: 2018,
  };
  try {
    const raw = localStorage.getItem("almalink_user");
    if (raw) {
      const parsed = JSON.parse(raw);
      user = {
        fullName: parsed.fullName || "Aarav Deshmukh",
        program: parsed.program || "MCA",
        graduationYear: parsed.graduationYear || 2024,
      };
    }
  } catch {}

  const navItems = [
    { id: "home", label: "Home", href: "/alumni/home", icon: Home },
    { id: "invitations", label: "Invitations", href: "/alumni/invitations", icon: Mail },
    { id: "profile", label: "My profile", href: "/alumni/profile", icon: User },
    { id: "notifications", label: "Notifications", href: "/alumni/notifications", icon: Bell },
  ];

  const sidebarContent = (
    <div className="w-[236px] bg-[#161D2C] text-white flex flex-col justify-between h-full min-h-screen py-5 px-4 border-r border-[#2A3448] flex-shrink-0">
      {/* Brand Header */}
      <div className="space-y-6">
        <Link to="/alumni/home" className="block px-2">
          <img src="/imcc-almalink-logo-white.svg" alt="MES IMCC AlmaLink" className="h-10 w-auto" />
        </Link>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentActive === item.id;
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#232D42] text-white font-semibold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${isActive ? "text-[#5D5FEF]" : "text-slate-400"}`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer with Privacy Assurance (Figma 3314:47367) */}
      <div className="pt-6 border-t border-[#2A3448] px-2 space-y-3">
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Your profile and contribution records stay private.
        </p>
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-white truncate">{user.fullName}</p>
          <p className="text-[11px] text-slate-400">
            {user.program || "MCA"} · Class of {user.graduationYear || 2024}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block shrink-0">{sidebarContent}</aside>

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-[#161D2C] text-white border border-[#2A3448] shadow-md focus:outline-none"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default AlumniSidebar;
