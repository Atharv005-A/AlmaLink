import React, { useState } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";

interface AdminSidebarProps {
  activeNav?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeNav = "dashboard" }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { id: "verifications", label: "Verifications", href: "/admin/verifications", icon: CheckCircle2 },
    { id: "alumni", label: "Alumni directory", href: "/admin/alumni", icon: Users },
    { id: "activities", label: "Activities", href: "/coordinator/activities", icon: Calendar },
    { id: "invitations", label: "Invitations", href: "/coordinator/activities/1/invitations", icon: Mail },
    { id: "approvals", label: "Approvals", href: "/admin/verifications", icon: ShieldCheck },
    { id: "leaderboard", label: "Leaderboard", href: "/admin/leaderboard", icon: ListOrdered },
    { id: "awards", label: "Awards", href: "/admin/awards", icon: Award },
    { id: "reports", label: "Reports", href: "/admin/reports", icon: BarChart3 },
    { id: "staff", label: "Staff & cells", href: "/admin/staff", icon: FolderGit2 },
    { id: "rubric", label: "Scoring rubric", href: "/admin/rubric", icon: BookOpen },
    { id: "audit", label: "Audit log", href: "/admin/audit", icon: FileText },
    { id: "notifications", label: "Notifications", href: "/admin/notifications", icon: Bell },
  ];

  const sidebarContent = (
    <div className="w-[236px] bg-[#161D2C] text-white flex flex-col justify-between h-full min-h-screen py-5 px-4 border-r border-[#2A3448] flex-shrink-0">
      {/* Brand Logo */}
      <div className="space-y-4">
        <Link to="/admin/dashboard" className="block px-2">
          <img
            src="/imcc-almalink-logo-white.svg"
            alt="MES IMCC AlmaLink"
            className="h-8 w-auto"
          />
        </Link>

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
          <div
            className="w-[236px] h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
