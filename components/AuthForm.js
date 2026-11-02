"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthForm({ mode, next = "/dashboard" }) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {isSignup && (
        <label className="field">
          <span>Your name</span>
          <input className="input" name="name" autoComplete="name" required />
        </label>
      )}
      <label className="field">
        <span>Email</span>
        <input className="input" type="email" name="email" autoComplete="email" required />
      </label>
      <label className="field">
        <span>Password</span>
        <input
          className="input"
          type="password"
          name="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          minLength={isSignup ? 8 : undefined}
          required
        />
      </label>
      <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
        {loading ? "Please wait…" : isSignup ? "Create account" : "Log in"}
      </button>
      <p className="auth-switch">
        {isSignup ? (
          <>Already have an account? <Link href="/login">Log in</Link></>
        ) : (
          <>New here? <Link href="/signup">Create a free account</Link></>
        )}
      </p>
    </form>
  );
}
