/**
 * ScoringRubricPage.tsx
 * -------------------------------------------------
 * Figma Reference: 3314:46772
 * Routes: /admin/rubric
 *
 * Module 6: Configurable Scoring Rubric Settings
 *  - Configurable points matrix for IMCC college activity types
 *  - Edit default points weights and activity descriptions
 *  - Policy threshold settings
 * -------------------------------------------------
 */

import React, { useState } from "react";
import { Award, Sparkles, Edit2, CheckCircle2, RotateCcw, Shield, Loader2 } from "lucide-react";

import {
  useScoringRubric,
  useUpdateScoringPolicy,
  INITIAL_SCORING_POLICIES,
} from "@/api/participations.api";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { ScoringPolicyDTO } from "@almalink/shared";

export const ScoringRubricPage: React.FC = () => {
  const { data: policies = [], isLoading } = useScoringRubric();
  const { mutate: updatePolicy, isPending: isUpdating } = useUpdateScoringPolicy();

  // ── Edit Modal State ──
  const [activePolicy, setActivePolicy] = useState<ScoringPolicyDTO | null>(null);
  const [editPoints, setEditPoints] = useState<number>(15);
  const [editDescription, setEditDescription] = useState<string>("");

  const [dualSignOffThreshold, setDualSignOffThreshold] = useState<number>(25);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  const handleOpenEdit = (policy: ScoringPolicyDTO) => {
    setActivePolicy(policy);
    setEditPoints(policy.defaultPoints);
    setEditDescription(policy.description || "");
  };

  const handleSavePolicy = () => {
    if (!activePolicy) return;

    updatePolicy(
      {
        activityType: activePolicy.activityType,
        defaultPoints: editPoints,
        description: editDescription,
      },
      {
        onSuccess: () => {
          setActivePolicy(null);
          setSavedNotice(true);
          setTimeout(() => setSavedNotice(false), 3000);
        },
      }
    );
  };

  const handleResetDefaults = () => {
    if (window.confirm("Reset all scoring policies to MES IMCC institutional standards?")) {
      INITIAL_SCORING_POLICIES.forEach((p) => {
        updatePolicy({
          activityType: p.activityType,
          defaultPoints: p.defaultPoints,
          description: p.description ?? undefined,
        });
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7FA] flex flex-col lg:flex-row">
      {/* 1. Left Persistent Sidebar */}
      <AdminSidebar activeNav="rubric" />

      {/* 2. Right Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          breadcrumbs={[
            { label: "Workspace", href: "/admin/dashboard" },
            { label: "Scoring Rubric" },
          ]}
        />

        <main className="flex-1 space-y-6 pb-20">
          {/* ── Top Header ─────────────────────────────────────────────────── */}
          <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-iris">
                    Governance & Policy
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-brand-iris border border-brand-iris/20">
                    Figma Frame 3314:46772
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
                  Contribution Scoring Rubric
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  MES IMCC Pune institutional weightage policy for alumni activities and awards.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetDefaults}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                  Reset to IMCC Defaults
                </button>
              </div>
            </div>
          </div>

          {/* ── Main Container ─────────────────────────────────────────────── */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            {savedNotice && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Scoring rubric settings updated successfully.
              </div>
            )}

            {/* Threshold & Policy Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-iris/10 via-brand-iris/5 to-transparent border border-brand-iris/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-iris text-white flex items-center justify-center shrink-0 shadow-sm shadow-brand-iris/30">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Contribution Ledger Integrity & Anti-Tamper Policy
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Points are automatically calculated when coordinators verify attendance.
                    Adjustments exceeding {dualSignOffThreshold} points require College
                    Administrator dual sign-off.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <label className="text-xs font-bold text-slate-600">Dual Sign-Off Threshold:</label>
                <input
                  type="number"
                  min="15"
                  max="100"
                  value={dualSignOffThreshold}
                  onChange={(e) => setDualSignOffThreshold(parseInt(e.target.value, 10) || 25)}
                  className="w-16 px-2.5 py-1 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-brand-iris/20"
                />
                <span className="text-xs text-slate-500">pts</span>
              </div>
            </div>

            {/* Rubric Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading ? (
                <div className="col-span-2 py-16 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-iris mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Loading scoring rubric policies…</p>
                </div>
              ) : (
                policies.map((policy) => (
                  <div
                    key={policy.policyId}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-xl bg-brand-iris/10 text-brand-iris flex items-center justify-center font-bold text-xs shrink-0">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 leading-snug">
                              {policy.activityType}
                            </h3>
                            <span className="text-[11px] text-slate-400">
                              Policy ID: #{policy.policyId}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-brand-iris text-white shadow-xs">
                            <Award className="h-3.5 w-3.5" />
                            {policy.defaultPoints} pts
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {policy.description || "Standard MES IMCC activity contribution weightage."}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">
                        Last modified:{" "}
                        {policy.updatedAt
                          ? new Date(policy.updatedAt).toLocaleDateString("en-IN")
                          : "Default"}
                      </span>

                      <button
                        onClick={() => handleOpenEdit(policy)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                      >
                        <Edit2 className="h-3 w-3" />
                        Edit Weight
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── Edit Policy Modal ─────────────────────────────────────────────── */}
      {activePolicy && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActivePolicy(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-iris">
                Edit Scoring Weight
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {activePolicy.activityType}
              </h3>
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Default Points Awarded <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editPoints}
                    onChange={(e) => setEditPoints(parseInt(e.target.value, 10) || 0)}
                    className="w-28 px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-brand-iris focus:outline-none focus:ring-2 focus:ring-brand-iris/20"
                  />
                  <span className="text-xs font-semibold text-slate-500">Points per session</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Policy Description / Criteria
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-iris/20 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActivePolicy(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSavePolicy}
                disabled={isUpdating}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-brand-iris text-white hover:bg-brand-iris/90 shadow-sm transition-all"
              >
                {isUpdating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
