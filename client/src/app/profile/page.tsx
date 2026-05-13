"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { userApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { User } from "@/lib/types";

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const data = await userApi.getProfile(); setProfile(data); setEditName(data.name); setEditPhone(data.phoneNumber); }
    catch { /* handled */ } finally { setLoading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userApi.updateProfile({ name: editName, phoneNumber: editPhone });
      setMsg({ type: "success", text: "Profile updated successfully!" });
      setEditing(false);
      load();
    } catch (err: unknown) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "Update failed" });
    }
    setTimeout(() => setMsg({ type: "", text: "" }), 4000);
  };

  const fields = profile ? [
    { label: "Employee ID", value: profile.employeeId },
    { label: "Username", value: profile.username || "—" },
    { label: "Full Name", value: profile.name },
    { label: "Email Address", value: profile.email },
    { label: "Phone Number", value: profile.phoneNumber || "—" },
    { label: "Department", value: profile.department || "—" },
    { label: "Designation", value: profile.designation || "—" },
    { label: "Role", value: profile.role },
    { label: "Account Status", value: profile.isActive ? "Active" : "Inactive" },
    { label: "Joining Date", value: new Date(profile.joiningDate).toLocaleDateString("en-IN") },
    { label: "Member Since", value: new Date(profile.createdAt).toLocaleDateString("en-IN") },
  ] : [];

  return (
    <ProtectedRoute>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Header title="My Profile" />
          {msg.text && <div className={msg.type === "success" ? "success-message" : "error-message"}>{msg.text}</div>}
          {loading ? <div className="loading-inline">Loading profile...</div> : profile && (
            <>
              <div className="profile-card">
                <div className="profile-header">
                  <div className="profile-avatar">{profile.name.charAt(0).toUpperCase()}</div>
                  <div className="profile-info">
                    <h2>{profile.name}</h2>
                    <p>{profile.designation || profile.role} • {profile.department || "No Department"}</p>
                    <p style={{ marginTop: "4px", fontSize: "13px", color: "#718096" }}>{profile.employeeId} • {profile.email}</p>
                    <span className={`status-badge ${profile.isActive ? "badge-active" : "badge-inactive"}`} style={{ marginTop: "6px", display: "inline-block" }}>
                      {profile.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="profile-details">
                  {fields.map(({ label, value }) => (
                    <div className="detail-item" key={label}>
                      <p className="detail-label">{label}</p>
                      <p className="detail-value">{value}</p>
                    </div>
                  ))}
                </div>

                {!editing && (
                  <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #e2e8f0" }}>
                    <button className="btn btn-outline" onClick={() => setEditing(true)}>✏️ Edit Profile</button>
                    <small style={{ marginLeft: "12px", color: "#718096" }}>You can update your name and phone number.</small>
                  </div>
                )}
              </div>

              {editing && (
                <div className="form-card">
                  <h3>Edit Profile</h3>
                  <form onSubmit={handleSave}>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Full Name</label>
                        <input className="form-input" value={editName} onChange={e => setEditName(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Phone Number</label>
                        <input className="form-input" value={editPhone} onChange={e => setEditPhone(e.target.value)} />
                      </div>
                    </div>
                    <p style={{ fontSize: "12px", color: "#718096", marginBottom: "12px" }}>
                      To update email, department, designation or role, please contact your manager or HR.
                    </p>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
                      <button type="submit" className="btn btn-primary">Save Changes</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="section-card">
                <h3>Company Information</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
                  <div><p style={{ color: "#718096" }}>Company</p><p style={{ fontWeight: 500 }}>TravelCorp Pvt. Ltd.</p></div>
                  <div><p style={{ color: "#718096" }}>HR Email</p><p style={{ fontWeight: 500 }}>hr@company.com</p></div>
                  <div><p style={{ color: "#718096" }}>IT Support</p><p style={{ fontWeight: 500 }}>itsupport@company.com</p></div>
                  <div><p style={{ color: "#718096" }}>Finance</p><p style={{ fontWeight: 500 }}>finance@company.com</p></div>
                </div>
              </div>
              <div style={{ textAlign: "center", padding: "40px", color: "#718096", fontSize: "14px" }}>
                 <p>© 2026 TravelCorp. All rights reserved.</p>
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
