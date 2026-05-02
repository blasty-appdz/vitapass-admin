import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkAdmin(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) checkAdmin(session.user.id);
      else { setIsAdmin(false); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkAdmin(userId) {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (data?.role === "admin") {
      setIsAdmin(true);
    } else {
      await supabase.auth.signOut();
      setIsAdmin(false);
    }
    setLoading(false);
  }

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "sans-serif", color: "#64748b" }}>
      Chargement…
    </div>
  );

  if (!session || !isAdmin) return <Login />;

  return <Dashboard />;
}