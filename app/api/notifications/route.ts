import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { getDefaultWorkspaceId } from "../../lib/config";

// Allowed notification types from your Prisma enum
const ALLOWED_TYPES = [
  "WHATSAPP_SEND_FAILED",
  "REMINDER_OUT_OF_WINDOW",
  "SYSTEM",
] as const;
type AllowedType = (typeof ALLOWED_TYPES)[number];

// GET /api/notifications?status=NEW|READ (optional)
// → list notifications for the default workspace
export async function GET(req: Request) {
  try {
    const workspaceId = getDefaultWorkspaceId();
    const { searchParams } = new URL(req.url);

    const statusParam = searchParams.get("status");
    const where: any = { workspaceId };

    if (statusParam === "NEW" || statusParam === "READ") {
      where.status = statusParam;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        lead: true,
      },
    });

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error) {
    console.error("NOTIFICATIONS_GET_ERROR", error);
    return NextResponse.json(
      { error: "Server error while fetching notifications." },
      { status: 500 },
    );
  }
}

// POST /api/notifications
// Body: { type: "WHATSAPP_SEND_FAILED" | "REMINDER_OUT_OF_WINDOW" | "SYSTEM", message: string, leadId?: string }
// → create a notification (useful now for tests, later by system events)
export async function POST(req: Request) {
  try {
    const workspaceId = getDefaultWorkspaceId();
    const body = await req.json();
    const { type, message, leadId } = body ?? {};

    if (!type || !message) {
      return NextResponse.json(
        { error: "Fields 'type' and 'message' are required." },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(type)) {
      return NextResponse.json(
        {
          error:
            "Invalid 'type'. Must be one of: " + ALLOWED_TYPES.join(", "),
        },
        { status: 400 },
      );
    }

    const notification = await prisma.notification.create({
      data: {
        workspaceId,
        type,
        message,
        status: "NEW",
        leadId: leadId ?? null,
      },
    });

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    console.error("NOTIFICATION_CREATE_ERROR", error);
    return NextResponse.json(
      { error: "Server error while creating notification." },
      { status: 500 },
    );
  }
}

// PATCH /api/notifications
// Body: { id: string }
// → mark one notification as READ
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id } = body ?? {};

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Field 'id' is required." },
        { status: 400 },
      );
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: {
        status: "READ",
      },
    });

    return NextResponse.json({ notification }, { status: 200 });
  } catch (error) {
    console.error("NOTIFICATION_UPDATE_ERROR", error);
    return NextResponse.json(
      { error: "Server error while updating notification." },
      { status: 500 },
    );
  }
}
