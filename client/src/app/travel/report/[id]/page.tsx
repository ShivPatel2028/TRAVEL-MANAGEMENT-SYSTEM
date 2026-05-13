// File: client/src/app/travel/report/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { travelApi } from "@/lib/api";
import { TravelRequest } from "@/lib/types";

interface ExpenseItem {
  title: string;
  type: string;
  actualAmount: number;
  date: string;
  notes: string;
}

export default function TravelReportPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [request, setRequest] = useState<TravelRequest | null>(null);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [report, setReport] = useState({
    tripTitle: "",
    workCompleted: "",
    meetingDetails: "",
    travelSummary: "",
    issuesFaced: "",
    finalOutcome: "",
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    loadRequest();
  }, [id]);

  const loadRequest = async () => {
    try {
      const myRequests = await travelApi.getMyRequests();
      const req = myRequests.find((r: TravelRequest) => r.id === id);
      if (req) {
        setRequest(req);
        setReport(prev => ({ ...prev, tripTitle: `Travel to ${req.toLocation}` }));
      } else {
        router.push("/travel/history");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = () => {
    setExpenses([...expenses, { title: "", type: "Taxi", actualAmount: 0, date: new Date().toISOString().split("T")[0], notes: "" }]);
  };

  const handleRemoveExpense = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const handleExpenseChange = (index: number, field: keyof ExpenseItem, value: any) => {
    const newExpenses = [...expenses];
    newExpenses[index] = { ...newExpenses[index], [field]: value };
    setExpenses(newExpenses);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report.tripTitle || !report.workCompleted || !report.travelSummary) {
      setMsg({ type: "error", text: "Please fill in all required report fields." });
      return;
    }

    setSubmitting(true);
    try {
      await travelApi.submitReport(id, report, expenses, files);
      setMsg({ type: "success", text: "Report and expenses submitted successfully!" });
      setTimeout(() => router.push("/travel/history"), 2000);
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Failed to submit report" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div></div>;

  return (
    <ProtectedRoute>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Header title="Submit Travel Report & Expenses" />

          {msg.text && (
            <div className={msg.type === "success" ? "success-message" : "error-message"}>
              {msg.text}
            </div>
          )}

          <div className="form-card" style={{ marginBottom: "20px", background: "#f8fafc" }}>
            <h3 style={{ borderBottom: "none", marginBottom: "5px" }}>Request Summary</h3>
            <p style={{ fontSize: "14px", color: "#64748b" }}>
              <strong>#{id}</strong> | {request?.fromLocation} to {request?.toLocation} | {new Date(request?.travelDate!).toLocaleDateString()} - {new Date(request?.returnDate!).toLocaleDateString()}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Travel Report Section */}
            <div className="form-card">
              <h3>Part 1: Travel Report</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Trip Title *</label>
                  <input
                    className="form-input"
                    value={report.tripTitle}
                    onChange={e => setReport({ ...report, tripTitle: e.target.value })}
                    placeholder="e.g., Client Visit in Singapore"
                  />
                </div>
                <div className="form-group">
                  <label>Work Completed *</label>
                  <textarea
                    className="form-textarea"
                    value={report.workCompleted}
                    onChange={e => setReport({ ...report, workCompleted: e.target.value })}
                    placeholder="Describe the work finished during the trip"
                    rows={4}
                  />
                </div>
                <div className="form-group">
                  <label>Meeting Details</label>
                  <textarea
                    className="form-textarea"
                    value={report.meetingDetails}
                    onChange={e => setReport({ ...report, meetingDetails: e.target.value })}
                    placeholder="Who did you meet? What were the key points?"
                    rows={4}
                  />
                </div>
                <div className="form-group">
                  <label>Travel Summary *</label>
                  <textarea
                    className="form-textarea"
                    value={report.travelSummary}
                    onChange={e => setReport({ ...report, travelSummary: e.target.value })}
                    placeholder="General summary of the travel"
                    rows={4}
                  />
                </div>
                <div className="form-group">
                  <label>Issues Faced</label>
                  <textarea
                    className="form-textarea"
                    value={report.issuesFaced}
                    onChange={e => setReport({ ...report, issuesFaced: e.target.value })}
                    placeholder="Any delays, cancellations, or problems?"
                    rows={4}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Final Outcome / Notes</label>
                  <textarea
                    className="form-textarea"
                    value={report.finalOutcome}
                    onChange={e => setReport({ ...report, finalOutcome: e.target.value })}
                    placeholder="Final results or any additional notes"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Expenses Section */}
            <div className="form-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3>Part 2: Expense Details</h3>
                <button type="button" className="btn btn-sm btn-outline" onClick={handleAddExpense}>
                  + Add Expense
                </button>
              </div>

              {expenses.length === 0 ? (
                <p style={{ textAlign: "center", color: "#94a3b8", padding: "20px" }}>No expenses added. Click "Add Expense" to start.</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Amount (₹)</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((exp, index) => (
                        <tr key={index}>
                          <td>
                            <input
                              className="form-input"
                              value={exp.title}
                              onChange={e => handleExpenseChange(index, "title", e.target.value)}
                              placeholder="e.g., Dinner at Hotel"
                            />
                          </td>
                          <td>
                            <select
                              className="form-select"
                              value={exp.type}
                              onChange={e => handleExpenseChange(index, "type", e.target.value)}
                            >
                              <option value="Hotel">Hotel</option>
                              <option value="Flight">Flight</option>
                              <option value="Train">Train</option>
                              <option value="Taxi">Taxi</option>
                              <option value="Food">Food</option>
                              <option value="Other">Other</option>
                            </select>
                          </td>
                          <td>
                            <input
                              className="form-input"
                              type="date"
                              value={exp.date}
                              onChange={e => handleExpenseChange(index, "date", e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              className="form-input"
                              type="number"
                              value={exp.actualAmount}
                              onChange={e => handleExpenseChange(index, "actualAmount", parseFloat(e.target.value))}
                            />
                          </td>
                          <td>
                            <button type="button" className="btn btn-sm btn-danger" onClick={() => handleRemoveExpense(index)}>
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Bills Section */}
            <div className="form-card">
              <h3>Part 3: Bill Uploads</h3>
              <div className="form-group">
                <label>Select Files (PDF, JPG, PNG)</label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="form-input"
                  onChange={handleFileChange}
                />
              </div>

              {files.length > 0 && (
                <div style={{ marginTop: "15px" }}>
                  <p style={{ fontSize: "14px", fontWeight: 600, marginBottom: "10px" }}>Selected Files:</p>
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {files.map((file, index) => (
                      <li key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px", background: "#f1f5f9", borderRadius: "4px", marginBottom: "5px", fontSize: "13px" }}>
                        <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                        <button type="button" style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer" }} onClick={() => handleRemoveFile(index)}>Remove</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginBottom: "40px" }}>
              <button type="button" className="btn btn-outline" onClick={() => router.push("/travel/history")}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Travel Report & Bills"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  );
}
