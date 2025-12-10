import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "24px",
        maxWidth: "960px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Rivo · MVP</h1>
      <p style={{ marginBottom: "24px", color: "#555" }}>
        Simple assistant for premium auto garages.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        <Card
          title="Lead pipeline"
          description="View customer inquiries and their current status."
          href="/leads"
        />
        <Card
          title="Appointments"
          description="See confirmed time slots for your garage."
          href="/appointments"
        />
        <Card
          title="Services"
          description="Define the services this garage offers."
          href="/services"
        />
        <Card
          title="Garage settings"
          description="Configure your garage name, timezone and brand tone."
          href="/settings"
        />
        <Card
          title="Internal chat"
          description="Simulate WhatsApp conversations and AI flows."
          href="/internal-chat"
        />
        <Card
          title="Notifications"
          description="See WhatsApp send errors and system alerts."
          href="/notifications"
        />
      </div>
    </main>
  );
}

type CardProps = {
  title: string;
  description: string;
  href: string;
  disabled?: boolean;
};

function Card({ title, description, href, disabled }: CardProps) {
  const content = (
    <div
      style={{
        borderRadius: "12px",
        border: "1px solid #ddd",
        padding: "16px",
        backgroundColor: disabled ? "#f7f7f7" : "#fff",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "transform 0.1s ease, box-shadow 0.1s ease",
      }}
    >
      <h2 style={{ fontSize: "18px", marginBottom: "8px" }}>{title}</h2>
      <p style={{ fontSize: "14px", color: "#555" }}>{description}</p>
      {!disabled && (
        <p style={{ fontSize: "13px", marginTop: "12px", color: "#0070f3" }}>
          Open →
        </p>
      )}
      {disabled && (
        <p style={{ fontSize: "12px", marginTop: "12px", color: "#999" }}>
          Coming soon
        </p>
      )}
    </div>
  );

  if (disabled) {
    return content;
  }

  return (
    <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
      {content}
    </Link>
  );
}

