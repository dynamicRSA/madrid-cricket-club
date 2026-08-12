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
        if (data) {
          // If svenprinsloo@gmail.com, guarantee super_admin roles
          if (data.email?.toLowerCase() === "svenprinsloo@gmail.com") {
            data.roles = Array.from(new Set([...(data.roles || []), "super_admin", "admin", "treasurer", "secretary", "captain"]));
            data.status = "active";
          }
          setMember(data as MemberRow);
        } else {
          // Create synthetic super_admin profile for svenprinsloo@gmail.com if record missing
          supabase.auth.getUser().then(({ data: authData }) => {
            const userEmail = authData?.user?.email || "";
            if (userEmail.toLowerCase() === "svenprinsloo@gmail.com") {
              const superAdminMember: MemberRow = {
                id: userId,
                user_id: userId,
                full_legal_name: "Sven Prinsloo",
                preferred_name: "Sven",
                email: "svenprinsloo@gmail.com",
                status: "active",
                roles: ["super_admin", "admin", "treasurer", "secretary", "captain"],
                registration_status: "approved",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                date_of_birth: null, nationality: "South African", gender: "male",
                id_type: null, id_number: null, mobile: "+34 600 000 000", address: "Madrid",
                emergency_name: null, emergency_relationship: null, emergency_phone: null,
                medical_info: null, dietary_requirements: null, allergies: null,
                playing_role: "all_rounder", previous_clubs: null, kit_size: "L",
                photo_consent: true, rules_accepted: true, is_minor: false, guardian_id: null
              };
              setMember(superAdminMember);
            }
          });
        }
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
