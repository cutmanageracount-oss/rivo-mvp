import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

// GET /api/appointments?workspaceId=xxx
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId manquant" },
        { status: 400 },
      );
    }

    const appointments = await prisma.appointment.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      include: {
        lead: true,
      },
    });

    return NextResponse.json({ appointments }, { status: 200 });
  } catch (error) {
    console.error("APPOINTMENTS_LIST_ERROR", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des RDV." },
      { status: 500 },
    );
  }
}

// POST /api/appointments
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { workspaceId, leadId, startsAt, endsAt } = body ?? {};

    if (!workspaceId || !leadId || !startsAt || !endsAt) {
      return NextResponse.json(
        {
          error:
            "Champs requis : workspaceId, leadId, startsAt (ISO), endsAt (ISO)",
        },
        { status: 400 },
      );
    }

    const starts = new Date(startsAt);
    const ends = new Date(endsAt);

    if (Number.isNaN(starts.getTime()) || Number.isNaN(ends.getTime())) {
      return NextResponse.json(
        { error: "Dates invalides" },
        { status: 400 },
      );
    }

    const durationMinutes = Math.round(
      (ends.getTime() - starts.getTime()) / 1000 / 60,
    );

    const appointment = await prisma.appointment.create({
      data: {
        workspaceId,
        leadId,
        status: "CONFIRMED",
        startsAt: starts,
        endsAt: ends,
        durationMinutes,
      },
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    console.error("APPOINTMENT_CREATE_ERROR", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la création du RDV." },
      { status: 500 },
    );
  }
}
