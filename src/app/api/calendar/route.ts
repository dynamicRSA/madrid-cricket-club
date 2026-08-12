import { EVENTS } from "@/lib/mock-data";

function escapeICS(str: string) {
  return str.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function formatICSDate(dateStr: string, timeStr?: string): string {
  const d = new Date(dateStr + (timeStr ? `T${timeStr}:00` : "T00:00:00"));
  if (timeStr) {
    return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  }
  return dateStr.replace(/-/g, "");
}

export const dynamic = "force-static";

export async function GET() {
  const events = EVENTS.filter((e) => e.status === "scheduled" || e.status === "completed");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Madrid Cricket Club//MCC Website//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Madrid Cricket Club",
    "X-WR-CALDESC:Fixtures and events for Madrid Cricket Club",
    "X-WR-TIMEZONE:Europe/Madrid",
  ];

  for (const event of events) {
    const dtstart = formatICSDate(event.date, event.start_time);
    const dtend = formatICSDate(event.end_date || event.date, event.start_time);
    const summary = escapeICS(event.title);
    const location = event.venue ? escapeICS(event.venue.name) : "";
    const description = [
      event.opponent ? `vs ${event.opponent}` : "",
      event.competition || "",
      event.notes || "",
    ].filter(Boolean).join("\\n");

    const vevent = [
      "BEGIN:VEVENT",
      `UID:${event.id}@madridcricketclub.es`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      `SUMMARY:${summary}`,
      location ? `LOCATION:${location}` : null,
      description ? `DESCRIPTION:${escapeICS(description)}` : null,
      `STATUS:${event.status === "cancelled" ? "CANCELLED" : "CONFIRMED"}`,
      "END:VEVENT",
    ].filter((l): l is string => Boolean(l));
    vevent.forEach((l) => lines.push(l));
  }

  lines.push("END:VCALENDAR");

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="madrid-cricket-club.ics"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
