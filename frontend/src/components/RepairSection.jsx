import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Loader2, Trash2, CheckCircle2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { fetchRepairs, deleteRepair, updateRepair, formatINR, display, delay } from "../lib/api";
import RepairDialog from "./RepairDialog";

const TABS = ["All", "Pending", "Completed"];

export default function RepairSection() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchRepairs();
      setJobs(data);
    } catch {
      toast.error("Failed to fetch repairs");
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  useEffect(() => {
    const id = setInterval(() => refresh(), 15000);
    return () => clearInterval(id);
  }, [refresh]);

  const handleComplete = async (id) => {
    setBusyId(id);
    try {
      await updateRepair(id, { status: "Completed" });
      toast.success("Marked completed!");
      await delay(1000);
      await refresh();
    } catch {
      toast.error("Update failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    try {
      await deleteRepair(id);
      toast.success("Deleted!");
      await refresh();
    } catch {
      toast.error("Delete failed");
    }
  };

  const filtered = jobs
    .filter((j) => {
      if (tab === "Pending") return j.status !== "Completed";
      if (tab === "Completed") return j.status === "Completed";
      return true;
    })
    .filter((j) => {
      const q = query.toLowerCase();
      return (
        (j.customer_name || "").toLowerCase().includes(q) ||
        (j.phone || "").toLowerCase().includes(q) ||
        (j.model || "").toLowerCase().includes(q)
      );
    });

  const pending = jobs.filter((j) => j.status !== "Completed").length;
  const completed = jobs.filter((j) => j.status === "Completed").length;
  const totalProfit = jobs
    .filter((j) => j.status === "Completed")
    .reduce((s, j) => s + Number(j.profit || 0), 0);

  return (
    <div>
      <div className="kpis">
        <div className="kpi warn">
          <div className="label">Pending</div>
          <div className="value">{pending}</div>
        </div>
        <div className="kpi">
          <div className="label">Completed</div>
          <div className="value">{completed}</div>
        </div>
        <div className="kpi green">
          <div className="label">Profit</div>
          <div className="value" style={{fontSize:14}}>{formatINR(totalProfit)}</div>
        </div>
      </div>

      <div style={{ position: "relative" }}>
        <Search size={16} style={{ position: "absolute", left: 30, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
        <input className="search" placeholder="Search name, phone, model..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {loading ? (
        <div className="empty"><Loader2 className="spin" size={20} /></div>
      ) : filtered.length === 0 ? (
        <div className="empty">Koi job nahi mili</div>
      ) : (
        <div className="list">
          {filtered.map((j) => (
            <div key={j.id} className="item">
              <div className="item-top">
                <div>
                  <div className="item-name">{display(j.customer_name)}</div>
                  <div className="item-sub">{display(j.phone)} • {display(j.model)}</div>
                  <div className="item-sub">{display(j.work_type)}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                  <span className={`badge ${j.status === "Completed" ? "completed" : "pending"}`}>
                    {j.status || "Pending"}
                  </span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button className="icon-btn" onClick={() => { setEditingJob(j); setDialogOpen(true); }}>
                      <Pencil size={13} />
                    </button>
                    <button className="icon-btn" onClick={() => handleDelete(j.id)} style={{ color: "var(--red)" }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid-3" style={{ marginBottom: 10 }}>
                <div className="kpi" style={{ padding: "8px 6px" }}>
                  <div className="label">Amount</div>
                  <div className="value" style={{ fontSize: 14 }}>{formatINR(j.amount)}</div>
                </div>
                <div className="kpi" style={{ padding: "8px 6px" }}>
                  <div className="label">Cost</div>
                  <div className="value" style={{ fontSize: 14 }}>{formatINR(j.cost)}</div>
                </div>
                <div className="kpi green" style={{ padding: "8px 6px" }}>
                  <div className="label">Profit</div>
                  <div className="value" style={{ fontSize: 14 }}>{formatINR(j.profit)}</div>
                </div>
              </div>

              <div className="mono" style={{ marginBottom: 8 }}>
                Recv: {display(j.received_date)} {display(j.received_time)}
              </div>

              {j.status !== "Completed" && (
                <button className="btn primary full" onClick={() => handleComplete(j.id)} disabled={busyId === j.id}>
                  {busyId === j.id ? <><Loader2 size={14} className="spin" /> Updating…</> : <><CheckCircle2 size={14} /> Mark Completed</>}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <button className="fab" onClick={() => { setEditingJob(null); setDialogOpen(true); }}>
        <Plus size={26} strokeWidth={2.5} />
      </button>

      <RepairDialog
        open={dialogOpen}
        onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditingJob(null); }}
        onSaved={async () => { toast.success(editingJob ? "Updated!" : "Job added!"); setEditingJob(null); await delay(1000); await refresh(); }}
        job={editingJob}
      />
    </div>
  );
}
