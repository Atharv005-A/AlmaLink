import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "@/api/auth.api";
import { Bell, LogOut } from "lucide-react";

interface AdminHeaderProps {
  breadcrumbs?: { label: string; href?: string }[];
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  breadcrumbs = [
    { label: "Workspace", href: "/admin/dashboard" },
    { label: "Dashboard" },
  ],
}) => {
  const navigate = useNavigate();

  let user: { fullName?: string; email?: string; role?: string } = {
    fullName: "Dr. Anjali Joshi",
    email: "admin@imcc.mespune.in",
    role: "COLLEGE_ADMIN",
  };
  try {
    const raw = localStorage.getItem("almalink_user");
    if (raw) user = JSON.parse(raw);
  } catch {}

  // Compute initials dynamically (e.g. "Dr. Anjali Joshi" -> "AJ", "Prithviraj Patil" -> "PP")
  const getInitials = (name?: string) => {
    if (!name) return "AJ";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    const cleanParts = parts.filter(
      (p) => !["dr.", "dr", "prof.", "prof", "mr.", "mr", "ms.", "ms", "mrs.", "mrs"].includes(p.toLowerCase())
    );
    if (cleanParts.length >= 2) {
      return (cleanParts[0][0] + cleanParts[cleanParts.length - 1][0]).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getRoleLabel = (role?: string) => {
    if (role === "SUPER_ADMIN") return "Super Administrator";
    if (role === "COLLEGE_ADMIN") return "HOD · Administrator";
    if (role === "CELL_COORDINATOR") return "Cell Coordinator";
    if (role === "ALUMNI") return "Alumni Member";
    return "HOD · Administrator";
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}
    navigate("/login");
  };

  return (
    <header className="h-[76px] bg-[#161D2C] border-b border-[#2A3448] px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Breadcrumbs (Figma 3314:45305) */}
      <nav className="flex items-center gap-2 pl-10 lg:pl-0 text-xs">
        {breadcrumbs.map((b, i) => {
          const isLast = i === breadcrumbs.length - 1;
          return (
            <React.Fragment key={i}>
              {i > 0 && <span className="text-[#71778A]">/</span>}
              {isLast ? (
                <span className="font-semibold text-white">{b.label}</span>
              ) : (
                <Link
                  to={b.href || "#"}
                  className="text-[#B8BFD1] hover:text-white transition-colors"
                >
                  {b.label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Right: Actions & User Pill (Figma 3314:45305) */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button
          title="Notifications"
          className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#B8BFD1] hover:text-white hover:bg-white/10 transition-colors relative"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[#5D5FEF]" />
        </button>

        {/* Profile Pill */}
        <div className="h-10 px-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2.5">
          <div className="h-6 w-6 rounded-full bg-[#5D5FEF] text-white flex items-center justify-center font-bold text-[10px]">
            {getInitials(user.fullName)}
          </div>
          <div className="hidden sm:block text-left text-xs leading-none">
            <p className="font-semibold text-white text-[12px]">
              {user.fullName || "Dr. Anjali Joshi"}
            </p>
            <p className="text-[10px] text-[#B8BFD1] mt-0.5">{getRoleLabel(user.role)}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="text-[#71778A] hover:text-rose-400 pl-1 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
