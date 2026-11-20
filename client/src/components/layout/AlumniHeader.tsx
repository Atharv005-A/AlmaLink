import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "@/api/auth.api";
import { Bell, ChevronDown, User, LogOut } from "lucide-react";

interface AlumniHeaderProps {
  breadcrumbs?: { label: string; href?: string }[];
}

export const AlumniHeader: React.FC<AlumniHeaderProps> = ({
  breadcrumbs = [{ label: "My account", href: "/alumni/home" }, { label: "Home & contributions" }],
}) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  let user: {
    fullName?: string;
    email?: string;
    role?: string;
    program?: string;
    graduationYear?: number;
  } = {
    fullName: "Aarav Deshmukh",
    email: "aarav.deshmukh@gmail.com",
    role: "ALUMNI",
    program: "MCA",
    graduationYear: 2018,
  };
  try {
    const raw = localStorage.getItem("almalink_user");
    if (raw) {
      const parsed = JSON.parse(raw);
      user = {
        fullName: parsed.fullName || "Aarav Deshmukh",
        email: parsed.email || "aarav.deshmukh@gmail.com",
        role: parsed.role || "ALUMNI",
        program: parsed.program || "MCA",
        graduationYear: parsed.graduationYear || 2024,
      };
    }
  } catch {}

  const getInitials = (name?: string) => {
    if (!name) return "AD";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}
    navigate("/login");
  };

  return (
    <header className="h-[64px] bg-[#161D2C] border-b border-[#2A3448] px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Breadcrumbs (Figma 3314:47367) */}
      <nav className="flex items-center gap-2 pl-10 lg:pl-0 text-xs">
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-slate-500">/</span>}
              {crumb.href && !isLast ? (
                <Link to={crumb.href} className="text-slate-400 hover:text-white transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className={isLast ? "font-semibold text-slate-200" : "text-slate-400"}>
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Right: Notifications & Profile Pill */}
      <div className="flex items-center gap-5">
        <button
          className="text-slate-400 hover:text-white transition-colors relative p-1"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        {/* User Pill with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 text-left focus:outline-none p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-[#3B4252] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {getInitials(user.fullName)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-white leading-tight">{user.fullName}</p>
              <p className="text-[10px] text-slate-400">
                {user.program || "MCA"} · Class of {user.graduationYear || 2024}
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-slate-900">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold truncate">{user.fullName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
              </div>
              <Link
                to="/alumni/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <User className="h-3.5 w-3.5 text-slate-500" />
                <span>My Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AlumniHeader;
