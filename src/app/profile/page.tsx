"use client";
/**
 * /profile — redirects to /dashboard with the Profile tab pre-selected.
 * Using a redirect is far more reliable than re-importing DashboardPage,
 * which causes Next.js static export bundling issues.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("dashboardTab", "profile");
    }
    router.replace("/dashboard");
  }, [router]);

  // Brief loading state while redirect fires
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d1420",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: "12px",
    }}>
      <div style={{
        width: "36px",
        height: "36px",
        border: "3px solid rgba(204,0,0,0.3)",
        borderTopColor: "#cc0000",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ color: "#475569", fontSize: "13px" }}>Loading profile…</p>
    </div>
  );
}
