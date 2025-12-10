export type ParsedWhatsAppMessage = {
  waId: string; // full WhatsApp ID, ex: "971500000000"
  from: string; // same as waId for MVP
  name: string | null;
  text: string;
  waMessageId: string;
};

/**
 * Parse the incoming WhatsApp Cloud API webhook body
 * and extract a single text message.
 *
 * Returns null if the payload is not a text message.
 */
export function parseWhatsAppIncoming(body: any): ParsedWhatsAppMessage | null {
  try {
    if (!body || body.object !== "whatsapp_business_account") {
      return null;
    }

    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    const contacts = value?.contacts;
    const messages = value?.messages;

    if (!contacts || !contacts[0] || !messages || !messages[0]) {
      return null;
    }

    const contact = contacts[0];
    const msg = messages[0];

    if (msg.type !== "text" || !msg.text?.body) {
      // MVP: text-only
      return null;
    }

    const waId = contact.wa_id as string;
    const name = (contact.profile && contact.profile.name) || null;
    const text = msg.text.body as string;
    const waMessageId = msg.id as string;

    if (!waId || !text) {
      return null;
    }

    return {
      waId,
      from: waId,
      name,
      text,
      waMessageId,
    };
  } catch (e) {
    console.error("parseWhatsAppIncoming error", e);
    return null;
  }
}

/**
 * Send a text message via WhatsApp Cloud API.
 *
 * Uses:
 * - WHATSAPP_PHONE_NUMBER_ID
 * - WHATSAPP_ACCESS_TOKEN
 *
 * Returns the JSON response from Meta, or throws on error.
 */
export async function sendWhatsAppText(to: string, text: string) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !token) {
    throw new Error(
      "Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN in environment.",
    );
  }

  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: {
      body: text,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    console.error("WhatsApp API error", data);
    throw new Error("WhatsApp API error: " + JSON.stringify(data));
  }

  return data;
}
