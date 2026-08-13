// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, CheckCheck, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const TYPE_ICONS: Record<string, string> = {
  fixture_created:       "🏏",
  selected_for_team:     "✅",
  selection_published:   "📋",
  availability_reminder: "⏰",
  match_reminder:        "🔔",
  status_change:         "👤",
  charge_raised:         "💳",
  jersey_assigned:       "👕",
};

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell({ memberId }: { memberId: string }) {
  const [open, setOpen]                   = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]             = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // ── Load + realtime ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!memberId) return;
    setLoading(true);
    supabase
      .from("notifications")
      .select("*")
      .eq("member_id", memberId)
      .order("created_at", { ascending: false })
      .limit(30)
      .then(({ data }) => {
        setNotifications(data || []);
        setLoading(false);
      });

    const channel = supabase
      .channel(`notifs_${memberId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `member_id=eq.${memberId}` },
        (payload) => setNotifications((prev) => [payload.new as Notification, ...prev])
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [memberId]);

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  async function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  }

  async function markAllRead() {
    const ids = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (!ids.length) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await supabase.from("notifications").update({ is_read: true }).in("id", ids);
  }

  function timeAgo(ts: string) {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative btn-outline btn-sm px-2.5"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center px-0.5 shadow-glow-green">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-white/[0.08] shadow-2xl z-50 overflow-hidden"
          style={{ background: "#0d1420" }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <span className="text-sm font-semibold text-white">
              Notifications {unreadCount > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-[10px]">{unreadCount} new</span>}
            </span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-[11px] text-brand-400 hover:text-brand-300 flex items-center gap-1">
                  <CheckCheck size={12} /> All read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white p-1">
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-brand-400" /></div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10">
                <Bell size={28} className="mx-auto mb-2 text-slate-600" />
                <p className="text-slate-500 text-xs">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`w-full text-left px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors flex gap-3 items-start ${!n.is_read ? "bg-brand-500/5" : ""}`}
                >
                  <span className="text-base leading-none mt-0.5 flex-shrink-0">{TYPE_ICONS[n.type] || "📬"}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${!n.is_read ? "text-white" : "text-slate-300"}`}>{n.title}</p>
                    {n.body && <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>}
                    <p className="text-[10px] text-slate-600 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0 mt-2" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
