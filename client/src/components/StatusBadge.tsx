// File: client/src/components/StatusBadge.tsx
"use client";

export default function StatusBadge({ status }: { status: string }) {
  const getStatusClass = () => {
    switch (status) {
      case "Pending Manager Approval":
      case "Pending Finance Approval":
        return "badge-pending";
      case "Manager Approved":
      case "Finance Approved":
      case "Trip Completed":
        return "badge-approved";
      case "Rejected by Manager":
      case "Rejected by Finance":
        return "badge-rejected";
      case "Expense Submitted":
        return "badge-submitted";
      case "Reimbursement Approved":
        return "badge-reimbursed";
      default:
        return "badge-default";
    }
  };

  return <span className={`status-badge ${getStatusClass()}`}>{status}</span>;
}
