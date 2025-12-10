import { prisma } from "../lib/prisma";
import { getDefaultWorkspaceId } from "../lib/config";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const workspaceId = getDefaultWorkspaceId();

  const leads = await prisma.lead.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
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
        Pipeline leads · Rivo
      </h1>

      <p style={{ marginBottom: "16px", color: "#555" }}>
        Workspace ID : <code>{workspaceId}</code>
      </p>

      {leads.length === 0 ? (
        <p>Aucun lead pour le moment.</p>
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
              <th style={thStyle}>Nom</th>
              <th style={thStyle}>Téléphone</th>
              <th style={thStyle}>Service souhaité</th>
              <th style={thStyle}>Statut</th>
              <th style={thStyle}>Créé le</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td style={tdStyle}>
                  {lead.firstName ?? ""} {lead.lastName ?? ""}
                </td>
                <td style={tdStyle}>{lead.phone ?? "-"}</td>
                <td style={tdStyle}>{lead.desiredService ?? "-"}</td>
                <td style={tdStyle}>{lead.status}</td>
                <td style={tdStyle}>
                  {new Date(lead.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  borderBottom: "1px solid #ddd",
  padding: "8px",
  backgroundColor: "#f5f5f5",
};

const tdStyle: React.CSSProperties = {
  borderBottom: "1px solid #eee",
  padding: "8px",
};
