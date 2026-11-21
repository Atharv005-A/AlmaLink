import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "@/api/auth.api";
import {
  LayoutDashboard,
  CheckCircle2,
  Users,
  Calendar,
  Mail,
  Award,
  BarChart3,
  FileText,
  Bell,
  ShieldCheck,
  BookOpen,
  FolderGit2,
  ListOrdered,
  Menu,
  X,
  LogOut,
} from "lucide-react";

interface AdminSidebarProps {
  activeNav?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeNav = "dashboard" }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  // Retrieve user session dynamically
  let user: { fullName?: string; email?: string; role?: string } | null = null;
  try {
    const raw = localStorage.getItem("almalink_user");
    if (raw) user = JSON.parse(raw);
  } catch {}

  // If user session exists, their authenticated role determines the sidebar.
  // Otherwise fallback to route-based detection for preview/unauthenticated testing.
  const isCoordinator = user
    ? user.role === "CELL_COORDINATOR"
    : window.location.pathname.startsWith("/coordinator");

  if (!user) {
    if (isCoordinator) {
      user = {
        fullName: "Prof. Meera Kulkarni",
        email: "meera.tech@imcc.mespune.in",
        role: "CELL_COORDINATOR",
      };
    } else {
      user = {
        fullName: "Dr. Anjali Joshi",
        email: "admin@imcc.mespune.in",
        role: "COLLEGE_ADMIN",
      };
    }
  }

  // Navigation Items customized by role (Figma Frame 3314:45305 & 3314:46128)
  const navItems = isCoordinator
    ? [
        {
          id: "dashboard",
          label: "Dashboard",
          href: "/coordinator/dashboard",
          icon: LayoutDashboard,
        },
        {
          id: "activities",
          label: "Activities",
          href: "/coordinator/activities",
          icon: Calendar,
        },
        {
          id: "invitations",
          label: "Invitations",
          href: "/coordinator/invitations",
          icon: Mail,
        },
        {
          id: "alumni",
          label: "Alumni directory",
          href: "/coordinator/activities",
          icon: Users,
        },
        {
          id: "notifications",
          label: "Notifications",
          href: "/coordinator/dashboard",
          icon: Bell,
        },
      ]
    : [
        { id: "dashboard", label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        {
          id: "verifications",
          label: "Verifications",
          href: "/admin/verifications",
          icon: CheckCircle2,
        },
        { id: "alumni", label: "Alumni directory", href: "/admin/alumni", icon: Users },
        { id: "activities", label: "Activities", href: "/admin/activities", icon: Calendar },
        {
          id: "invitations",
          label: "Invitations",
          href: "/admin/invitations",
          icon: Mail,
        },
        { id: "approvals", label: "Approvals", href: "/admin/verifications", icon: ShieldCheck },
        { id: "leaderboard", label: "Leaderboard", href: "/admin/leaderboard", icon: ListOrdered },
        { id: "awards", label: "Awards", href: "/admin/awards", icon: Award },
        { id: "reports", label: "Reports", href: "/admin/reports", icon: BarChart3 },
        { id: "staff", label: "Staff & cells", href: "/admin/staff", icon: FolderGit2 },
        { id: "rubric", label: "Scoring rubric", href: "/admin/rubric", icon: BookOpen },
        { id: "audit", label: "Audit log", href: "/admin/audit", icon: FileText },
        { id: "notifications", label: "Notifications", href: "/admin/dashboard", icon: Bell },
      ];

  const getInitials = (name?: string) => {
    if (!name) return isCoordinator ? "MK" : "AJ";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    const cleanParts = parts.filter(
      (p) =>
        !["dr.", "dr", "prof.", "prof", "mr.", "mr", "ms.", "ms", "mrs.", "mrs"].includes(
          p.toLowerCase()
        )
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
    return isCoordinator ? "Cell Coordinator" : "HOD · Administrator";
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}
    navigate("/login");
  };

  const homeHref = isCoordinator ? "/coordinator/dashboard" : "/admin/dashboard";

  const sidebarContent = (
    <div className="w-[236px] bg-[#161D2C] text-white flex flex-col justify-between h-full min-h-screen py-5 px-4 border-r border-[#2A3448] flex-shrink-0">
      {/* Brand Logo & College Staff Badge */}
      <div className="space-y-3">
        <Link to={homeHref} className="block px-2">
          <img src="/imcc-almalink-logo-white.svg" alt="MES IMCC AlmaLink" className="h-10 w-auto" />
        </Link>

        {/* Figma Badge: INTERNAL ONLY · College staff */}
        <div className="px-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#5D5FEF]/20 text-[#8C8EFA] border border-[#5D5FEF]/30">
            INTERNAL ONLY · College staff
          </span>
        </div>

        {/* Navigation Items (Figma Frame 3314:45305) */}
        <nav className="space-y-0.5 pt-2">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-r-lg text-[13px] font-medium transition-all ${
                  isActive
                    ? "bg-[#5D5FEF]/20 text-white font-semibold border-l-[3px] border-[#5D5FEF]"
                    : "text-[#B8BFD1] hover:text-white hover:bg-white/5 border-l-[3px] border-transparent"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-[#5D5FEF]" : "text-[#71778A]"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Footer Card (Figma Frame 3314:45305) */}
      <div className="pt-4 border-t border-[#2A3448] flex items-center justify-between gap-2 px-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-full bg-[#5D5FEF] text-white flex items-center justify-center font-bold text-xs shrink-0">
            {getInitials(user.fullName)}
          </div>
          <div className="min-w-0 leading-tight">
            <p className="text-xs font-semibold text-white truncate">
              {user.fullName || (isCoordinator ? "Prof. Meera Kulkarni" : "Dr. Anjali Joshi")}
            </p>
            <p className="text-[10px] text-[#71778A] truncate mt-0.5">{getRoleLabel(user.role)}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="text-[#71778A] hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors shrink-0"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden lg:block w-[236px] flex-shrink-0">
        <div className="fixed top-0 left-0 w-[236px] h-screen overflow-y-auto z-40">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer Trigger (Header overlay) */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-[#161D2C] text-white shadow-md border border-slate-700"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        >
          <div className="w-[236px] h-full" onClick={(e) => e.stopPropagation()}>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
