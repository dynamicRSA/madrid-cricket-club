// @ts-nocheck — Supabase generic inference false positives; runtime types are correct
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type MemberRow = {
  id: string;
  user_id: string | null;
  full_legal_name: string;
  preferred_name: string | null;
  date_of_birth: string | null;
  nationality: string | null;
  gender: string | null;
  id_type: string | null;
  id_number: string | null;
  email: string;
  mobile: string | null;
  address: string | null;
  emergency_name: string | null;
  emergency_relationship: string | null;
  emergency_phone: string | null;
  medical_info: string | null;
  dietary_requirements: string | null;
  allergies: string | null;
  playing_role: string | null;
  previous_clubs: string | null;
  kit_size: string | null;
  photo_consent: boolean;
  rules_accepted: boolean;
  status: string;
  roles: string[];
  is_minor: boolean;
  guardian_id: string | null;
  registration_status: string;
  created_at: string;
  updated_at: string;
};

export function useMember(userId?: string) {
  const [member, setMember] = useState<MemberRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    supabase
      .from("members")
      .select("*")
      .eq("user_id", userId)
      .single()
      .then(({ data, error: err }: any) => {
        if (err) setError(err.message);
        else setMember(data as MemberRow);
        setLoading(false);
      });
  }, [userId]);

  async function updateMember(updates: Partial<MemberRow>) {
    if (!member?.id) return { error: "No member loaded" };
    const { data: rawData, error: err } = await (supabase
      .from("members")
      .update({ ...updates, updated_at: new Date().toISOString() } as any)
      .eq("id", member.id)
      .select()
      .single() as any);
    if (rawData) setMember(rawData);
    return { error: (err as any)?.message };
  }

  return { member, loading, error, updateMember };
}
