import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getDefaultWorkspaceId } from "../../../lib/config";
import { runInternalOrchestrator } from "../../../lib/orchestrator";
import {
  generateDefaultSlots,
  formatSlotsText,
} from "../../../lib/scheduling";
import {
  parseWhatsAppIncoming,
  sendWhatsAppText,
} from "../../../lib/whatsapp";

// GET /api/whatsapp/webhook
// Used by Meta (WhatsApp Cloud API) to verify the webhook URL.
// Meta will call this with:
//   ?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const verifyToken = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && verifyToken && challenge) {
    if (verifyToken === expectedToken) {
      // ✅ Verification OK → respond with the challenge as plain text
      return new Response(challenge, {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    } else {
      // ❌ Wrong verify token
      return NextResponse.json(
        { error: "Invalid verify token." },
        { status: 403 },
      );
    }
  }

  return NextResponse.json(
    {
      message:
        "WhatsApp webhook endpoint (GET) is alive, but parameters are missing.",
    },
    { status: 200 },
  );
}

// POST /api/whatsapp/webhook
// Handles incoming WhatsApp messages, runs orchestrator + slots,
// stores conversation/message in DB, and tries to send a reply.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    console.log("WHATSAPP_WEBHOOK_POST_BODY", JSON.stringify(body, null, 2));

    const parsed = parseWhatsAppIncoming(body);
    if (!parsed) {
      console.log("No valid text message found in WhatsApp payload.");
      // Always return 200 so Meta considers the webhook healthy
      return NextResponse.json({ status: "ignored" }, { status: 200 });
    }

    const workspaceId = getDefaultWorkspaceId();

    // Load workspace to get timezone
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });
    const timezone = workspace?.timezone || "Asia/Dubai";

    const phone = parsed.waId;

    // Find or create lead for this phone in this workspace
    let lead = await prisma.lead.findFirst({
      where: {
        workspaceId,
        phone,
      },
    });

    if (!lead) {
      let firstName: string | undefined = undefined;
      let lastName: string | undefined = undefined;

      if (parsed.name) {
        const parts = parsed.name.split(" ");
        firstName = parts[0];
        lastName = parts.slice(1).join(" ") || undefined;
      }

      lead = await prisma.lead.create({
        data: {
          workspaceId,
          phone,
          firstName: firstName ?? null,
          lastName: lastName ?? null,
          source: "WHATSAPP",
        },
      });
    }

    // Find or create conversation for this phone
    let conversation = await prisma.conversation.findFirst({
      where: {
        workspaceId,
        channel: "WHATSAPP",
        externalId: phone,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          workspaceId,
          channel: "WHATSAPP",
          externalId: phone,
          leadId: lead.id,
        },
      });
    } else if (!conversation.leadId) {
      // Ensure the conversation is linked to this lead
      conversation = await prisma.conversation.update({
        where: { id: conversation.id },
        data: { leadId: lead.id },
      });
    }

    // Run orchestrator (language + flow + base reply with upsell)
    const orchestration = await runInternalOrchestrator(parsed.text);

    // Generate default slots and format according to language + timezone
    const slots = generateDefaultSlots(timezone);
    const slotsText = formatSlotsText(
      orchestration.language,
      slots,
      timezone,
    );

    const fullReply = [orchestration.reply, "", slotsText]
      .filter(Boolean)
      .join("\n");

    // Update conversation metadata
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        language: orchestration.language,
        lastInboundAt: new Date(),
      },
    });

    // Store inbound message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        direction: "INBOUND",
        text: parsed.text,
        waMessageId: parsed.waMessageId,
        rawPayload: body as any,
      },
    });

    // Try to send WhatsApp reply
    let outboundWaMessageId: string | undefined = undefined;
    try {
      const waResponse = await sendWhatsAppText(phone, fullReply);
      outboundWaMessageId = waResponse?.messages?.[0]?.id;
    } catch (sendError: any) {
      console.error("WHATSAPP_SEND_ERROR", sendError);

      // Create notification for the garage
      await prisma.notification.create({
        data: {
          workspaceId,
          leadId: lead.id,
          type: "WHATSAPP_SEND_FAILED",
          message:
            "WhatsApp send failed for lead " +
            (lead.firstName ?? "") +
            " " +
            (lead.lastName ?? "") +
            " (" +
            phone +
            ").",
          status: "NEW",
        },
      });
    }

    // Store outbound message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        direction: "OUTBOUND",
        text: fullReply,
        waMessageId: outboundWaMessageId ?? null,
      },
    });

    // Always return 200 so Meta sees this webhook as healthy
    return NextResponse.json({ status: "processed" }, { status: 200 });
  } catch (error) {
    console.error("WHATSAPP_WEBHOOK_POST_ERROR", error);
    // Still return 200 with generic status for Meta
    return NextResponse.json(
      { status: "error", detail: "Server error while processing webhook." },
      { status: 200 },
    );
  }
}
