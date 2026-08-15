"use client";
import AdminTable from "@/components/AdminTable";

export default function SeminarAdminPage() {
  return (
    <AdminTable
      collectionName="seminar_registrations"
      title="Seminar Registrations"
      columns={[
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "department", label: "Department" },
        { key: "ihtName", label: "IHT" },
        { key: "session", label: "Session" },
      ]}
    />
  );
}
