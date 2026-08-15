"use client";
import AdminTable from "@/components/AdminTable";

export default function McqAdminPage() {
  return (
    <AdminTable
      collectionName="mcq_registrations"
      title="MCQ / Free Model Test Registrations"
      columns={[
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "ihtName", label: "IHT" },
        { key: "department", label: "Department" },
        { key: "examType", label: "Exam Type" },
      ]}
    />
  );
}
