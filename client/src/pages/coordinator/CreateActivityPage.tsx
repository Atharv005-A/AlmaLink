/**
 * CreateActivityPage.tsx
 * -------------------------------------------------
 * Figma Reference: 3314:45877
 * Route: /coordinator/activities/create
 *
 * The "Add Event" form page — ONLY accessible by CELL_COORDINATOR role.
 * (Server route is also guarded by requireRole(Role.CELL_COORDINATOR))
 *
 * Form fields (matches Figma design + createActivitySchema from shared/):
 *   1. Event Title
 *   2. Activity Category (dropdown — real IMCC categories from API)
 *   3. Description
 *   4. Start Date & Time
 *   5. End Date & Time
 *   6. Venue (physical location name)
 *   7. Online Meeting URL (optional — for virtual events)
 *   8. Required Alumni Expertise (chip tag input — press Enter to add)
 *   9. Points Weight (how many contribution points alumni earn)
 *
 * On Submit: Creates the activity as DRAFT, then redirects to the list.
 * The coordinator can then Publish it from the list page.
 * -------------------------------------------------
 */

import React, { useState, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, X, Plus, Loader2, GraduationCap } from "lucide-react";

import { createActivitySchema, CreateActivityInput } from "@almalink/shared";
import { useCreateActivity, useActivityCategories } from "@/api/activities.api";
import { cn } from "@/lib/utils";

// Mock session — replace with useAuth() when AuthContext is ready
const MOCK_SESSION = {
  userId: 1,
  role: "CELL_COORDINATOR" as const,
  cellId: 1,
  cellName: "Training & Placement Cell",
};

// ─── Expertise Tag Input (chip-style) ─────────────────────────────────────────
/**
 * TagInput lets coordinators type a skill/expertise tag and press Enter to add it.
 * Each tag renders as a removable chip — same pattern as skills tags on alumni profiles.
 *
 * Example tags: "React", "Machine Learning", "Cloud Architecture", "Hackathon Judging"
 */
interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({
  tags,
  onChange,
  placeholder = "Type a skill and press Enter…",
}) => {
  const [inputValue, setInputValue] = useState("");

  const addTag = () => {
    const trimmed = inputValue.trim();
    // Don't add empty or duplicate tags
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue("");
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission on Enter inside tag input
      addTag();
    }
    // Backspace on empty input removes the last tag (intuitive UX)
    if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className="min-h-[42px] flex flex-wrap gap-1.5 items-center border border-slate-200 rounded-xl px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-brand-iris/30 focus-within:border-brand-iris transition-all">
      {/* Render existing tags as chips */}
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-brand-iris/10 text-brand-iris text-xs font-semibold rounded-full"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="hover:text-brand-iris/60 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      {/* Text input for new tags */}
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag} // Also add on blur so coordinator doesn't have to press Enter
        placeholder={tags.length === 0 ? placeholder : "Add more…"}
        className="flex-1 min-w-[140px] outline-none text-sm text-slate-700 placeholder:text-slate-400 bg-transparent"
      />
    </div>
  );
};

