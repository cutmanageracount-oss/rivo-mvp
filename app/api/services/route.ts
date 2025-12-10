import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { getDefaultWorkspaceId } from "../../lib/config";

// GET /api/services
// Returns all services for the default workspace
export async function GET() {
  try {
    const workspaceId = getDefaultWorkspaceId();

    const services = await prisma.service.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ services }, { status: 200 });
  } catch (error) {
    console.error("SERVICES_LIST_ERROR", error);
    return NextResponse.json(
      { error: "Server error while fetching services." },
      { status: 500 },
    );
  }
}

// POST /api/services
// Creates a new service for the default workspace
export async function POST(req: Request) {
  try {
    const workspaceId = getDefaultWorkspaceId();
    const body = await req.json();

    const { name, description } = body ?? {};

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Field 'name' is required." },
        { status: 400 },
      );
    }

    const service = await prisma.service.create({
      data: {
        workspaceId,
        name,
        description: description && typeof description === "string"
          ? description
          : null,
      },
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    console.error("SERVICE_CREATE_ERROR", error);
    return NextResponse.json(
      { error: "Server error while creating service." },
      { status: 500 },
    );
  }
}
