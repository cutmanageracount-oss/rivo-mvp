import type { CSSProperties } from "react";
import { prisma } from "../lib/prisma";
import { getDefaultWorkspaceId } from "../lib/config";

export const dynamic = "force-dynamic";


export default async function AppointmentsPage() {
  const workspaceId = getDefaultWorkspaceId();

  const appointments = await prisma.appointment.findMany({
    where: { workspaceId },
    orderBy: { startsAt: "asc" },
    include: {
      lead: true,
    },
  });

  return (
    <main
      style={{
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "24px",
        maxWidth: "960px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>
        RDV · Rivo (garage)
      </h1>

      <p style={{ marginBottom: "16px", color: "#555" }}>
        Workspace ID : <code>{workspaceId}</code>
      </p>

      {appointments.length === 0 ? (
        <p>Aucun rendez-vous pour le moment.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "14px",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Client</th>
              <th style={thStyle}>Téléphone</th>
              <th style={thStyle}>Service souhaité</th>
              <th style={thStyle}>Statut</th>
              <th style={thStyle}>Créneau</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => (
              <tr key={appt.id}>
                <td style={tdStyle}>
                  {appt.lead?.firstName ?? ""} {appt.lead?.lastName ?? ""}
                </td>
                <td style={tdStyle}>{appt.lead?.phone ?? "-"}</td>
                <td style={tdStyle}>{appt.lead?.desiredService ?? "-"}</td>
                <td style={tdStyle}>{appt.status}</td>
                <td style={tdStyle}>
                  {appt.startsAt
                    ? new Date(appt.startsAt).toLocaleString()
                    : "-"}
                  {" → "}
                  {appt.endsAt
                    ? new Date(appt.endsAt).toLocaleTimeString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

const thStyle: CSSProperties = {
  textAlign: "left",
  borderBottom: "1px solid #ddd",
  padding: "8px",
  backgroundColor: "#f5f5f5",
};

const tdStyle: CSSProperties = {
  borderBottom: "1px solid #eee",
  padding: "8px",
};
