import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { verifyPassword, setSessionCookie } from "../../../lib/auth";

import { loginSchema } from "../../../lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { workspace: true },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect." },
        { status: 401 },
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect." },
        { status: 401 },
      );
    }

    setSessionCookie({ userId: user.id, workspaceId: user.workspaceId });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
        },
        workspace: {
          id: user.workspace.id,
          name: user.workspace.name,
          timezone: user.workspace.timezone,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("LOGIN_ERROR", error);
    return NextResponse.json(
      {
        error: "Erreur serveur lors de la connexion.",
        details: String(error),
      },
      { status: 500 },
    );
  }
}
