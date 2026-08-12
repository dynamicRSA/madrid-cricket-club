import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, differenceInDays, isAfter, isBefore } from "date-fns";
import { es, enUS } from "date-fns/locale";
import type { MatchResult } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Date formatting ──────────────────────────────────────────────────────────
export function formatDate(dateStr: string, locale: string = "en", fmt: string = "d MMMM yyyy") {
  try {
    return format(parseISO(dateStr), fmt, { locale: locale === "es" ? es : enUS });
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr: string, locale: string = "en") {
  return formatDate(dateStr, locale, "d MMM yyyy");
}

export function formatDateTime(dateStr: string, locale: string = "en") {
  return formatDate(dateStr, locale, "d MMM yyyy, HH:mm");
}

export function formatTime(timeStr: string) {
  return timeStr?.slice(0, 5) ?? "";
}

export function daysUntil(dateStr: string): number {
  return differenceInDays(parseISO(dateStr), new Date());
}

export function isUpcoming(dateStr: string): boolean {
  return isAfter(parseISO(dateStr), new Date());
}

export function isPast(dateStr: string): boolean {
  return isBefore(parseISO(dateStr), new Date());
}

// ─── Currency ─────────────────────────────────────────────────────────────────
export function formatEuro(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(amount);
}

// ─── Result display ───────────────────────────────────────────────────────────
export function resultLabel(result: MatchResult, locale: string = "en"): string {
  const labels: Record<MatchResult, Record<string, string>> = {
    won:       { en: "Won",       es: "Victoria" },
    lost:      { en: "Lost",      es: "Derrota" },
    draw:      { en: "Draw",      es: "Empate" },
    tied:      { en: "Tied",      es: "Empate técnico" },
    abandoned: { en: "Abandoned", es: "Abandonado" },
    no_result: { en: "No Result", es: "Sin resultado" },
  };
  return labels[result]?.[locale] ?? result;
}

export function resultClass(result: MatchResult): string {
  switch (result) {
    case "won":  return "result-won";
    case "lost": return "result-lost";
    case "draw":
    case "tied": return "result-draw";
    default:     return "result-nr";
  }
}

// ─── Availability ─────────────────────────────────────────────────────────────
export function availabilityLabel(status: string, locale: string = "en") {
  const map: Record<string, Record<string, string>> = {
    available:     { en: "Available",     es: "Disponible" },
    not_available: { en: "Not available", es: "No disponible" },
    maybe:         { en: "Maybe",         es: "Quizás" },
    no_response:   { en: "No response",   es: "Sin respuesta" },
  };
  return map[status]?.[locale] ?? status;
}

// ─── Strings ──────────────────────────────────────────────────────────────────
export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + "…" : str;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ─── Membership ───────────────────────────────────────────────────────────────
export function memberStatusLabel(status: string, locale: string = "en"): string {
  const map: Record<string, Record<string, string>> = {
    enquiry:                     { en: "Enquiry",             es: "Consulta" },
    application_in_progress:     { en: "Applying",            es: "Solicitando" },
    submitted:                   { en: "Submitted",           es: "Enviado" },
    approved_awaiting_payment:   { en: "Awaiting payment",    es: "Pendiente de pago" },
    active:                      { en: "Active",              es: "Activo" },
    expiring_soon:               { en: "Expiring soon",       es: "Por vencer" },
    expired:                     { en: "Expired",             es: "Vencido" },
    lapsed:                      { en: "Lapsed",              es: "Caducado" },
    rejected:                    { en: "Rejected",            es: "Rechazado" },
    withdrawn:                   { en: "Withdrawn",           es: "Retirado" },
    suspended:                   { en: "Suspended",           es: "Suspendido" },
  };
  return map[status]?.[locale] ?? status;
}

export function memberStatusColor(status: string): string {
  switch (status) {
    case "active":                    return "badge-green";
    case "expiring_soon":             return "badge-gold";
    case "approved_awaiting_payment": return "badge-gold";
    case "rejected":
    case "suspended":
    case "expired":
    case "lapsed":                    return "badge-red";
    default:                          return "badge-slate";
  }
}
