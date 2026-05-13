"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import StatusBadge from "@/components/StatusBadge";
import ProtectedRoute from "@/components/ProtectedRoute";
import { travelApi } from "@/lib/api";
import { TravelRequest } from "@/lib/types";

export default function AdminTravelPage() {
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [showModal, setShowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [sel, setSel] = useState<TravelRequest | null>(null);
  const [action, setAction] = useState<"approve"|"reject"|"validate"|"reject_report">("approve");
  const [remarks, setRemarks] = useState("");
  const [approvedBudget, setApprovedBudget] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setRequests(await travelApi.getAllRequests()); }
    catch { /* handled */ } finally { setLoading(false); }
  };

  const showMsg = (type: string, text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 4000);
  };

  const openAction = (req: TravelRequest, act: "approve"|"reject"|"validate"|"reject_report") => {
    setSel(req); setAction(act); setRemarks(""); setApprovedBudget(String(req.requestedBudget)); setShowModal(true);
  };

  const openReport = (req: TravelRequest) => {
    setSel(req); setShowReportModal(true);
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sel) return;
    try {
      if (action === "approve") {
        await travelApi.approveRequest(sel.id, approvedBudget ? parseFloat(approvedBudget) : undefined, remarks);
        showMsg("success", "Approved by Manager. Now pending Finance approval.");
      } else if (action === "reject") {
        await travelApi.rejectRequest(sel.id, remarks);
        showMsg("success", "Request rejected by Manager.");
      } else if (action === "validate") {
        await travelApi.financeApprove(sel.id, remarks);
        showMsg("success", "Budget approved by Finance.");
      } else if (action === "reject_report") {
        await travelApi.financeReject(sel.id, remarks);
        showMsg("success", "Rejected by Finance. Returned to Manager.");
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
      r.toLocation.toLowerCase().includes(search.toLowerCase()) ||
      r.purpose.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    All: requests.length,
    PendingManager: requests.filter(r => r.status === "Pending Manager Approval").length,
    PendingFinance: requests.filter(r => r.status === "Pending Finance Approval").length,
    ExpenseSubmitted: requests.filter(r => r.status === "Expense Submitted").length,
    Completed: requests.filter(r => r.status === "Reimbursement Approved").length,
  };

  return (
    <ProtectedRoute requiredRoles={["Admin", "Manager", "Finance"]}>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Header title="Travel Management Panel" />
          {msg.text && (
            <div className={msg.type === "success" ? "success-message" : "error-message"}>{msg.text}</div>
          )}

          {/* Summary tabs */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
            {(["All","PendingManager","PendingFinance","ExpenseSubmitted","Completed"] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`btn btn-sm ${filter === s ? "btn-primary" : "btn-outline"}`}
              >
                {s === "PendingManager" ? "Manager Pending" : s === "PendingFinance" ? "Finance Pending" : s === "ExpenseSubmitted" ? "Reports" : s} ({counts[s as keyof typeof counts] || 0})
              </button>
            ))}
          </div>

          <div className="data-table-wrapper">
            <div className="table-header">
              <h3>All Employee Requests ({filtered.length})</h3>
              <div className="table-actions">
                <input
                  className="search-input"
                  placeholder="Search by name, ID, destination..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            {loading ? <div className="loading-inline">Loading...</div> : filtered.length === 0 ? (
              <div className="empty-state"><p>No records found.</p></div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Employee</th>
                      <th>From → To</th>
                      <th>Travel Date</th>
                      <th>Budget (₹)</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(req => (
                      <tr key={req.id}>
                        <td>{req.id}</td>
                        <td>
                          <strong>{req.userName}</strong>
                          <br /><small style={{ color: "#718096" }}>{req.employeeId}</small>
                        </td>
                        <td>{req.fromLocation} → {req.toLocation}</td>
                        <td>{new Date(req.travelDate).toLocaleDateString("en-IN")}</td>
                        <td>
                          ₹{req.requestedBudget.toLocaleString("en-IN")}
                          {req.actualExpense > 0 && <><br /><small style={{ color: "#38a169" }}>Actual: ₹{req.actualExpense.toLocaleString()}</small></>}
                        </td>
                        <td><StatusBadge status={req.status} /></td>
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button className="btn btn-sm btn-outline" onClick={() => openReport(req)}>View</button>
                            {req.status === "Pending Manager Approval" && (
                              <>
                                <button className="btn btn-sm btn-success" onClick={() => openAction(req, "approve")}>Approve</button>
                                <button className="btn btn-sm btn-danger" onClick={() => openAction(req, "reject")}>Reject</button>
                              </>
                            )}
                            {req.status === "Pending Finance Approval" && (
                              <>
                                <button className="btn btn-sm btn-success" onClick={() => openAction(req, "validate")}>Finance Approve</button>
                                <button className="btn btn-sm btn-danger" onClick={() => openAction(req, "reject_report")}>Finance Reject</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Report Viewer Modal */}
          {showReportModal && sel && (
            <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
              <div className="modal-content" style={{ maxWidth: "700px" }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Travel Report Review — #{sel.id}</h3>
                  <button className="modal-close" onClick={() => setShowReportModal(false)}>✕</button>
                </div>
                <div style={{ maxHeight: "80vh", overflowY: "auto", fontSize: "14px", paddingRight: "5px" }}>
                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px", background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
                     <div><strong>Employee:</strong> {sel.userName}</div>
                     <div><strong>Dept:</strong> {sel.department}</div>
                     <div><strong>Destination:</strong> {sel.fromLocation} → {sel.toLocation}</div>
                     <div><strong>Budget:</strong> Approved ₹{sel.approvedBudget?.toLocaleString()}</div>
                   </div>

                   {sel.reportSubmittedAt ? (
                     <div style={{ marginBottom: "20px" }}>
                       <h4 style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "8px", marginBottom: "12px" }}>Submission Details</h4>
                       <div style={{ display: "grid", gap: "10px" }}>
                         <div><strong>Title:</strong> {sel.tripTitle}</div>
                         <div><strong>Work Completed:</strong><p style={{ background: "#fff", padding: "8px", borderRadius: "4px", border: "1px solid #edf2f7", marginTop: "4px" }}>{sel.workCompleted}</p></div>
                         <div><strong>Summary:</strong><p style={{ background: "#fff", padding: "8px", borderRadius: "4px", border: "1px solid #edf2f7", marginTop: "4px" }}>{sel.travelSummary}</p></div>
                         {sel.meetingDetails && <div><strong>Meetings:</strong><p style={{ background: "#fff", padding: "8px", borderRadius: "4px", border: "1px solid #edf2f7", marginTop: "4px" }}>{sel.meetingDetails}</p></div>}
                         {sel.issuesFaced && <div><strong>Issues:</strong><p style={{ background: "#fff", padding: "8px", borderRadius: "4px", border: "1px solid #edf2f7", marginTop: "4px" }}>{sel.issuesFaced}</p></div>}
                       </div>

                       <div style={{ marginTop: "20px" }}>
                         <h5 style={{ marginBottom: "8px" }}>Expense Breakdown</h5>
                         <table className="data-table" style={{ fontSize: "12px" }}>
                           <thead><tr><th>Date</th><th>Category</th><th>Title</th><th>Amount</th></tr></thead>
                           <tbody>
                             {sel.expenses.map(e => (
                               <tr key={e.id}><td>{new Date(e.date).toLocaleDateString()}</td><td>{e.type}</td><td>{e.title}</td><td>₹{e.amount.toLocaleString()}</td></tr>
                             ))}
                             <tr style={{ fontWeight: "bold", background: "#f1f5f9" }}>
                               <td colSpan={3}>Total Actual Expense</td>
                               <td>₹{sel.actualExpense.toLocaleString()}</td>
                             </tr>
                           </tbody>
                         </table>
                       </div>

                       <div style={{ marginTop: "20px" }}>
                         <h5 style={{ marginBottom: "8px" }}>Uploaded Bills</h5>
                         <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                           {sel.bills.map(b => (
                             <a key={b.id} href={`http://localhost:5000${b.filePath}`} target="_blank" rel="noreferrer" 
                               style={{ background: "#fff", padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", color: "#2563eb", display: "flex", alignItems: "center", gap: "4px" }}>
                               📄 View Bill #{b.id}
                             </a>
                           ))}
                         </div>
                       </div>
                     </div>
                   ) : (
                     <p style={{ textAlign: "center", color: "#64748b", padding: "40px" }}>No report submitted yet for this travel.</p>
                   )}
                </div>
              </div>
            </div>
          )}

          {/* Action Modal */}
          {showModal && sel && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>{action.includes("reject") ? "❌ Reject" : "✅ Approve"} #{sel.id}</h3>
                  <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                </div>
                <form onSubmit={handleAction}>
                  {action === "approve" && (
                    <div className="form-group">
                      <label>Approved Budget (₹)</label>
                      <input className="form-input" type="number" value={approvedBudget} onChange={e => setApprovedBudget(e.target.value)} />
                    </div>
                  )}
                  <div className="form-group">
                    <label>Remarks</label>
                    <textarea className="form-textarea" value={remarks} onChange={e => setRemarks(e.target.value)} rows={3} />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className={`btn ${action.includes("reject") ? "btn-danger" : "btn-success"}`}>Confirm Action</button>
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
