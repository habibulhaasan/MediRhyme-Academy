"use client";
import AdminTable from "@/components/AdminTable";

export default function StudentsAdminPage() {
  return (
    <AdminTable
      collectionName="students"
      title="Student Registrations"
      adminEditableFields={["batch", "payableAmount", "paidAmount", "comments"]}
      columns={[
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "department", label: "Department" },
        { key: "ihtName", label: "IHT" },
        { key: "session", label: "Session" },
        {
          key: "serviceType",
          label: "Service",
          render: (v) => (v === "mcq" ? "MCQ Exam" : "Course"),
        },
        { key: "trnxId", label: "Trnx ID" },
        { key: "paymentStatus", label: "Payment" },
      ]}
    />
  );
}