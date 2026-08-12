// @ts-nocheck — Supabase generic inference false positives; runtime types are correct
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type ChargeRow = {
  id: string;
  event_id: string | null;
  member_id: string;
  type: string;
  amount_euros: number;
  description: string | null;
  status: string;
  raised_at: string;
  settled_at: string | null;
  raised_by: string | null;
};

type DeclarationRow = {
  id: string;
  charge_id: string;
  member_id: string;
  amount_euros: number;
  method: string;
  declared_at: string;
  reference: string | null;
  note: string | null;
  confirmed_by: string | null;
  confirmed_at: string | null;
  status: string;
};

export interface ChargeWithDeclarations extends ChargeRow {
  declarations: DeclarationRow[];
}

export function useCharges(memberId?: string) {
  const [charges, setCharges] = useState<ChargeWithDeclarations[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!memberId) { setLoading(false); return; }

    // Fetch charges and declarations together
    Promise.all([
      supabase.from("charges").select("*").eq("member_id", memberId).order("raised_at", { ascending: false }),
      supabase.from("payment_declarations").select("*").eq("member_id", memberId),
    ]).then(([chargesRes, declRes]) => {
      const chargeList = ((chargesRes as any).data || []) as ChargeRow[];
      const declarations = ((declRes as any).data || []) as DeclarationRow[];
      const combined: ChargeWithDeclarations[] = chargeList.map((c) => ({
        ...c,
        declarations: declarations.filter((d) => d.charge_id === c.id),
      }));
      setCharges(combined);
      setLoading(false);
    });
  }, [memberId]);

  async function declarePayment(chargeId: string, amount: number, method: string, reference?: string, note?: string) {
    if (!memberId) return;

    const { data, error } = await (supabase
      .from("payment_declarations")
      .insert({
        charge_id: chargeId,
        member_id: memberId,
        amount_euros: amount,
        method,
        reference: reference || null,
        note: note || null,
        status: "pending",
      } as any)
      .select()
      .single() as any);

    if (data) {
      await (supabase.from("charges").update({ status: "declared_paid" } as any).eq("id", chargeId) as any);
      setCharges((prev: ChargeWithDeclarations[]) =>
        prev.map((c: ChargeWithDeclarations) => {
          if (c.id !== chargeId) return c;
          return {
            ...c,
            status: "declared_paid",
            declarations: [...(c.declarations as any[]), data as DeclarationRow],
          };
        })
      );
    }
    return { error };
  }

  const totalOutstanding = charges
    .filter((c) => ["raised", "declared_paid", "partially_paid"].includes(c.status))
    .reduce((sum, c) => sum + c.amount_euros, 0);

  return { charges, loading, declarePayment, totalOutstanding };
}
