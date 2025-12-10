import { NextResponse } from "next/server";
import { getCurrentUser, clearSessionCookie } from "../../../lib/auth";


export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 },
      );
    }

    const { user, workspace } = session;

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        workspace: workspace
          ? {
              id: workspace.id,
              name: workspace.name,
              timezone: workspace.timezone,
            }
          : null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("ME_ERROR", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 },
    );
  }
}

// Optionnel : méthode DELETE pour se déconnecter facilement
export async function DELETE() {
  clearSessionCookie();
  return NextResponse.json({ success: true }, { status: 200 });
}
