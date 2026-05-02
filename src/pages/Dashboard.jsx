import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function Dashboard() {
  const [stats, setStats] = useState({ patients: 0, medecins: 0, dossiers: 0, documents: 0 });
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); fetchUsers(); }, []);

  async function fetchStats() {
    const [{ count: patients }, { count: medecins }, { count: dossiers }, { count: documents }] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "patient"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "medecin"),
      supabase.from("dossiers").select("*", { count: "exact", head: true }),
      supabase.from("documents").select("*", { count: "exact", head: true }),
    ]);
    setStats({ patients: patients || 0, medecins: medecins || 0, dossiers: dossiers || 0, documents: documents || 0 });
    setLoading(false);
  }

  async function fetchUsers() {
    const { data } = await supabase.from("profiles").select("id, fname, lname, role, wilaya, created_at").order("created_at", { ascending: false });
    setUsers(data || []);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  function formatDate(ts) {
    if (!ts) return "–";
    return new Date(ts).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>VP</span>
          <span style={styles.logoText}>Admin</span>
        </div>
        <nav style={styles.nav}>
          <button style={{ ...styles.navItem, ...(page === "dashboard" ? styles.navActive : {}) }} onClick={() => setPage("dashboard")}>
            📊 Dashboard
          </button>
          <button style={{ ...styles.navItem, ...(page === "users" ? styles.navActive : {}) }} onClick={() => setPage("users")}>
            👥 Utilisateurs
          </button>
        </nav>
        <button style={styles.logoutBtn} onClick={handleLogout}>Déconnexion</button>
      </aside>

      <main style={styles.main}>
        {page === "dashboard" && (
          <>
            <h1 style={styles.title}>Dashboard</h1>
            {loading ? <p>Chargement…</p> : (
              <div style={styles.grid}>
                <div style={styles.card}>
                  <div style={styles.cardIcon}>👤</div>
                  <div style={styles.cardNum}>{stats.patients}</div>
                  <div style={styles.cardLabel}>Patients</div>
                </div>
                <div style={styles.card}>
                  <div style={styles.cardIcon}>🩺</div>
                  <div style={styles.cardNum}>{stats.medecins}</div>
                  <div style={styles.cardLabel}>Médecins</div>
                </div>
                <div style={styles.card}>
                  <div style={styles.cardIcon}>🗂️</div>
                  <div style={styles.cardNum}>{stats.dossiers}</div>
                  <div style={styles.cardLabel}>Dossiers</div>
                </div>
                <div style={styles.card}>
                  <div style={styles.cardIcon}>📄</div>
                  <div style={styles.cardNum}>{stats.documents}</div>
                  <div style={styles.cardLabel}>Documents</div>
                </div>
              </div>
            )}
          </>
        )}

        {page === "users" && (
          <>
            <h1 style={styles.title}>Utilisateurs</h1>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nom</th>
                  <th style={styles.th}>Rôle</th>
                  <th style={styles.th}>Wilaya</th>
                  <th style={styles.th}>Inscrit le</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={styles.tr}>
                    <td style={styles.td}>{u.fname} {u.lname}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, background: u.role === "medecin" ? "#eff6ff" : "#f0fdf4", color: u.role === "medecin" ? "#1d4ed8" : "#16a34a" }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={styles.td}>{u.wilaya || "–"}</td>
                    <td style={styles.td}>{formatDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: { display: "flex", minHeight: "100vh", background: "#f0f4f8", fontFamily: "'Segoe UI', sans-serif" },
  sidebar: { width: 220, background: "#0a2540", display: "flex", flexDirection: "column", padding: "24px 16px", gap: 8 },
  logo: { display: "flex", alignItems: "center", gap: 10, marginBottom: 32 },
  logoIcon: { background: "#2dd4bf", color: "#0a2540", fontWeight: 800, fontSize: 14, borderRadius: 8, padding: "4px 7px" },
  logoText: { color: "#fff", fontWeight: 700, fontSize: 18 },
  nav: { display: "flex", flexDirection: "column", gap: 4, flex: 1 },
  navItem: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "none", background: "transparent", color: "#8ea6c0", fontSize: 14, fontWeight: 500, cursor: "pointer", textAlign: "left" },
  navActive: { background: "rgba(45,212,191,0.12)", color: "#2dd4bf" },
  logoutBtn: { background: "rgba(255,255,255,0.06)", border: "none", color: "#8ea6c0", borderRadius: 8, padding: "10px 12px", fontSize: 13, cursor: "pointer", textAlign: "left" },
  main: { flex: 1, padding: 40 },
  title: { fontSize: 26, fontWeight: 700, color: "#0a2540", marginBottom: 28 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 20 },
  card: { background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" },
  cardIcon: { fontSize: 28 },
  cardNum: { fontSize: 36, fontWeight: 800, color: "#0a2540" },
  cardLabel: { fontSize: 13, color: "#64748b" },
  table: { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  th: { textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "12px 16px", fontSize: 14, color: "#0a2540" },
  badge: { borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600 },
};