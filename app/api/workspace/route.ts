import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { getDefaultWorkspaceId } from "../../lib/config";

// GET /api/workspace
export async function GET() {
  try {
    const workspaceId = getDefaultWorkspaceId();

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        workspace: {
          id: workspace.id,
          name: workspace.name,
          timezone: workspace.timezone,
          brandTone: workspace.brandTone,
          openingHours: workspace.openingHours,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("WORKSPACE_GET_ERROR", error);
    return NextResponse.json(
      { error: "Server error while fetching workspace." },
      { status: 500 },
    );
  }
}

// PUT /api/workspace
export async function PUT(req: Request) {
  try {
    const workspaceId = getDefaultWorkspaceId();
    const body = await req.json();

    const { name, timezone, brandTone } = body ?? {};

    if (!name || !timezone) {
      return NextResponse.json(
        { error: "Fields 'name' and 'timezone' are required." },
        { status: 400 },
      );
    }

    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        name,
        timezone,
        brandTone: brandTone ?? null,
      },
    });

    return NextResponse.json(
      {
        workspace: {
          id: workspace.id,
          name: workspace.name,
          timezone: workspace.timezone,
          brandTone: workspace.brandTone,
          openingHours: workspace.openingHours,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("WORKSPACE_UPDATE_ERROR", error);
    return NextResponse.json(
      { error: "Server error while updating workspace." },
      { status: 500 },
    );
  }
}
