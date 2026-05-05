import React, { useState, useEffect } from "react";
import { X, Camera, Image } from "lucide-react";
import { addRepair, updateRepair, uploadPhoto, photoUrl } from "../lib/api";
import { toast } from "sonner";

const WORK_TYPES = ["Screen", "Battery", "Charging", "Software", "Water Damage", "Speaker/Mic", "Camera", "Other"];

export default function RepairDialog({ open, onOpenChange, onSaved, job }) {
  const [form, setForm] = useState({
    customer_name: "", phone: "", model: "", work_type: "Screen",
    description: "", cost: "", amount: "", photo: ""
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (job) {
      setForm({
        customer_name: job.customer_name || "",
        phone: job.phone || "",
        model: job.model || "",
        work_type: job.work_type || "Screen",
        description: job.description || "",
        cost: job.cost || "",
        amount: job.amount || "",
        photo: job.photo || ""
      });
    } else {
      setForm({ customer_name: "", phone: "", model: "", work_type: "Screen", description: "", cost: "", amount: "", photo: "" });
    }
  }, [job, open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadPhoto(file);
      set("photo", res.path);
      toast.success("Photo uploaded!");
    } catch {
      toast.error("Photo upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.customer_name || !form.phone || !form.model) {
      toast.error("Name, phone aur model zaruri hai!");
      return;
    }
    setSaving(true);
    try {
      const profit = Number(form.amount || 0) - Number(form.cost || 0);
      const payload = { ...form, cost: Number(form.cost || 0), amount: Number(form.amount || 0), profit };
      if (job) {
        await updateRepair(job.id, payload);
      } else {
        await addRepair(payload);
      }
      onSaved();
      onOpenChange(false);
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={() => onOpenChange(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{job ? "Edit Repair" : "New Repair Job"}</div>
          <button className="icon-btn" onClick={() => onOpenChange(false)}><X size={20} /></button>
        </div>

        <div className="form-group">
          <label className="form-label">Phone Photo</label>
          <div style={{ display: "flex", gap: 8 }}>
            <label style={{ flex: 1 }}>
              <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: "none" }} />
              <div className="btn secondary full" style={{ cursor: "pointer" }}>
                <Camera size={16} /> Camera
              </div>
            </label>
            <label style={{ flex: 1 }}>
              <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
              <div className="btn secondary full" style={{ cursor: "pointer" }}>
                <Image size={16} /> Gallery
              </div>
            </label>
          </div>
          {uploading && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Uploading...</div>}
          {form.photo && <img src={photoUrl(form.photo)} alt="preview" style={{ width: "100%", borderRadius: 8, marginTop: 8, maxHeight: 150, objectFit: "cover" }} />}
        </div>

        <div className="form-group">
          <label className="form-label">Customer Name *</label>
          <input className="form-input" value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)} placeholder="Customer ka naam" />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Phone *</label>
            <input className="form-input" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Phone number" />
          </div>
          <div className="form-group">
            <label className="form-label">Model *</label>
            <input className="form-input" value={form.model} onChange={(e) => set("model", e.target.value)} placeholder="iPhone 12" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Repair Type</label>
          <select className="form-input" value={form.work_type} onChange={(e) => set("work_type", e.target.value)}>
            {WORK_TYPES.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-input" rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Problem details..." />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Cost (₹)</label>
            <input className="form-input" type="number" value={form.cost} onChange={(e) => set("cost", e.target.value)} placeholder="0" />
          </div>
          <div className="form-group">
            <label className="form-label">Amount (₹)</label>
            <input className="form-input" type="number" value={form.amount} onChange={(e) => set("amount", e.target.value)} placeholder="0" />
          </div>
        </div>

        {(form.cost || form.amount) && (
          <div className="card" style={{ marginBottom: 14, textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Profit</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--green)" }}>
              ₹{Number(form.amount || 0) - Number(form.cost || 0)}
            </div>
          </div>
        )}

        <button className="btn primary full" onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving..." : job ? "Update Job" : "Save Job"}
        </button>
      </div>
    </div>
  );
}
