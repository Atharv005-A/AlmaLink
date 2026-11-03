import React from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
}) => {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const criteriaMet = [hasMinLength, hasUppercase, hasNumber].filter(Boolean).length;

  const getStrengthBar = () => {
    if (!password) return { width: "0%", color: "bg-slate-200" };
    if (criteriaMet === 1) return { width: "33%", color: "bg-rose-500" };
    if (criteriaMet === 2) return { width: "66%", color: "bg-amber-500" };
    return { width: "100%", color: "bg-emerald-500" };
  };

  const strength = getStrengthBar();

  return (
    <div className="space-y-2 pt-1">
      {/* Strength Bar */}
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${strength.color}`}
          style={{ width: strength.width }}
        />
      </div>

      {/* Criteria Checklist */}
      <div className="grid grid-cols-1 gap-1 text-xs text-slate-500 pt-1">
        <div className="flex items-center gap-1.5">
          {hasMinLength ? (
            <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          ) : (
            <X className="h-3.5 w-3.5 text-slate-300 shrink-0" />
          )}
          <span className={hasMinLength ? "text-emerald-700 font-medium" : ""}>
            At least 8 characters
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {hasUppercase ? (
            <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          ) : (
            <X className="h-3.5 w-3.5 text-slate-300 shrink-0" />
          )}
          <span className={hasUppercase ? "text-emerald-700 font-medium" : ""}>
            At least one uppercase letter (A-Z)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {hasNumber ? (
            <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          ) : (
            <X className="h-3.5 w-3.5 text-slate-300 shrink-0" />
          )}
          <span className={hasNumber ? "text-emerald-700 font-medium" : ""}>
            At least one number (0-9)
          </span>
        </div>
      </div>
    </div>
  );
};

