import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlumniSidebar } from "@/components/layout/AlumniSidebar";
import { AlumniHeader } from "@/components/layout/AlumniHeader";
import { authApi } from "@/api/auth.api";
import { User, Mail, ArrowRight } from "lucide-react";

export const AlumniHomePage: React.FC = () => {
  const [user, setUser] = useState<{
    fullName?: string;
    email?: string;
    program?: string;
    graduationYear?: number;
  } | null>(() => {
    try {
      const raw = localStorage.getItem("almalink_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    authApi
      .getCurrentUser()
      .then((session) => {
        if (session) setUser(session);
      })
      .catch(() => {});
  }, []);

  const fullName = user?.fullName || "Aarav Deshmukh";
  const firstName = fullName.split(" ")[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Figma Persistent Sidebar */}
      <AlumniSidebar activeNav="home" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AlumniHeader
          breadcrumbs={[
            { label: "My account", href: "/alumni/home" },
            { label: "Home & contributions" },
          ]}
        />

        <main className="flex-1 p-6 sm:p-8 max-w-6xl w-full mx-auto space-y-6">
          {/* Top Title Section (Figma 3314:47367) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                ALUMNI PORTAL
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Welcome back, {firstName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Your experience makes a difference. Here's your connection with IMCC.
              </p>
            </div>

            <Link
              to="/alumni/profile"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors shrink-0 self-start sm:self-auto"
            >
              <User className="h-3.5 w-3.5 text-slate-500" />
              <span>Update my profile</span>
            </Link>
          </div>

          {/* Thank You Banner (Figma 3314:47367) */}
          <div className="bg-[#EEF2FF] border border-[#E0E7FF] rounded-xl p-4 sm:p-5">
            <h3 className="text-xs font-bold text-[#3730A3]">Thank you for giving back</h3>
            <p className="text-xs text-[#4338CA] mt-0.5 leading-relaxed">
              Your profile is verified. Invitations are matched to your expertise and availability.
            </p>
          </div>

          {/* 3 Metric Cards Grid (Figma 3314:47367) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {/* Card 1 */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5">
              <p className="text-xs text-slate-500 font-medium">My approved contributions</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">4</p>
              <p className="text-[11px] text-slate-400 mt-2">Academic year 2026–27</p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5">
              <p className="text-xs text-slate-500 font-medium">My approved points</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">180</p>
              <p className="text-[11px] text-slate-400 mt-2">Only your own records are visible</p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5">
              <p className="text-xs text-slate-500 font-medium">My pending records</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">1</p>
              <p className="text-[11px] text-slate-400 mt-2">Not counted until approved</p>
            </div>
          </div>

          {/* 2-Column Split: Next Campus Visit & Invitation Waiting */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Card: Your next campus visit */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 sm:p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <p className="text-sm font-bold text-slate-900">Your next campus visit</p>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Accepted
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                    Technical
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">AI for Industry</h3>

                <div className="text-xs text-slate-600 space-y-0.5">
                  <p className="font-semibold text-slate-800">23 Oct 2026 · 10:00 AM – 1:00 PM</p>
                  <p className="text-slate-500">Computer Lab 2 · IMCC, Pune</p>
                </div>

                <div className="text-xs text-slate-500 pt-1 space-y-0.5 border-t border-slate-100">
                  <p>Workshop facilitator · Prof. Meera Kulkarni</p>
                  <p className="text-[11px] text-slate-400">
                    Please arrive 15 minutes early. Bring your laptop.
                  </p>
                </div>
              </div>

              <div>
                <Link
                  to="/alumni/invitations"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 text-slate-500" />
                  <span>View my invitations</span>
                </Link>
              </div>
            </div>

            {/* Right Card: An invitation is waiting */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 sm:p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <p className="text-sm font-bold text-slate-900">An invitation is waiting</p>

                <h3 className="text-base font-bold text-slate-900">Mock interview clinic</h3>

                <div className="text-xs text-slate-600 space-y-0.5">
                  <p className="font-medium text-slate-700">30 Oct 2026 · Placement cell</p>
                  <p className="text-slate-500">Reply by 25 Oct, 6:00 PM</p>
                </div>

                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                    Sent
                  </span>
                </div>
              </div>

              <div>
                <Link
                  to="/alumni/invitations"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-iris hover:bg-brand-iris-hover text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <span>Review invitation</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Section: My contribution history (Figma 3314:47367) */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">My contribution history</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Your approved work, verified by the college.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-5">Date</th>
                    <th className="py-3 px-5">Activity</th>
                    <th className="py-3 px-5">Contribution / cell</th>
                    <th className="py-3 px-5">My points</th>
                    <th className="py-3 px-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 text-slate-600 whitespace-nowrap">12 Aug 2026</td>
                    <td className="py-3.5 px-5 font-semibold text-slate-900">
                      Cloud engineering works...
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">Workshop · Technical</td>
                    <td className="py-3.5 px-5 font-bold text-slate-900">60</td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center gap-1.5 text-blue-600 font-semibold">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                        Approved
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 text-slate-600 whitespace-nowrap">5 Sep 2026</td>
                    <td className="py-3.5 px-5 font-semibold text-slate-900">Hack for Pune</td>
                    <td className="py-3.5 px-5 text-slate-600">Hackathon judge · Techn...</td>
                    <td className="py-3.5 px-5 font-bold text-slate-900">50</td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center gap-1.5 text-blue-600 font-semibold">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                        Approved
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 text-slate-600 whitespace-nowrap">17 Jul 2026</td>
                    <td className="py-3.5 px-5 font-semibold text-slate-900">
                      Careers in product engi...
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">Guest lecture · Placeme...</td>
                    <td className="py-3.5 px-5 font-bold text-slate-900">40</td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center gap-1.5 text-blue-600 font-semibold">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                        Approved
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 text-slate-600 whitespace-nowrap">18 Sep 2026</td>
                    <td className="py-3.5 px-5 font-semibold text-slate-900">
                      Career readiness day
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">Mock interview · Placem...</td>
                    <td className="py-3.5 px-5 font-bold text-slate-900">30</td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center gap-1.5 text-blue-600 font-semibold">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                        Approved
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 sm:px-6 bg-slate-50/60 border-t border-slate-100 text-xs font-semibold text-slate-700">
              My approved total: 60 + 50 + 40 + 30 = 180
            </div>
          </div>

          {/* Section: Pending & other records (Figma 3314:47367) */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Pending & other records</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-5">Date</th>
                    <th className="py-3 px-5">Activity</th>
                    <th className="py-3 px-5">Record detail</th>
                    <th className="py-3 px-5">Counted</th>
                    <th className="py-3 px-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 text-slate-600 whitespace-nowrap">24 Sep 2026</td>
                    <td className="py-3.5 px-5 font-semibold text-slate-900">Advanced cloud lab</td>
                    <td className="py-3.5 px-5 text-slate-600">Workshop · Awaiting adm...</td>
                    <td className="py-3.5 px-5 font-bold text-slate-900">0</td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center gap-1.5 text-blue-600 font-semibold">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                        Pending
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 text-slate-600 whitespace-nowrap">10 Sep 2026</td>
                    <td className="py-3.5 px-5 font-semibold text-slate-900">
                      Sports alumni meetup
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">No-show · No contributi...</td>
                    <td className="py-3.5 px-5 font-bold text-slate-900">0</td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center gap-1.5 text-blue-600 font-semibold">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                        Rejected
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Note banner under pending table */}
            <div className="p-4 sm:p-5 bg-[#EEF2FF] border-t border-[#E0E7FF] text-xs">
              <h4 className="font-bold text-[#3730A3]">Pending is not the same as approved</h4>
              <p className="text-[#4338CA] mt-0.5 leading-relaxed">
                Your Advanced cloud lab record is under review. You'll be notified when the college
                approves or requests a correction.
              </p>
            </div>
          </div>

          {/* Institutional Privacy Footer (Figma 3314:47367) */}
          <div className="pt-4 pb-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 border-t border-slate-200/60">
            <span>IMCC AlmaLink · MES, Pune</span>
            <span>Only your records are visible</span>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AlumniHomePage;
