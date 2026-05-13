"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import StatusBadge from "@/components/StatusBadge";
import ProtectedRoute from "@/components/ProtectedRoute";
import { travelApi } from "@/lib/api";
import { TravelRequest } from "@/lib/types";

export default function FinanceExpensesPage() {
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Expense Submitted");
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [showModal, setShowModal] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [sel, setSel] = useState<TravelRequest | null>(null);
  const [action, setAction] = useState<"approve" | "reject">("approve");
  const [remarks, setRemarks] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { 
      const all = await travelApi.getAllRequests();
      setRequests(all.filter((r: TravelRequest) => 
        r.status === "Expense Submitted" || 
        r.status === "Reimbursement Approved"
      ));
    } catch { /* handled */ } finally { setLoading(false); }
  };

  const showMsg = (type: string, text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 4000);
  };

  const openAction = (req: TravelRequest, act: "approve" | "reject") => {
    setSel(req); setAction(act); setRemarks(""); setShowModal(true);
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sel) return;
    try {
      await travelApi.validateReport(sel.id, action === "approve");
      showMsg("success", action === "approve" ? "Reimbursement approved." : "Expenses rejected.");
      setShowModal(false);
      load();
    } catch (err: unknown) {
      showMsg("error", err instanceof Error ? err.message : "Action failed");
    }
  };

  const filtered = requests.filter(r => {
    const matchFilter = filter === "All" || r.status === filter;
    const matchSearch =
      r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.employeeId.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <ProtectedRoute requiredRoles={["Finance", "Admin"]}>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Header title="Expense Verification" />
          {msg.text && (
            <div className={msg.type === "success" ? "success-message" : "error-message"}>{msg.text}</div>
          )}

          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <button onClick={() => setFilter("Expense Submitted")} className={`btn btn-sm ${filter === "Expense Submitted" ? "btn-primary" : "btn-outline"}`}>Pending Verification</button>
            <button onClick={() => setFilter("Reimbursement Approved")} className={`btn btn-sm ${filter === "Reimbursement Approved" ? "btn-primary" : "btn-outline"}`}>Approved</button>
            <button onClick={() => setFilter("All")} className={`btn btn-sm ${filter === "All" ? "btn-primary" : "btn-outline"}`}>All History</button>
          </div>

          <div className="data-table-wrapper">
            <div className="table-header">
              <h3>Expense Claims ({filtered.length})</h3>
              <div className="table-actions">
                <input className="search-input" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>

            {loading ? <div className="loading-inline">Loading...</div> : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Employee</th>
                    <th>Approved Budget</th>
                    <th>Actual Expense</th>
                    <th>Variance</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(req => {
                    const variance = (req.approvedBudget || 0) - req.actualExpense;
                    return (
                      <tr key={req.id}>
                        <td>#{req.id}</td>
                        <td>{req.userName}</td>
                        <td>₹{req.approvedBudget?.toLocaleString()}</td>
                        <td><strong>₹{req.actualExpense.toLocaleString()}</strong></td>
                        <td style={{ color: variance < 0 ? "#e53e3e" : "#38a169" }}>
                           {variance < 0 ? `Over: ₹${Math.abs(variance).toLocaleString()}` : `Under: ₹${variance.toLocaleString()}`}
                        </td>
                        <td><StatusBadge status={req.status} /></td>
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                             <button className="btn btn-sm btn-outline" onClick={() => { setSel(req); setShowReport(true); }}>View Report</button>
                             {req.status === "Expense Submitted" && (
                               <>
                                 <button className="btn btn-sm btn-success" onClick={() => openAction(req, "approve")}>Approve</button>
                                 <button className="btn btn-sm btn-danger" onClick={() => openAction(req, "reject")}>Reject</button>
                               </>
                             )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Report Viewer Modal */}
          {showReport && sel && (
            <div className="modal-overlay" onClick={() => setShowReport(false)}>
              <div className="modal-content" style={{ maxWidth: "700px" }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Expense Report — #{sel.id}</h3>
                  <button className="modal-close" onClick={() => setShowReport(false)}>✕</button>
                </div>
                <div style={{ maxHeight: "80vh", overflowY: "auto", padding: "20px" }}>
                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                      <div><strong>Trip:</strong> {sel.fromLocation} to {sel.toLocation}</div>
                      <div><strong>Purpose:</strong> {sel.purpose}</div>
                   </div>
                   
                   <h5>Expense Items</h5>
                   <table className="data-table" style={{ fontSize: "13px" }}>
                     <thead><tr><th>Date</th><th>Category</th><th>Title</th><th>Amount</th></tr></thead>
                     <tbody>
                       {sel.expenses.map(e => (
                         <tr key={e.id}><td>{new Date(e.date).toLocaleDateString()}</td><td>{e.type}</td><td>{e.title}</td><td>₹{e.actualAmount?.toLocaleString() || e.estimatedAmount?.toLocaleString()}</td></tr>
                       ))}
                       <tr style={{ fontWeight: "bold" }}>
                         <td colSpan={3}>Total</td>
                         <td>₹{sel.actualExpense.toLocaleString()}</td>
                       </tr>
                     </tbody>
                   </table>

                   <h5 style={{ marginTop: "20px" }}>Attached Bills</h5>
                   <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
                     {sel.bills.map(b => (
                       <a key={b.id} href={`http://localhost:5000${b.filePath}`} target="_blank" className="btn btn-sm btn-outline">📄 Bill #{b.id}</a>
                     ))}
                   </div>
                </div>
              </div>
            </div>
          )}

          {showModal && sel && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>{action === "approve" ? "✅ Approve Reimbursement" : "❌ Reject Expenses"} — #{sel.id}</h3>
                  <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                </div>
                <form onSubmit={handleAction}>
                  <div className="form-group">
                    <label>Remarks</label>
                    <textarea className="form-textarea" value={remarks} onChange={e => setRemarks(e.target.value)} rows={3} />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className={`btn ${action === "reject" ? "btn-danger" : "btn-success"}`}>Confirm</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
