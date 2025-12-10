export type GeneratedSlot = {
  startIso: string;
  endIso: string;
  label: string;
};

export type SlotLanguage = "en" | "fr" | "ar";

/**
 * Generate 3 default 30-minute slots on the next 3 days
 * for the given timezone.
 *
 * Day 1 → 10:00
 * Day 2 → 14:00
 * Day 3 → 17:00
 * (all local time)
 */
export function generateDefaultSlots(timezone: string): GeneratedSlot[] {
  const now = new Date();
  const slots: GeneratedSlot[] = [];
  const hours = [10, 14, 17];
  const durationMinutes = 30;

  const tz = timezone || "Asia/Dubai";

  for (let dayOffset = 1; dayOffset <= 3; dayOffset++) {
    const start = new Date(now.getTime());
    start.setDate(start.getDate() + dayOffset);
    const hour = hours[dayOffset - 1] ?? hours[0];
    start.setHours(hour, 0, 0, 0);

    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

    // Generic label, precise formatting will be done in formatSlotsText
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const label = formatter.format(start);

    slots.push({
      startIso: start.toISOString(),
      endIso: end.toISOString(),
      label,
    });
  }

  return slots;
}

/**
 * Build a human-readable text with the 3 slots,
 * adapted to the customer's language and timezone.
 *
 * EN + AR → 12h format (AM/PM)
 * FR      → 24h format
 *
 * Includes the "option prioritaire" clause required by the spec.
 */
export function formatSlotsText(
  language: SlotLanguage,
  slots: GeneratedSlot[],
  timezone?: string,
): string {
  if (!slots || slots.length === 0) {
    return "";
  }

  const tz = timezone || "Asia/Dubai";

  const locale =
    language === "fr" ? "fr-FR" : language === "ar" ? "ar-AE" : "en-US";

  const use12h = language === "en" || language === "ar";

  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone: tz,
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: use12h,
  });

  const bulletList = slots
    .map((s) => {
      const d = new Date(s.startIso);
      return `- ${formatter.format(d)}`;
    })
    .join("\n");

  if (language === "fr") {
    return [
      "Voici 3 créneaux proposés sur les prochains jours (heure locale) :",
      bulletList,
      "Si aucun de ces créneaux ne vous convient, je peux demander une option prioritaire à notre équipe.",
    ].join("\n");
  }

  if (language === "ar") {
    return [
      "هذه 3 أوقات متاحة في الأيام القادمة (حسب توقيت المركز):",
      bulletList,
      "إذا لم تناسبك أي من هذه الأوقات، يمكنني طلب خيار أولوية من فريقنا.",
    ].join("\n");
  }

  // English (default)
  return [
    "Here are 3 suggested slots over the next days (local time):",
    bulletList,
    "If none of these slots work for you, I can ask our team for a priority option.",
  ].join("\n");
}
