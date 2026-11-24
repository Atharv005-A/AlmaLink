import React, { useEffect, useState, useMemo } from "react";
import { AlumniSidebar } from "@/components/layout/AlumniSidebar";
import { AlumniHeader } from "@/components/layout/AlumniHeader";
import { useAlumniProfile, useUpdateAlumniProfile } from "@/api/alumni.api";
import { X, Check, Loader2 } from "lucide-react";

const INDUSTRY_OPTIONS = [
  "Information technology",
  "Banking & financial services",
  "Consulting & strategy",
  "Automotive & manufacturing",
  "Healthcare & life sciences",
  "Education & EdTech",
  "Other industry",
];

const AVAILABILITY_OPTIONS = [
  "Weekends · 2 sessions/month",
  "Weekends · 1 session/month",
  "Weekdays post 6:00 PM",
  "Flexible / with advance notice",
];

const FORMAT_OPTIONS = ["On campus + online", "Online only", "On campus Pune only"];

const ACTIVITY_OPTIONS = ["Workshops", "Guest lectures", "Hackathon judging", "Mock interviews"];

export const AlumniProfilePage: React.FC = () => {
  // User & Profile State
  const [user, setUser] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    enrollmentNo?: string;
    program?: string;
    graduationYear?: number;
  }>({
    fullName: "Aarav Deshmukh",
    email: "aarav.deshmukh@gmail.com",
    phone: "+91 98220 45871",
    enrollmentNo: "MES/MCA/2015/018",
    program: "MCA",
    graduationYear: 2018,
  });

  // Form Fields (matching Figma 3314:45198)
  const [organization, setOrganization] = useState("Persistent Systems");
  const [designation, setDesignation] = useState("Senior Software Engineer");
  const [industry, setIndustry] = useState(INDUSTRY_OPTIONS[0]);
  const [linkedinUrl, setLinkedinUrl] = useState("linkedin.com/in/aarav-deshmukh");
  const [skills, setSkills] = useState<string[]>(["Cloud computing", "Java", "Generative AI"]);
  const [areasOfExpertise, setAreasOfExpertise] = useState(
    "Cloud architecture, technical interviewing, hands-on workshops"
  );
  const [availability, setAvailability] = useState(AVAILABILITY_OPTIONS[0]);
  const [preferredFormat, setPreferredFormat] = useState(FORMAT_OPTIONS[0]);
  const [preferredActivities, setPreferredActivities] = useState<string[]>([
    "Workshops",
    "Guest lectures",
    "Hackathon judging",
    "Mock interviews",
  ]);
  const [availabilityNotes, setAvailabilityNotes] = useState(
    "Available after 6 PM on weekdays; Pune campus on Saturdays."
  );

  const [newSkillInput, setNewSkillInput] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data: profileData, isLoading: isLoadingProfile } = useAlumniProfile();
  const updateProfileMutation = useUpdateAlumniProfile();

  useEffect(() => {
    if (profileData) {
      setUser({
        fullName: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone,
        enrollmentNo: profileData.enrollmentNo,
        program: profileData.program,
        graduationYear: profileData.graduationYear,
      });
      if (profileData.organization) setOrganization(profileData.organization);
      if (profileData.designation) setDesignation(profileData.designation);
      if (profileData.industry) setIndustry(profileData.industry);
      if (profileData.linkedinUrl) setLinkedinUrl(profileData.linkedinUrl);
      if (profileData.skills && profileData.skills.length > 0) setSkills(profileData.skills);
      if (profileData.expertise && profileData.expertise.length > 0) {
        setAreasOfExpertise(profileData.expertise.join(", "));
      }
      if (profileData.availability) setAvailability(profileData.availability);
      if (profileData.preferredFormat) setPreferredFormat(profileData.preferredFormat);
      if (profileData.preferredActivities && profileData.preferredActivities.length > 0) {
        setPreferredActivities(profileData.preferredActivities);
      }
      if (profileData.areaOfInterest) setAvailabilityNotes(profileData.areaOfInterest);
    }
  }, [profileData]);

  const handleAddSkill = () => {
    const val = newSkillInput.trim();
    if (!val) return;
    if (!skills.includes(val)) {
      setSkills([...skills, val]);
    }
    setNewSkillInput("");
  };

  const handleRemoveSkill = (tagToRemove: string) => {
    setSkills(skills.filter((s) => s !== tagToRemove));
  };

  const toggleActivity = (activity: string) => {
    if (preferredActivities.includes(activity)) {
      setPreferredActivities(preferredActivities.filter((a) => a !== activity));
    } else {
      setPreferredActivities([...preferredActivities, activity]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setIsSaved(false);
    try {
      const expertiseArray = areasOfExpertise
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await updateProfileMutation.mutateAsync({
        organization,
        designation,
        industry,
        linkedinUrl,
        skills,
        expertise: expertiseArray,
        areaOfInterest: availabilityNotes,
        availability,
        preferredFormat,
        preferredActivities,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Dynamic Completeness Calculation (Figma shows 90%)
  const completeness = useMemo(() => {
    let score = 0;
    if (organization.trim()) score += 15;
    if (designation.trim()) score += 15;
    if (industry.trim()) score += 15;
    if (linkedinUrl.trim()) score += 15;
    if (skills.length > 0) score += 15;
    if (areasOfExpertise.trim()) score += 15;
    return Math.min(100, score);
  }, [organization, designation, industry, linkedinUrl, skills, areasOfExpertise]);

  const initials = (user.fullName || "Aarav Deshmukh")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Figma Persistent Sidebar */}
      <AlumniSidebar activeNav="profile" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AlumniHeader
          breadcrumbs={[
            { label: "My profile", href: "/alumni/profile" },
            { label: "Profile completion" },
          ]}
        />

        <main className="flex-1 p-6 sm:p-8 max-w-6xl w-full mx-auto space-y-6">
          {/* Header row (Figma 3314:45198) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Let us know your expertise
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                A complete profile helps the college invite you to the right activities.
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving || isLoadingProfile}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-iris hover:bg-brand-iris-hover text-white text-xs font-semibold shadow-xs transition-colors shrink-0 self-start sm:self-auto disabled:opacity-50"
            >
              {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isSaving ? "Saving..." : "Save profile"}
            </button>
          </div>

          {/* Verification Assurance Banner (Figma 3314:45198) */}
          <div className="bg-[#EEF2FF] border border-[#E0E7FF] rounded-xl p-4 sm:p-5">
            <h3 className="text-xs font-bold text-[#3730A3]">Your identity is verified</h3>
            <p className="text-xs text-[#4338CA] mt-0.5 leading-relaxed">
              Changes to name, graduation year or enrollment number require admin approval.
              Professional details can be updated directly.
            </p>
          </div>

          {/* 2-Column Responsive Layout */}
          <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT 2 COLUMNS: EDITABLE PROFILE FORMS */}
            <div className="lg:col-span-2 space-y-6">
              {/* Card 1: Professional information */}
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 space-y-5">
                <h2 className="text-sm font-bold text-slate-900">Professional information</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Organization */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">Organization *</label>
                    <input
                      type="text"
                      required
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-iris text-slate-900"
                    />
                  </div>

                  {/* Designation */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">Designation *</label>
                    <input
                      type="text"
                      required
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-iris text-slate-900"
                    />
                  </div>

                  {/* Industry */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">Industry *</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-brand-iris text-slate-900"
                    >
                      {INDUSTRY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* LinkedIn profile */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">LinkedIn profile</label>
                    <input
                      type="text"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-iris text-slate-900"
                    />
                  </div>

                  {/* Skills Chips */}
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-xs font-medium text-slate-700">Skills</label>
                    <div className="flex flex-wrap items-center gap-2 p-2 border border-slate-200 rounded-lg bg-slate-50/50 min-h-[42px]">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-white border border-slate-200 text-slate-800 shadow-2xs"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}

                      <input
                        type="text"
                        placeholder="Add skill..."
                        value={newSkillInput}
                        onChange={(e) => setNewSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                        className="flex-1 min-w-[120px] bg-transparent text-xs text-slate-900 focus:outline-none px-1"
                      />
                    </div>
                  </div>

                  {/* Areas of expertise */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">Areas of expertise</label>
                    <textarea
                      rows={2}
                      value={areasOfExpertise}
                      onChange={(e) => setAreasOfExpertise(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-iris text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: How would you like to contribute? (Figma 3314:45198) */}
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 space-y-5">
                <h2 className="text-sm font-bold text-slate-900">
                  How would you like to contribute?
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Availability */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">Availability</label>
                    <select
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-brand-iris text-slate-900"
                    >
                      {AVAILABILITY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Preferred format */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">Preferred format</label>
                    <select
                      value={preferredFormat}
                      onChange={(e) => setPreferredFormat(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-brand-iris text-slate-900"
                    >
                      {FORMAT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Preferred activities (Checkboxes) */}
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-xs font-medium text-slate-700">
                      Preferred activities
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {ACTIVITY_OPTIONS.map((act) => {
                        const checked = preferredActivities.includes(act);
                        return (
                          <label
                            key={act}
                            onClick={() => toggleActivity(act)}
                            className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 select-none"
                          >
                            <div
                              className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                                checked
                                  ? "bg-slate-900 border-slate-900 text-white"
                                  : "border-slate-300 bg-white"
                              }`}
                            >
                              {checked && <Check className="h-3 w-3 stroke-[3]" />}
                            </div>
                            <span>{act}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Availability notes */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">Availability notes</label>
                    <textarea
                      rows={2}
                      value={availabilityNotes}
                      onChange={(e) => setAvailabilityNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-iris text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Profile Saved Success State (Figma 3314:45198) */}
              {isSaved && (
                <div className="bg-[#E6F4EA] border border-[#CEEAD6] rounded-xl p-4 space-y-0.5 animate-in fade-in duration-200">
                  <h4 className="text-xs font-bold text-[#137333]">Profile saved</h4>
                  <p className="text-xs text-[#137333]">
                    Your preferences are now available to the college coordinators.
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT 1 COLUMN: YOUR ALUMNI IDENTITY CARD (Figma 3314:45198) */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 space-y-5">
                <h2 className="text-sm font-bold text-slate-900">Your alumni identity</h2>

                {/* Identity Header */}
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#E0E7FF] text-[#4338CA] flex items-center justify-center font-bold text-xs shrink-0">
                    {initials}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900 leading-tight">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-slate-500">
                      AL-0108 · {user.program || "MCA"} {user.graduationYear || 2018}
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Verified
                    </span>
                  </div>
                </div>

                {/* Contact info list */}
                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <p className="truncate">{user.email}</p>
                  <p>{user.phone}</p>
                  <p className="font-mono text-slate-500">{user.enrollmentNo}</p>
                </div>

                {/* Profile Completeness (Figma 90%) */}
                <div className="pt-3 border-t border-slate-100 space-y-1">
                  <p className="text-xs text-slate-500">Profile completeness</p>
                  <p className="text-3xl font-extrabold text-slate-900">{completeness}%</p>
                  <p className="text-xs text-slate-500 leading-relaxed pt-1">
                    Add your LinkedIn profile to help coordinators understand your professional
                    journey.
                  </p>
                </div>

                {/* Request identity change button */}
                <div className="pt-2">
                  <button
                    type="button"
                    className="w-full py-2 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    Request identity change
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Institutional Privacy Footer (Figma 3314:45198) */}
          <div className="pt-4 pb-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 border-t border-slate-200/60">
            <span>IMCC AlmaLink · MES, Pune</span>
            <span>Only your records are visible</span>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AlumniProfilePage;
