import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { hashPassword, setSessionCookie } from "../../../lib/auth";
import { registerSchema } from "../../../lib/validation";


export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { email, password, workspaceName } = parsed.data;

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email." },
        { status: 400 },
      );
    }

    const passwordHash = await hashPassword(password);

    const workspace = await prisma.workspace.create({
      data: {
        name: workspaceName,
        timezone: "Asia/Dubai",
        plan: "TRIAL",
        planStatus: "ACTIVE",
      },
    });

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        isOwner: true,
        workspaceId: workspace.id,
      },
    });

    setSessionCookie({ userId: user.id, workspaceId: workspace.id });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
        },
        workspace: {
          id: workspace.id,
          name: workspace.name,
          timezone: workspace.timezone,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("REGISTER_ERROR", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la création du compte." },
      { status: 500 },
    );
  }
}
