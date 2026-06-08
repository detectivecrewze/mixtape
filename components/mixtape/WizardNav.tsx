"use client";

import React from "react";

interface WizardNavProps {
  step: number;
  totalSteps?: number;
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  isLastStep?: boolean;
  isLoading?: boolean;
}

export default function WizardNav({
  step,
  onBack,
  onNext,
  nextDisabled = false,
  isLastStep = false,
  isLoading = false,
}: WizardNavProps) {
  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-black/10">
      {/* Back button — hidden on step 1 */}
      {step > 1 ? (
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 rounded-full border-2 border-black text-sm font-semibold tracking-widest uppercase transition-all hover:bg-black hover:text-white active:scale-95"
          style={{ fontFamily: "var(--font-space-mono)", minWidth: 100 }}
        >
          Back
        </button>
      ) : (
        <div /> // spacer
      )}

      {/* Next / Finish button */}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled || isLoading}
        className="px-6 py-2.5 rounded-full text-sm font-semibold tracking-widest uppercase transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          fontFamily: "var(--font-space-mono)",
          minWidth: 120,
          backgroundColor: "#111111",
          color: "#ffffff",
        }}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Saving...
          </span>
        ) : isLastStep ? (
          "Finish ✓"
        ) : (
          "Next →"
        )}
      </button>
    </div>
  );
}
