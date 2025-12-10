"use client";

import { useEffect, useState } from "react";

type Workspace = {
  id: string;
  name: string;
  timezone: string;
  brandTone: string | null;
  openingHours: any | null;
};

export default function SettingsPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("Asia/Dubai");
  const [brandTone, setBrandTone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWorkspace() {
      try {
        setLoading(true);
        const res = await fetch("/api/workspace");
        if (!res.ok) {
          throw new Error("Failed to load workspace");
        }
        const data = await res.json();
        const w = data.workspace as Workspace;
        setWorkspace(w);
        setName(w.name ?? "");
        setTimezone(w.timezone ?? "Asia/Dubai");
        setBrandTone(w.brandTone ?? "");
      } catch (err) {
        console.error(err);
        setError("Unable to load workspace settings.");
      } finally {
        setLoading(false);
      }
    }

    loadWorkspace();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/workspace", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          timezone,
          brandTone: brandTone || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data);
        throw new Error(data.error || "Failed to save settings");
      }

      setWorkspace(data.workspace);
      setMessage("Settings saved.");
    } catch (err) {
      console.error(err);
      setError("Error while saving settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main
      style={{
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "24px",
        maxWidth: "720px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>
        Garage settings
      </h1>

      {workspace && (
        <p style={{ marginBottom: "16px", color: "#555" }}>
          Workspace ID: <code>{workspace.id}</code>
        </p>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            marginTop: "8px",
          }}
        >
          {error && (
            <p style={{ color: "red", fontSize: "14px" }}>{error}</p>
          )}
          {message && (
            <p style={{ color: "green", fontSize: "14px" }}>{message}</p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "14px", fontWeight: 500 }}>
              Garage name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "14px",
              }}
              placeholder="ex: Supreme Detailing Dubai"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "14px", fontWeight: 500 }}>
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "14px",
              }}
            >
              <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
              <option value="Europe/Paris">Europe/Paris</option>
              <option value="UTC">UTC</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "14px", fontWeight: 500 }}>
              Brand tone (internal note)
            </label>
            <textarea
              value={brandTone}
              onChange={(e) => setBrandTone(e.target.value)}
              rows={3}
              style={{
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "14px",
                resize: "vertical",
              }}
              placeholder="Example: short, premium, warm, ultra direct, action oriented."
            />
            <p style={{ fontSize: "12px", color: "#777" }}>
              This will later guide the AI tone for this garage.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              marginTop: "8px",
              padding: "10px 16px",
              borderRadius: "999px",
              border: "none",
              fontSize: "14px",
              fontWeight: 500,
              backgroundColor: saving ? "#ccc" : "#0070f3",
              color: "#fff",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Save settings"}
          </button>
        </form>
      )}
    </main>
  );
}
