"use client";
/**
 * /profile — dedicated profile page
 * Renders the full dashboard with the Profile tab pre-selected.
 * Creates profile/index.html in the static export → GitHub Pages serves it correctly.
 */
import DashboardPage from "@/app/dashboard/page";

export default function ProfilePage() {
  return <DashboardPage initialTab="profile" />;
}
