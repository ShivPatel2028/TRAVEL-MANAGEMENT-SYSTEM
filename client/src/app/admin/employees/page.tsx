"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { authApi, userApi } from "@/lib/api";
import { User } from "@/lib/types";

const DEPTS = ["Engineering","Finance","HR","Marketing","Sales","Operations","Administration"];

// Credentials display after employee creation
function CredentialsDialog({ creds, onClose }: { creds: { employeeId: string; username: string; name: string; password: string }; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const text = `Employee Login Credentials\n-------------------------\nName: ${creds.name}\nUsername: ${creds.username}\nEmployee ID: ${creds.employeeId}\nPassword: ${creds.password}\n\nPortal: http://localhost:3000\nPlease change password after first login.`;
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "420px" }}>
        <div className="modal-header">
          <h3>✅ Employee Created</h3>
        </div>
        <p style={{ marginBottom: "12px", fontSize: "13px", color: "#4a5568" }}>
          Share these credentials with <strong>{creds.name}</strong> to log in to the portal.
        </p>
        <div style={{ background: "#f0fff4", border: "1px solid #9ae6b4", borderRadius: "6px", padding: "16px", fontFamily: "monospace", fontSize: "13px", lineHeight: "1.8", marginBottom: "16px" }}>
          <p><strong>Username:</strong> {creds.username}</p>
          <p><strong>Employee ID:</strong> {creds.employeeId}</p>
          <p><strong>Password:</strong> {creds.password}</p>
          <p><strong>Portal:</strong> http://localhost:3000</p>
        </div>
        <div style={{ background: "#fffbeb", border: "1px solid #fbbf24", borderRadius: "6px", padding: "10px 14px", fontSize: "12px", color: "#92400e", marginBottom: "16px" }}>
          ⚠️ Note this password now — it cannot be retrieved later. Ask the employee to change it after first login.
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={copy}>{copied ? "✓ Copied!" : "Copy Credentials"}</button>
          <button className="btn btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [newCreds, setNewCreds] = useState<{ employeeId: string; name: string; password: string } | null>(null);
  const [sel, setSel] = useState<User | null>(null);
  const [addForm, setAddForm] = useState({ employeeId:"", username: "", name:"", email:"", phoneNumber:"", password:"", department:"", designation:"", role:"Employee" });
  const [editForm, setEditForm] = useState({ name:"", email:"", phoneNumber:"", department:"", designation:"", role:"", isActive:true });
  const [newPwd, setNewPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setEmployees(await userApi.getAllEmployees()); }
    catch { /* handled */ } finally { setLoading(false); }
  };

  const showMsg = (type: string, text: string) => { setMsg({ type, text }); setTimeout(() => setMsg({ type:"", text:"" }), 4000); };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authApi.createEmployee(addForm);
      // Show credentials dialog
      setNewCreds({ employeeId: addForm.employeeId, username: addForm.username, name: addForm.name, password: addForm.password });
      setShowAdd(false);
      setAddForm({ employeeId:"", username: "", name:"", email:"", phoneNumber:"", password:"", department:"", designation:"", role:"Employee" });
      load();
    } catch (err: unknown) { showMsg("error", err instanceof Error ? err.message : "Failed"); }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sel) return;
    try { await userApi.updateEmployee(sel.id, editForm); showMsg("success","Employee updated!"); setShowEdit(false); load(); }
    catch (err: unknown) { showMsg("error", err instanceof Error ? err.message : "Failed"); }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sel) return;
    try {
      await userApi.resetPassword(sel.id, newPwd);
      // Show new credentials after reset too
      setNewCreds({ employeeId: sel.employeeId, name: sel.name, password: newPwd });
      setShowReset(false); setNewPwd("");
    } catch (err: unknown) { showMsg("error", err instanceof Error ? err.message : "Failed"); }
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm("Deactivate this employee? They will no longer be able to log in.")) return;
    try { await userApi.deleteEmployee(id); showMsg("success","Employee deactivated."); load(); }
    catch (err: unknown) { showMsg("error", err instanceof Error ? err.message : "Failed"); }
  };

  const openEdit = (emp: User) => { setSel(emp); setEditForm({ name:emp.name, email:emp.email, phoneNumber:emp.phoneNumber, department:emp.department||"", designation:emp.designation||"", role:emp.role, isActive:emp.isActive }); setShowEdit(true); };
  const openReset = (emp: User) => { setSel(emp); setNewPwd(""); setShowReset(true); };

  const filtered = employees.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.employeeId.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = !deptFilter || e.department === deptFilter;
    return matchSearch && matchDept;
  });

  return (
    <ProtectedRoute requiredRoles={["Admin","Manager"]}>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Header title="Employee Management" />

          {msg.text && <div className={msg.type === "success" ? "success-message" : "error-message"}>{msg.text}</div>}

          {/* Credentials Dialog after creation/reset */}
          {newCreds && <CredentialsDialog creds={newCreds} onClose={() => setNewCreds(null)} />}

          <div className="data-table-wrapper">
            <div className="table-header">
              <h3>All Employees ({filtered.length})</h3>
              <div className="table-actions">
                <input className="search-input" placeholder="Search by name, ID, email..." value={search} onChange={e => setSearch(e.target.value)} />
                <select className="filter-select" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                  <option value="">All Departments</option>
                  {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Employee</button>
              </div>
            </div>

            {loading ? <div className="loading-inline">Loading employees...</div> : filtered.length === 0 ? (
              <div className="empty-state"><p>No employees found.</p></div>
            ) : (
              <div style={{ overflowX:"auto" }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Emp ID</th><th>Name</th><th>Email</th><th>Department</th><th>Designation</th><th>Role</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map(emp => (
                      <tr key={emp.id}>
                        <td><strong>{emp.employeeId}</strong></td>
                        <td>{emp.name}</td>
                        <td>{emp.email}</td>
                        <td>{emp.department || "—"}</td>
                        <td>{emp.designation || "—"}</td>
                        <td>{emp.role}</td>
                        <td><span className={`status-badge ${emp.isActive ? "badge-active" : "badge-inactive"}`}>{emp.isActive ? "Active" : "Inactive"}</span></td>
                        <td>
                          <div style={{ display:"flex", gap:"6px" }}>
                            <button className="btn btn-sm btn-outline" onClick={() => openEdit(emp)}>Edit</button>
                            <button className="btn btn-sm btn-warning" onClick={() => openReset(emp)}>Reset Pwd</button>
                            {emp.isActive && <button className="btn btn-sm btn-danger" onClick={() => handleDeactivate(emp.id)}>Deactivate</button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add Employee Modal */}
          {showAdd && (
            <div className="modal-overlay" onClick={() => setShowAdd(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header"><h3>Add New Employee</h3><button className="modal-close" onClick={() => setShowAdd(false)}>✕</button></div>
                <form onSubmit={handleAdd}>
                  <div className="form-grid">
                    {([
                      {label:"Employee ID *",field:"employeeId",placeholder:"e.g., EMP005"},
                      {label:"Username *",field:"username",placeholder:"e.g., rahul.s"},
                      {label:"Full Name *",field:"name",placeholder:"Full name"},
                      {label:"Email *",field:"email",placeholder:"email@company.com",type:"email"},
                      {label:"Phone",field:"phoneNumber",placeholder:"Phone number"},
                      {label:"Designation",field:"designation",placeholder:"Job title"},
                    ] as {label:string;field:string;placeholder:string;type?:string}[]).map(({label,field,placeholder,type="text"}) => (
                      <div className="form-group" key={field}>
                        <label>{label}</label>
                        <input className="form-input" type={type} placeholder={placeholder}
                          value={(addForm as Record<string,string>)[field]}
                          onChange={e => setAddForm({...addForm,[field]:e.target.value})}
                          required={label.includes("*")} />
                      </div>
                    ))}
                    <div className="form-group">
                      <label>Department</label>
                      <select className="form-select" value={addForm.department} onChange={e => setAddForm({...addForm,department:e.target.value})}>
                        <option value="">Select</option>
                        {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Role</label>
                      <select className="form-select" value={addForm.role} onChange={e => setAddForm({...addForm,role:e.target.value})}>
                        <option value="Employee">Employee</option>
                        <option value="Manager">Manager</option>
                        <option value="Finance">Finance</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                    <div className="form-group full-width">
                      <label>Password *</label>
                      <div style={{ position:"relative" }}>
                        <input className="form-input" type={showPwd ? "text" : "password"} placeholder="Set initial login password" style={{ paddingRight:"60px" }}
                          value={addForm.password} onChange={e => setAddForm({...addForm,password:e.target.value})} required minLength={6} />
                        <button type="button" onClick={() => setShowPwd(p => !p)}
                          style={{ position:"absolute", right:"10px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:"12px", color:"#718096" }}>
                          {showPwd ? "Hide" : "Show"}
                        </button>
                      </div>
                      <small style={{ color:"#718096", fontSize:"11px" }}>Min 6 characters. Credentials will be shown after creation.</small>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Create Employee</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Employee Modal */}
          {showEdit && sel && (
            <div className="modal-overlay" onClick={() => setShowEdit(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header"><h3>Edit — {sel.employeeId}: {sel.name}</h3><button className="modal-close" onClick={() => setShowEdit(false)}>✕</button></div>
                <form onSubmit={handleEdit}>
                  <div className="form-grid">
                    {([{label:"Name",field:"name"},{label:"Email",field:"email",type:"email"},{label:"Phone",field:"phoneNumber"},{label:"Designation",field:"designation"}] as {label:string;field:string;type?:string}[]).map(({label,field,type="text"}) => (
                      <div className="form-group" key={field}>
                        <label>{label}</label>
                        <input className="form-input" type={type} value={(editForm as Record<string,unknown>)[field] as string} onChange={e => setEditForm({...editForm,[field]:e.target.value})} />
                      </div>
                    ))}
                    <div className="form-group">
                      <label>Department</label>
                      <select className="form-select" value={editForm.department} onChange={e => setEditForm({...editForm,department:e.target.value})}>
                        <option value="">Select</option>
                        {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Role</label>
                      <select className="form-select" value={editForm.role} onChange={e => setEditForm({...editForm,role:e.target.value})}>
                        <option value="Employee">Employee</option>
                        <option value="Manager">Manager</option>
                        <option value="Finance">Finance</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Account Status</label>
                      <select className="form-select" value={editForm.isActive?"active":"inactive"} onChange={e => setEditForm({...editForm,isActive:e.target.value==="active"})}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline" onClick={() => setShowEdit(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Reset Password Modal */}
          {showReset && sel && (
            <div className="modal-overlay" onClick={() => setShowReset(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header"><h3>Reset Password — {sel.name} ({sel.employeeId})</h3><button className="modal-close" onClick={() => setShowReset(false)}>✕</button></div>
                <form onSubmit={handleReset}>
                  <div className="form-group">
                    <label>New Password (min 6 characters)</label>
                    <input className="form-input" type="text" placeholder="Enter new password to share with employee" value={newPwd} onChange={e => setNewPwd(e.target.value)} required minLength={6} />
                    <small style={{ color:"#718096", fontSize:"11px" }}>The new credentials will be shown after reset so you can share them.</small>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline" onClick={() => setShowReset(false)}>Cancel</button>
                    <button type="submit" className="btn btn-warning">Reset & Show Credentials</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          <div style={{ textAlign: "center", padding: "40px", color: "#718096", fontSize: "14px" }}>
              <p>© 2026 TravelCorp. Administrative Portal.</p>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
