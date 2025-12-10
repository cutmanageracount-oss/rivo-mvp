import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { leadCreateSchema } from "../../lib/validation";

// GET /api/leads?workspaceId=xxx
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

    const leads = await prisma.lead.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ leads }, { status: 200 });
  } catch (error) {
    console.error("LEADS_LIST_ERROR", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des leads." },
      { status: 500 },
    );
  }
}

// POST /api/leads
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = leadCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { workspaceId, ...rest } = parsed.data;

    const lead = await prisma.lead.create({
      data: {
        workspaceId,
        ...rest,
        status: "NEW",
      },
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    console.error("LEAD_CREATE_ERROR", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la création du lead." },
      { status: 500 },
    );
  }
}
