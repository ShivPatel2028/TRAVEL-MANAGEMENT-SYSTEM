"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import StatusBadge from "@/components/StatusBadge";
import ProtectedRoute from "@/components/ProtectedRoute";
import { travelApi } from "@/lib/api";
import { TravelRequest } from "@/lib/types";
import Link from "next/link";

export default function TravelHistory() {
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [sel, setSel] = useState<TravelRequest | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setRequests(await travelApi.getMyRequests()); }
    catch { /* handled */ } finally { setLoading(false); }
  };

  const filtered = filter === "All" ? requests : requests.filter(r => r.status === filter);

  return (
    <ProtectedRoute>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Header title="Travel History" />

          <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
            {["All","Pending Manager Approval","Pending Finance Approval","Finance Approved","Expense Submitted","Reimbursement Approved","Rejected by Manager","Rejected by Finance"].map(s => (
              <button key={s} onClick={() => setFilter(s)} className={`btn btn-sm ${filter === s ? "btn-primary" : "btn-outline"}`}>
                {s.replace("Pending ", "").replace(" Approval", "").replace("Approved", "✓")}
              </button>
            ))}
          </div>

          <div className="data-table-wrapper">
            <div className="table-header">
              <h3>My Travel Requests ({filtered.length})</h3>
              <Link href="/travel/new" className="btn btn-sm btn-primary">+ New Request</Link>
            </div>
            {loading ? <div className="loading-inline">Loading...</div> : filtered.length === 0 ? (
              <div className="empty-state">
                <p>No travel requests found.</p>
                <Link href="/travel/new" className="btn btn-primary" style={{ marginTop: "12px", display: "inline-block" }}>Submit First Request</Link>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="data-table">
                  <thead>
                    <tr><th>#</th><th>Destination</th><th>Travel Date</th><th>Return Date</th><th>Purpose</th><th>Budget (₹)</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map(req => (
                      <tr key={req.id}>
                        <td>{req.id}</td>
                        <td><strong>{req.toLocation}</strong><br /><small style={{ color: "#718096" }}>from {req.fromLocation}</small></td>
                        <td>{new Date(req.travelDate).toLocaleDateString("en-IN")}</td>
                        <td>{new Date(req.returnDate).toLocaleDateString("en-IN")}</td>
                        <td style={{ maxWidth: "160px" }}>{req.purpose.length > 40 ? req.purpose.substring(0, 40) + "…" : req.purpose}</td>
                        <td>
                          ₹{req.requestedBudget.toLocaleString("en-IN")}
                          {req.approvedBudget && <><br /><small style={{ color: "#38a169" }}>✓ ₹{req.approvedBudget.toLocaleString("en-IN")}</small></>}
                        </td>
                        <td><StatusBadge status={req.status} /></td>
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button className="btn btn-sm btn-outline" onClick={() => setSel(req)}>View</button>
                            {req.status === "Finance Approved" && (
                              <Link href={`/travel/report/${req.id}`} className="btn btn-sm btn-primary">Submit Report</Link>
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

          {/* Detail Modal */}
          {sel && (
            <div className="modal-overlay" onClick={() => setSel(null)}>
              <div className="modal-content" style={{ maxWidth: "700px" }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Request #{sel.id} Details</h3>
                  <button className="modal-close" onClick={() => setSel(null)}>✕</button>
                </div>
                <div style={{ fontSize: "14px", maxHeight: "80vh", overflowY: "auto", paddingRight: "5px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                    {[
                      ["Status", <StatusBadge key="s" status={sel.status} />],
                      ["From", sel.fromLocation],
                      ["To (Destination)", sel.toLocation],
                      ["Travel Date", new Date(sel.travelDate).toLocaleDateString("en-IN")],
                      ["Return Date", new Date(sel.returnDate).toLocaleDateString("en-IN")],
                      ["Transportation", sel.transportation || "—"],
                      ["Accommodation", sel.accommodation || "—"],
                      ["Requested Budget", `₹${sel.requestedBudget.toLocaleString("en-IN")}`],
                      ["Approved Budget", sel.approvedBudget ? `₹${sel.approvedBudget.toLocaleString("en-IN")}` : "—"],
                      ["Approved By", sel.approvedBy || "—"],
                    ].map(([label, value], i) => (
                      <div key={i}>
                        <p style={{ fontSize: "11px", color: "#718096", textTransform: "uppercase", marginBottom: "2px" }}>{label}</p>
                        <p style={{ fontWeight: 500 }}>{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Post-Travel Report Section */}
                  {(sel.status === "Expense Submitted" || sel.status === "Reimbursement Approved") && (
                    <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
                      <h4 style={{ marginBottom: "12px", color: "#1e293b", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>Post-Travel Report</h4>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
                        <div><strong>Trip Title:</strong> {sel.tripTitle}</div>
                        <div><strong>Work Completed:</strong><p style={{ marginTop: "4px", fontSize: "13px" }}>{sel.workCompleted}</p></div>
                        <div><strong>Summary:</strong><p style={{ marginTop: "4px", fontSize: "13px" }}>{sel.travelSummary}</p></div>
                        {sel.finalOutcome && <div><strong>Outcome:</strong><p style={{ marginTop: "4px", fontSize: "13px" }}>{sel.finalOutcome}</p></div>}
                      </div>

                      {sel.expenses && sel.expenses.length > 0 && (
                        <div style={{ marginTop: "16px" }}>
                          <h5 style={{ marginBottom: "8px" }}>Expenses</h5>
                          <table className="data-table" style={{ fontSize: "12px" }}>
                            <thead>
                              <tr><th>Title</th><th>Category</th><th>Amount</th></tr>
                            </thead>
                            <tbody>
                              {sel.expenses.map(exp => (
                                <tr key={exp.id}><td>{exp.title}</td><td>{exp.type}</td><td>₹{exp.actualAmount.toLocaleString()}</td></tr>
                              ))}
                              <tr style={{ fontWeight: "bold", background: "#f1f5f9" }}>
                                <td colSpan={2}>Total Actual Expense</td>
                                <td>₹{sel.actualExpense.toLocaleString()}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}

                      {sel.bills && sel.bills.length > 0 && (
                        <div style={{ marginTop: "16px" }}>
                          <h5 style={{ marginBottom: "8px" }}>Uploaded Bills</h5>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                            {sel.bills.map(bill => (
                              <a key={bill.id} href={`http://localhost:5000${bill.filePath}`} target="_blank" rel="noreferrer" 
                                style={{ fontSize: "12px", color: "#3182ce", textDecoration: "underline", background: "white", padding: "4px 8px", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
                                View Bill #{bill.id}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ marginBottom: "12px" }}>
                    <p style={{ fontSize: "11px", color: "#718096", textTransform: "uppercase", marginBottom: "4px" }}>Request Purpose</p>
                    <p style={{ background: "#f7fafc", padding: "10px", borderRadius: "6px", fontSize: "13px" }}>{sel.purpose}</p>
                  </div>

                  {sel.managerRemarks && (
                    <div style={{ background: "#fffbeb", padding: "10px", borderRadius: "6px", fontSize: "13px", border: "1px solid #fbbf24", marginBottom: "12px" }}>
                      <strong>Manager Remarks:</strong> {sel.managerRemarks}
                    </div>
                  )}
                  
                  {sel.logs && sel.logs.length > 0 && (
                    <div style={{ marginTop: "12px" }}>
                      <p style={{ fontSize: "11px", color: "#718096", textTransform: "uppercase", marginBottom: "6px" }}>Activity Log</p>
                      {sel.logs.map(log => (
                        <div key={log.id} style={{ display: "flex", gap: "8px", fontSize: "12px", marginBottom: "4px", color: "#4a5568" }}>
                          <span style={{ color: "#a0aec0" }}>{new Date(log.timestamp).toLocaleDateString("en-IN")}</span>
                          <span><strong>{log.action}</strong> by {log.performedBy}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
