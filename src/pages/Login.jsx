import { useState } from "react";
import { supabase } from "../supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError("Identifiants incorrects ou accès non autorisé.");
    setLoading(false);
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>VP</span>
          <span style={styles.logoText}>VitaPass Admin</span>
        </div>
        <p style={styles.subtitle}>Accès réservé aux administrateurs</p>

        {error && <div style={styles.error}>{error}</div>}

        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />
        <button style={styles.btn} onClick={handleLogin} disabled={loading}>
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0a2540", fontFamily: "'Segoe UI', sans-serif" },
  card: { background: "#fff", borderRadius: 16, padding: 40, width: 360, display: "flex", flexDirection: "column", gap: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" },
  logo: { display: "flex", alignItems: "center", gap: 10, marginBottom: 4 },
  logoIcon: { background: "#2dd4bf", color: "#0a2540", fontWeight: 800, fontSize: 14, borderRadius: 8, padding: "4px 7px" },
  logoText: { color: "#0a2540", fontWeight: 700, fontSize: 20 },
  subtitle: { color: "#64748b", fontSize: 13, margin: 0 },
  error: { background: "#fff1f2", color: "#e11d48", borderRadius: 8, padding: "10px 14px", fontSize: 13 },
  input: { border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" },
  btn: { background: "#0a2540", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
};