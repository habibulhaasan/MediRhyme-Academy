"use client";
import AdminTable from "@/components/AdminTable";

export default function StudentsAdminPage() {
  return (
    <AdminTable
      collectionName="students"
      title="Student Registrations"
      columns={[
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "department", label: "Department" },
        { key: "ihtName", label: "IHT" },
        { key: "session", label: "Session" },
        { key: "paymentAmount", label: "Amount" },
        { key: "trnxId", label: "Trnx ID" },
        { key: "paymentStatus", label: "Payment" },
      ]}
    />
  );
}
