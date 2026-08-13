"use client";
import React from "react";

/**
 * Unified empty-state component used across Dashboard, Admin, and Captain pages.
 */
export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
  compact = false,
  iconColor = "text-slate-500",
}: {
  icon: React.ElementType;
  title: string;
  message?: string;
  action?: React.ReactNode;
  compact?: boolean;
  iconColor?: string;
}) {
  if (compact) {
    return (
      <div className="py-8 text-center space-y-2">
        <Icon size={22} className={`${iconColor} mx-auto`} />
        <p className="text-white font-semibold text-sm">{title}</p>
        {message && (
          <p className="text-slate-500 text-xs max-w-xs mx-auto leading-relaxed">{message}</p>
        )}
        {action && <div className="pt-2">{action}</div>}
      </div>
    );
  }

  return (
    <div className="glass-dark rounded-2xl p-10 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-white/[0.06] flex items-center justify-center mx-auto">
        <Icon size={26} className={iconColor} />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-white font-semibold">{title}</h3>
        {message && (
          <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">{message}</p>
        )}
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
