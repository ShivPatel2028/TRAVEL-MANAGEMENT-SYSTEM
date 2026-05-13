"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import StatusBadge from "@/components/StatusBadge";
import ProtectedRoute from "@/components/ProtectedRoute";
import { travelApi } from "@/lib/api";
import { TravelRequest } from "@/lib/types";

export default function FinanceTravelPage() {
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Pending Finance Approval");
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [showModal, setShowModal] = useState(false);
  const [sel, setSel] = useState<TravelRequest | null>(null);
  const [action, setAction] = useState<"approve" | "reject">("approve");
  const [remarks, setRemarks] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { 
      const all = await travelApi.getAllRequests();
      // Finance only cares about requests that passed manager approval or were already finance approved
      setRequests(all.filter((r: TravelRequest) => 
        r.status === "Pending Finance Approval" || 
        r.status === "Finance Approved" || 
        r.status === "Rejected by Finance"
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
      if (action === "approve") {
        await travelApi.financeApprove(sel.id, remarks);
        showMsg("success", "Budget approved successfully.");
      } else {
        await travelApi.financeReject(sel.id, remarks);
        showMsg("success", "Budget rejected and returned to Manager.");
      }
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
      r.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      r.toLocation.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <ProtectedRoute requiredRoles={["Finance", "Admin"]}>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Header title="Finance Budget Review" />
          {msg.text && (
            <div className={msg.type === "success" ? "success-message" : "error-message"}>{msg.text}</div>
          )}

          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <button onClick={() => setFilter("Pending Finance Approval")} className={`btn btn-sm ${filter === "Pending Finance Approval" ? "btn-primary" : "btn-outline"}`}>Pending Approval</button>
            <button onClick={() => setFilter("Finance Approved")} className={`btn btn-sm ${filter === "Finance Approved" ? "btn-primary" : "btn-outline"}`}>Approved</button>
            <button onClick={() => setFilter("All")} className={`btn btn-sm ${filter === "All" ? "btn-primary" : "btn-outline"}`}>All History</button>
          </div>

          <div className="data-table-wrapper">
            <div className="table-header">
              <h3>Travel Budgets ({filtered.length})</h3>
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
                    <th>Destination</th>
                    <th>Estimated Budget</th>
                    <th>Manager Remarks</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(req => (
                    <tr key={req.id}>
                      <td>#{req.id}</td>
                      <td>{req.userName}<br/><small>{req.employeeId}</small></td>
                      <td>{req.toLocation}</td>
                      <td>₹{req.approvedBudget?.toLocaleString() || req.requestedBudget.toLocaleString()}</td>
                      <td><small>{req.managerRemarks || "—"}</small></td>
                      <td><StatusBadge status={req.status} /></td>
                      <td>
                        {req.status === "Pending Finance Approval" && (
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button className="btn btn-sm btn-success" onClick={() => openAction(req, "approve")}>Approve</button>
                            <button className="btn btn-sm btn-danger" onClick={() => openAction(req, "reject")}>Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {showModal && sel && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>{action === "approve" ? "✅ Approve Budget" : "❌ Reject Budget"} — #{sel.id}</h3>
                  <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                </div>
                <form onSubmit={handleAction}>
                  <div className="form-group">
                    <label>Finance Remarks/Comments</label>
                    <textarea className="form-textarea" value={remarks} onChange={e => setRemarks(e.target.value)} rows={3} placeholder="Add your notes here..." />
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
