"use client";

import React from "react";

interface ProgressBarProps {
  currentStep: number; // 1-4
  totalSteps?: number;
}

const STEP_LABELS = ["Color", "Stickers", "Songs", "Note"];

export default function ProgressBar({ currentStep, totalSteps = 4 }: ProgressBarProps) {
  return (
    <div className="flex items-center justify-center gap-0 w-full mb-8 select-none">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const stepNum = i + 1;
        const isDone = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <React.Fragment key={stepNum}>
            {/* Step circle */}
            <div className="flex flex-col items-center gap-1">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300"
                style={{
                  borderColor: isDone
                    ? "#4caf50"
                    : isActive
                    ? "#111111"
                    : "#cccccc",
                  backgroundColor: isDone
                    ? "#4caf50"
                    : isActive
                    ? "#111111"
                    : "transparent",
                  color: isDone || isActive ? "#ffffff" : "#cccccc",
                }}
              >
                {isDone ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2.5 7L5.5 10L11.5 4"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span className="text-xs font-bold" style={{ fontFamily: "var(--font-space-mono)" }}>
                    {stepNum}
                  </span>
                )}
              </div>
              <span
                className="text-[10px] tracking-wide uppercase"
                style={{
                  fontFamily: "var(--font-space-mono)",
                  color: isDone ? "#4caf50" : isActive ? "#111111" : "#bbbbbb",
                }}
              >
                {STEP_LABELS[i]}
              </span>
            </div>

            {/* Connector line */}
            {i < totalSteps - 1 && (
              <div
                className="h-0.5 flex-1 mx-2 transition-all duration-500"
                style={{
                  backgroundColor: isDone ? "#4caf50" : "#dddddd",
                  maxWidth: 48,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
