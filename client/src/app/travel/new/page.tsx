"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { travelApi } from "@/lib/api";

export default function NewTravelRequest() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [form, setForm] = useState({
    fromLocation: "",
    toLocation: "",
    travelDate: "",
    returnDate: "",
    purpose: "",
    transportation: "",
    accommodation: "",
    requestedBudget: "",
    miscExpenses: "0",
  });

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fromLocation || !form.toLocation || !form.travelDate || !form.returnDate || !form.purpose || !form.requestedBudget) {
      setMsg({ type: "error", text: "Please fill all required fields." });
      return;
    }
    if (new Date(form.returnDate) < new Date(form.travelDate)) {
      setMsg({ type: "error", text: "Return date cannot be before travel date." });
      return;
    }
    setLoading(true);
    try {
      await travelApi.createRequest({ 
        ...form, 
        requestedBudget: parseFloat(form.requestedBudget),
        miscExpenses: parseFloat(form.miscExpenses || "0")
      });
      setMsg({ type: "success", text: "Travel request submitted successfully! Awaiting manager approval." });
      setTimeout(() => router.push("/travel/history"), 2000);
    } catch (err: unknown) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to submit request" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Header title="New Travel Request" />

          {msg.text && (
            <div className={msg.type === "success" ? "success-message" : "error-message"}>{msg.text}</div>
          )}

          <div className="form-card">
            <h3>Travel Request Form</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>From Location *</label>
                  <input className="form-input" placeholder="Departure city/location" value={form.fromLocation} onChange={e => set("fromLocation", e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>To Location (Destination) *</label>
                  <input className="form-input" placeholder="Destination city/location" value={form.toLocation} onChange={e => set("toLocation", e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Travel Date *</label>
                  <input className="form-input" type="date" value={form.travelDate} onChange={e => set("travelDate", e.target.value)} required min={new Date().toISOString().split("T")[0]} />
                </div>
                <div className="form-group">
                  <label>Return Date *</label>
                  <input className="form-input" type="date" value={form.returnDate} onChange={e => set("returnDate", e.target.value)} required min={form.travelDate || new Date().toISOString().split("T")[0]} />
                </div>
                <div className="form-group">
                  <label>Transportation</label>
                  <select className="form-select" value={form.transportation} onChange={e => set("transportation", e.target.value)}>
                    <option value="">Select Transportation</option>
                    <option value="Flight">Flight</option>
                    <option value="Train">Train</option>
                    <option value="Bus">Bus</option>
                    <option value="Car">Company Car</option>
                    <option value="Self">Personal Vehicle</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Accommodation</label>
                  <select className="form-select" value={form.accommodation} onChange={e => set("accommodation", e.target.value)}>
                    <option value="">Select Accommodation</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Guest House">Guest House</option>
                    <option value="Company Guest House">Company Guest House</option>
                    <option value="None">Not Required</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Requested Budget (₹) *</label>
                  <input className="form-input" type="number" placeholder="Estimated total budget" value={form.requestedBudget} onChange={e => set("requestedBudget", e.target.value)} required min="0" step="0.01" />
                </div>
                <div className="form-group">
                  <label>Miscellaneous Expenses (₹)</label>
                  <input className="form-input" type="number" placeholder="Other expected costs" value={form.miscExpenses} onChange={e => set("miscExpenses", e.target.value)} min="0" step="0.01" />
                </div>
                <div className="form-group full-width">
                  <label>Purpose of Travel *</label>
                  <textarea className="form-textarea" placeholder="Describe the purpose, business objective, and expected outcomes of this trip..." value={form.purpose} onChange={e => set("purpose", e.target.value)} required rows={4} />
                </div>
              </div>

              <div style={{ background: "#fffbeb", border: "1px solid #fbbf24", borderRadius: "6px", padding: "12px 16px", marginBottom: "16px", fontSize: "13px", color: "#92400e" }}>
                <strong>Note:</strong> Your request will be reviewed by your manager. Please submit at least 5 business days before the travel date.
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-outline" onClick={() => router.push("/dashboard")}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Travel Request"}
                </button>
              </div>
            </form>
          </div>

          {/* Travel Policy Reminder */}
          <div className="section-card">
            <h3>Travel Policy Reminders</h3>
            <div className="policy-card">
              <h4>Before You Submit</h4>
              <ul>
                <li>Get verbal approval from your manager before submitting</li>
                <li>Attach supporting documents if applicable</li>
                <li>Economy class for domestic flights</li>
                <li>Hotel budget as per grade: Grade A – ₹3000/night, Grade B – ₹2000/night</li>
                <li>Keep all bills and receipts for reimbursement</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
