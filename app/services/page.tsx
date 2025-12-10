"use client";

import { useEffect, useState } from "react";

type Service = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadServices() {
    try {
      setLoading(true);
      const res = await fetch("/api/services");
      const data = await res.json();

      if (!res.ok) {
        console.error(data);
        throw new Error(data.error || "Failed to load services");
      }

      setServices(data.services || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load services.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data);
        throw new Error(data.error || "Failed to create service");
      }

      const newService: Service = data.service;
      setServices((prev) => [...prev, newService]);
      setName("");
      setDescription("");
      setMessage("Service added.");
    } catch (err) {
      console.error(err);
      setError("Error while creating service.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main
      style={{
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "24px",
        maxWidth: "960px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>
        Services · Garage
      </h1>
      <p style={{ marginBottom: "16px", color: "#555" }}>
        Define the services this garage offers (detailing, PPF, polishing, etc.).
      </p>

      <section
        style={{
          marginBottom: "24px",
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid #ddd",
          backgroundColor: "#fafafa",
        }}
      >
        <h2 style={{ fontSize: "18px", marginBottom: "8px" }}>Add a service</h2>

        {error && (
          <p style={{ color: "red", fontSize: "14px", marginBottom: "8px" }}>
            {error}
          </p>
        )}
        {message && (
          <p style={{ color: "green", fontSize: "14px", marginBottom: "8px" }}>
            {message}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "8px" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "14px", fontWeight: 500 }}>Name</label>
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
              placeholder="e.g. Interior detailing"
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "14px", fontWeight: 500 }}>
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "14px",
                resize: "vertical",
              }}
              placeholder="Short description for internal use."
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              marginTop: "8px",
              alignSelf: "flex-start",
              padding: "8px 14px",
              borderRadius: "999px",
              border: "none",
              fontSize: "14px",
              fontWeight: 500,
              backgroundColor: saving ? "#ccc" : "#0070f3",
              color: "#fff",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Adding..." : "Add service"}
          </button>
        </form>
      </section>

      <section>
        <h2 style={{ fontSize: "18px", marginBottom: "8px" }}>Current services</h2>

        {loading ? (
          <p>Loading services...</p>
        ) : services.length === 0 ? (
          <p style={{ color: "#777" }}>No services yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {services.map((service) => (
              <li
                key={service.id}
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "8px 0",
                }}
              >
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 500,
                    marginBottom: "2px",
                  }}
                >
                  {service.name}
                </div>
                {service.description && (
                  <div style={{ fontSize: "13px", color: "#555" }}>
                    {service.description}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
