"use client";

import { useEffect, useRef, useState } from "react";

// endpoint: "/api/checkout" (start Pro) or "/api/billing-portal" (manage subscription)
export default function UpgradeButton({ endpoint = "/api/checkout", className = "btn btn-accent", children, autoStart = false }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function go() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(endpoint, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error || "Something went wrong.");
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  // Used after "Get Pro" sign-up: go straight to checkout once.
  const autoStarted = useRef(false);
  useEffect(() => {
    if (autoStart && !autoStarted.current) {
      autoStarted.current = true;
      go();
    }
  }, [autoStart]);

  return (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: 6 }}>
      <button type="button" className={className} onClick={go} disabled={loading}>
        {loading ? "Opening secure checkout…" : children}
      </button>
      {error && <small style={{ color: "#9b3520" }}>{error}</small>}
    </span>
  );
}
