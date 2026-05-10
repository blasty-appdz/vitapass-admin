import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function Dashboard() {
  const [stats, setStats] = useState({ patients: 0, medecins: 0, dossiers: 0, documents: 0 });
  const [users, setUsers] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [page, setPage] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); fetchUsers(); fetchPendingDoctors(); }, []);

  async function fetchStats() {
    const [{ count: patients }, { count: medecins }, { count: dossiers }, { count: documents }] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "patient"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "doctor"),
      supabase.from("dossiers").select("*", { count: "exact", head: true }),
      supabase.from("documents").select("*", { count: "exact", head: true }),
    ]);
    setStats({ patients: patients || 0, medecins: medecins || 0, dossiers: dossiers || 0, documents: documents || 0 });
    setLoading(false);
  }

  async function fetchUsers() {
    const { data } = await supabase.from("profiles").select("id, fname, lname, role, wilaya, created_at, validated, numero_ordre").order("created_at", { ascending: false });
    setUsers(data || []);
  }

  async function fetchPendingDoctors() {
    const { data } = await supabase.from("profiles").select("id, fname, lname, wilaya, numero_ordre, created_at").eq("role", "doctor").eq("validated", false);
    setPendingDoctors(data || []);
  }

  async function validateDoctor(id) {
    await supabase.from("profiles").update({ validated: true }).eq("id", id);
    fetchPendingDoctors();
    fetchStats();
  }

  async function rejectDoctor(id) {
    if (!confirm("Rejeter et supprimer ce compte médecin ?")) return;
    await supabase.from("profiles").delete().eq("id", id);
    fetchPendingDoctors();
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
          <button style={{ ...styles.navItem, ...(page === "pending" ? styles.navActive : {}) }} onClick={() => setPage("pending")}>
            ⏳ Médecins en attente {pendingDoctors.length > 0 && <span style={styles.badge2}>{pendingDoctors.length}</span>}
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
            {pendingDoctors.length > 0 && (
              <div style={{ background: "#fffbeb", border: "1px solid #f59e0b", borderRadius: 12, padding: "14px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}>⚠️</span>
                <span style={{ fontSize: 14, color: "#92400e", fontWeight: 600 }}>{pendingDoctors.length} médecin(s) en attente de validation</span>
                <button onClick={() => setPage("pending")} style={{ marginLeft: "auto", background: "#f59e0b", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#fff" }}>Voir →</button>
              </div>
            )}
            {loading ? <p>Chargement…</p> : (
              <div style={styles.grid}>
                <div style={styles.card}><div style={styles.cardIcon}>👤</div><div style={styles.cardNum}>{stats.patients}</div><div style={styles.cardLabel}>Patients</div></div>
                <div style={styles.card}><div style={styles.cardIcon}>🩺</div><div style={styles.cardNum}>{stats.medecins}</div><div style={styles.cardLabel}>Médecins</div></div>
                <div style={styles.card}><div style={styles.cardIcon}>🗂️</div><div style={styles.cardNum}>{stats.dossiers}</div><div style={styles.cardLabel}>Dossiers</div></div>
                <div style={styles.card}><div style={styles.cardIcon}>📄</div><div style={styles.cardNum}>{stats.documents}</div><div style={styles.cardLabel}>Documents</div></div>
              </div>
            )}
          </>
        )}

        {page === "pending" && (
          <>
            <h1 style={styles.title}>Médecins en attente</h1>
            {pendingDoctors.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: "#64748b" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <p>Aucun médecin en attente de validation</p>
              </div>
            ) : pendingDoctors.map(doc => (
              <div key={doc.id} style={{ background: "#fff", borderRadius: 12, padding: 20, marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ fontSize: 36 }}>👨‍⚕️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#0a2540" }}>Dr. {doc.fname} {doc.lname}</div>
                  <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>N° Ordre : {doc.numero_ordre || "Non renseigné"} · {doc.wilaya || "–"}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Inscrit le {formatDate(doc.created_at)}</div>
                </div>
                <button onClick={() => validateDoctor(doc.id)} style={{ background: "#10b981", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer" }}>✅ Valider</button>
                <button onClick={() => rejectDoctor(doc.id)} style={{ background: "#fee2e2", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 700, color: "#dc2626", cursor: "pointer" }}>❌ Rejeter</button>
              </div>
            ))}
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
                  <th style={styles.th}>Validé</th>
                  <th style={styles.th}>Inscrit le</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={styles.tr}>
                    <td style={styles.td}>{u.fname} {u.lname}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, background: u.role === "doctor" ? "#eff6ff" : "#f0fdf4", color: u.role === "doctor" ? "#1d4ed8" : "#16a34a" }}>{u.role}</span>
                    </td>
                    <td style={styles.td}>{u.wilaya || "–"}</td>
                    <td style={styles.td}>{u.role === "doctor" ? (u.validated ? "✅" : "⏳") : "–"}</td>
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
  badge2: { background: "#f59e0b", color: "#fff", borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 700, marginLeft: 6 },
};