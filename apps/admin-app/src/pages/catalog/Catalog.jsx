import { useState } from "react";
import BrandTable from "./Components/BrandTable";

export default function Catalog() {
  const [activeTab] = useState("brands");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Catalog Management
      </h1>

      {activeTab === "brands" && (
        <BrandTable />
      )}
    </div>
  );
}