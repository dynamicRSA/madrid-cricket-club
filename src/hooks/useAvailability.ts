"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export type AvailabilityStatus = "available" | "not_available" | "maybe";

export interface EventAvailability {
  event_id: string;
  status: AvailabilityStatus | null;
  note: string | null;
  lift_status: string | null;
}

export function useAvailability(memberId?: string) {
  const [availability, setAvailability] = useState<EventAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!memberId) { setLoading(false); return; }
    supabase
      .from("availability")
      .select("event_id, status, note, lift_status")
      .eq("member_id", memberId)
      .then(({ data }) => {
        setAvailability(data as EventAvailability[] || []);
        setLoading(false);
      });
  }, [memberId]);

  async function setEventAvailability(
    eventId: string,
    status: AvailabilityStatus,
    options?: { note?: string; liftStatus?: string }
  ) {
    if (!memberId) return;

    const record = {
      event_id: eventId,
      member_id: memberId,
      status,
      note: options?.note || null,
      lift_status: options?.liftStatus || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await (supabase
      .from("availability")
      .upsert(record as any, { onConflict: "event_id,member_id" })
      .select("event_id, status, note, lift_status")
      .single() as any);

    if (data) {
      setAvailability((prev) =>
        prev.some((a) => a.event_id === eventId)
          ? prev.map((a) => (a.event_id === eventId ? (data as EventAvailability) : a))
          : [...prev, data as EventAvailability]
      );
    }
    return { error };
  }

  function getStatus(eventId: string): AvailabilityStatus | null {
    return availability.find((a) => a.event_id === eventId)?.status ?? null;
  }

  return { availability, loading, setEventAvailability, getStatus };
}
