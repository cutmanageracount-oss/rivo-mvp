"use client";

import { useEffect, useState } from "react";

type NotificationStatus = "NEW" | "READ";

type Notification = {
  id: string;
  type: string;
  message: string;
  status: NotificationStatus;
  createdAt: string;
  lead?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
  } | null;
};

type Filter = "ALL" | "NEW" | "READ";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [refreshing, setRefreshing] = useState(false);

  async function loadNotifications(selectedFilter: Filter) {
    try {
      if (!refreshing) {
        setLoading(true);
      }
      setError(null);

      let url = "/api/notifications";
      if (selectedFilter === "NEW" || selectedFilter === "READ") {
        url += `?status=${selectedFilter}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        console.error(data);
        throw new Error(data.error || "Failed to load notifications.");
      }

      setNotifications(data.notifications || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadNotifications(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function handleMarkRead(id: string) {
    try {
      setRefreshing(true);
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data);
        throw new Error(data.error || "Failed to update notification.");
      }

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, status: "READ" as NotificationStatus } : n,
        ),
      );
    } catch (err) {
      console.error(err);
      setError("Error while updating notification.");
    } finally {
      setRefreshing(false);
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
        Notifications · Rivo
      </h1>
      <p style={{ marginBottom: "16px", color: "#555", fontSize: "14px" }}>
        Internal alerts for this garage: WhatsApp send failures, reminder
        issues, and system messages.
      </p>

      {error && (
        <p style={{ color: "red", fontSize: "14px", marginBottom: "8px" }}>
          {error}
        </p>
      )}

      <section
        style={{
          marginBottom: "16px",
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <FilterButton
          label="All"
          active={filter === "ALL"}
          onClick={() => setFilter("ALL")}
        />
        <FilterButton
          label="New"
          active={filter === "NEW"}
          onClick={() => setFilter("NEW")}
        />
        <FilterButton
          label="Read"
          active={filter === "READ"}
          onClick={() => setFilter("READ")}
        />
      </section>

      <section
        style={{
          borderRadius: "12px",
          border: "1px solid #ddd",
          padding: "12px",
          backgroundColor: "#fafafa",
        }}
      >
        {loading ? (
          <p style={{ fontSize: "14px", color: "#777" }}>
            Loading notifications...
          </p>
        ) : notifications.length === 0 ? (
          <p style={{ fontSize: "14px", color: "#777" }}>
            No notifications for this filter.
          </p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {notifications.map((n) => (
              <li
                key={n.id}
                style={{
                  borderRadius: "8px",
                  border: "1px solid #eee",
                  padding: "10px 12px",
                  backgroundColor:
                    n.status === "NEW" ? "#fffdf7" : "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      padding: "2px 8px",
                      borderRadius: "999px",
                      border: "1px solid #ddd",
                      backgroundColor:
                        n.status === "NEW" ? "#ffe9b3" : "#f0f0f0",
                    }}
                  >
                    {n.type}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#888",
                    }}
                  >
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>

                <div style={{ fontSize: "14px", color: "#333" }}>
                  {n.message}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "4px",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      color: n.status === "NEW" ? "#d27a00" : "#777",
                    }}
                  >
                    Status: {n.status}
                  </span>

                  {n.status === "NEW" && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      disabled={refreshing}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "999px",
                        border: "none",
                        fontSize: "12px",
                        fontWeight: 500,
                        backgroundColor: refreshing ? "#ccc" : "#0070f3",
                        color: "#fff",
                        cursor: refreshing ? "not-allowed" : "pointer",
                      }}
                    >
                      {refreshing ? "Updating..." : "Mark as read"}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

type FilterButtonProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

function FilterButton({ label, active, onClick }: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "6px 12px",
        borderRadius: "999px",
        border: active ? "1px solid #0070f3" : "1px solid #ccc",
        backgroundColor: active ? "#e6f0ff" : "#fff",
        color: active ? "#0070f3" : "#333",
        fontSize: "13px",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