// ─── Reusable form field wrapper ───────────────────────────────────────────────
const Field: React.FC<{
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}> = ({ label, hint, error, required, children }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-slate-700">
      {label}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
    {children}
    {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
  </div>
);

// ─── Reusable text input style ─────────────────────────────────────────────────
const inputClass = cn(
  "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900",
  "placeholder:text-slate-400 bg-white",
  "focus:outline-none focus:ring-2 focus:ring-brand-iris/30 focus:border-brand-iris",
  "transition-all"
);

// ─── Main Page Component ───────────────────────────────────────────────────────
export const CreateActivityPage: React.FC = () => {
  const navigate = useNavigate();
  const session = MOCK_SESSION;

  // ── Fetch real activity categories for the dropdown ──
  const { data: categories = [], isLoading: loadingCategories } = useActivityCategories();

  // ── Mutation hook for creating the activity ──
  const { mutate: createActivity, isPending: isCreating } = useCreateActivity();

  // ── React Hook Form setup with Zod validation ──
  // zodResolver connects Zod schema to React Hook Form automatically
  // Any field that fails Zod validation shows an error without manual checks
  const {
    register, // Connects <input> fields to the form
    control, // For custom components (Controller) like TagInput
    handleSubmit, // Wraps onSubmit with validation
    formState: { errors }, // Contains per-field error messages
  } = useForm<CreateActivityInput>({
    resolver: zodResolver(createActivitySchema),
    defaultValues: {
      cellId: session.cellId,
      pointsWeight: 10,
      requiredExpertise: [],
    },
  });

  // ── Form submit handler ──
  const onSubmit = (data: CreateActivityInput) => {
    createActivity(data, {
      onSuccess: () => {
        // After creation, go back to the activities list
        navigate("/coordinator/activities");
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Add New Event</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {session.cellName} · Activity will be saved as Draft
            </p>
          </div>
        </div>
      </div>

      {/* ── Form ──────────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Hidden: cellId is auto-set from session, not user-editable */}
          <input type="hidden" {...register("cellId", { valueAsNumber: true })} />

          {/* ── Card: Basic Details ────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-brand-iris" />
              Event Details
            </h2>

            {/* Event Title */}
            <Field label="Event Title" required error={errors.title?.message}>
              <input
                {...register("title")}
                placeholder="e.g., Guest Lecture on Cloud Architecture"
                className={cn(inputClass, errors.title && "border-rose-300 focus:ring-rose-300")}
              />
            </Field>

            {/* Activity Category */}
            <Field
              label="Event Category"
              required
              error={errors.categoryId?.message}
              hint="Select the type of activity from real IMCC event categories"
            >
              <select
                {...register("categoryId", { valueAsNumber: true })}
                className={cn(inputClass, errors.categoryId && "border-rose-300")}
                disabled={loadingCategories}
              >
                <option value="">
                  Select an event category (e.g. Guest Lecture, Hackathon, Mock Interview)
                </option>
                {categories.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </Field>

            {/* Description */}
            <Field
              label="Description"
              required
              error={errors.description?.message}
              hint="Describe the activity, its objectives, and what alumni participants will do"
            >
              <textarea
                {...register("description")}
                rows={4}
                placeholder="e.g., Mr. Vaishnav Kedar from Wipro will conduct a live session on AWS architecture patterns, cloud-native deployments, and cost optimisation strategies…"
                className={cn(inputClass, "resize-none", errors.description && "border-rose-300")}
              />
            </Field>
          </div>

          {/* ── Card: Date & Location ───────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
            <h2 className="text-base font-semibold text-slate-900">📅 Date, Time & Location</h2>

            {/* Start & End Date side-by-side on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Start Date & Time" required error={errors.startAt?.message}>
                <input
                  type="datetime-local"
                  {...register("startAt")}
                  className={cn(inputClass, errors.startAt && "border-rose-300")}
                />
              </Field>
              <Field label="End Date & Time" required error={errors.endAt?.message}>
                <input
                  type="datetime-local"
                  {...register("endAt")}
                  className={cn(inputClass, errors.endAt && "border-rose-300")}
                />
              </Field>
            </div>

            {/* Venue */}
            <Field
              label="Venue"
              required
              error={errors.venue?.message}
              hint="Physical location name, e.g., MES IMCC Seminar Hall, Pune"
            >
              <input
                {...register("venue")}
                placeholder="e.g., MES IMCC Seminar Hall, 2nd Floor"
                className={cn(inputClass, errors.venue && "border-rose-300")}
              />
            </Field>

            {/* Online Meeting URL (optional) */}
            <Field
              label="Online Meeting URL"
              error={errors.meetingLink?.message}
              hint="Optional — add a Google Meet / Zoom / Teams link for virtual or hybrid events"
            >
              <input
                {...register("meetingLink")}
                type="url"
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                className={cn(inputClass, errors.meetingLink && "border-rose-300")}
              />
            </Field>
          </div>

          {/* ── Card: Alumni Requirements ──────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
            <h2 className="text-base font-semibold text-slate-900">
              🎯 Alumni Requirements & Points
            </h2>

            {/* Required Expertise Tags */}
            <Field
              label="Required Alumni Expertise / Skills"
              required
              error={errors.requiredExpertise?.message as string}
              hint="These tags are used by the Smart Matchmaking engine to recommend matching alumni. Press Enter after each tag."
            >
              {/*
               * Controller wraps TagInput because it's a custom component
               * (not a standard HTML input), so React Hook Form needs
               * the Controller bridge to manage its value.
               */}
              <Controller
                name="requiredExpertise"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <TagInput
                      tags={field.value ?? []}
                      onChange={field.onChange}
                      placeholder='e.g., "React", "Cloud Architecture", "Machine Learning"'
                    />
                    {/* Suggested tags for quick selection */}
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-xs text-slate-400">Quick add:</span>
                      {[
                        "React",
                        "Python",
                        "Machine Learning",
                        "Cloud Architecture",
                        "Data Analytics",
                        "DevOps",
                        "Finance",
                        "HR Strategy",
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => {
                            const current = field.value || [];
                            if (!current.includes(suggestion)) {
                              field.onChange([...current, suggestion]);
                            }
                          }}
                          className="text-xs px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-600 hover:border-brand-iris hover:text-brand-iris hover:bg-brand-iris/5 transition-colors cursor-pointer"
                        >
                          + {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              />
            </Field>

            {/* Points Weight */}
            <Field
              label="Contribution Points"
              required
              error={errors.pointsWeight?.message}
              hint="How many points alumni earn for participating. Default: 10 pts. (Guest Lecture = 20 pts, Hackathon Judge = 15 pts)"
            >
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={100}
                  {...register("pointsWeight", { valueAsNumber: true })}
                  className={cn(inputClass, "w-28", errors.pointsWeight && "border-rose-300")}
                />
                <span className="text-sm text-slate-500">points</span>
              </div>
            </Field>
          </div>

          {/* ── Submit Actions ─────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3 pb-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className={cn(
                "flex-1 sm:flex-none flex items-center justify-center gap-2",
                "px-6 py-2.5 rounded-xl bg-brand-iris text-white text-sm font-semibold",
                "hover:bg-brand-iris/90 active:scale-95 transition-all",
                "shadow-sm shadow-brand-iris/30",
                "disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
              )}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Event…
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Save as Draft
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
