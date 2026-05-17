// Repair.jsx

import React, { useState } from "react";
import "./../styles/repair.css";

import {
  Search,
  Wrench,
  Clock3,
  CheckCircle2,
  Eye,
} from "lucide-react";

const Repair = () => {

  const [repairs, setRepairs] = useState([
    {
      id: "REP-1021",
      customer: "Rahul Sharma",
      email: "rahul@gmail.com",
      device: "iPhone 13 Pro",
      issue: "Display Damage",
      technician: "Aman",
      status: "Repairing",
      date: "May 09, 2026",
    },
    {
      id: "REP-1022",
      customer: "Neha Singh",
      email: "neha@gmail.com",
      device: "Samsung S22",
      issue: "Battery Issue",
      technician: "Rahul",
      status: "Pending",
      date: "May 08, 2026",
    },
    {
      id: "REP-1023",
      customer: "Priya Patel",
      email: "priya@gmail.com",
      device: "iPhone 12",
      issue: "Charging Port",
      technician: "Vikas",
      status: "Completed",
      date: "May 08, 2026",
    },
  ]);

  // STATUS UPDATE

  const updateStatus = (id, newStatus) => {

    const updatedRepairs = repairs.map((repair) => {

      if (repair.id === id) {
        return {
          ...repair,
          status: newStatus,
        };
      }

      return repair;

    });

    setRepairs(updatedRepairs);

  };

  // REMOVE COMPLETED FROM REPAIR PAGE

  const activeRepairs = repairs.filter(
    (repair) => repair.status !== "Completed"
  );

  return (

    <div className="repair-page">

      {/* HEADER */}

    
      {/* CARDS */}

      <div className="repair-cards">

        <div className="repair-card pending-card">

          <div>
            <h3>Pending Repairs</h3>
            <h2>
              {
                repairs.filter(
                  (item) => item.status === "Pending"
                ).length
              }
            </h2>
          </div>

          <div className="repair-icon">
            <Clock3 />
          </div>

        </div>

        <div className="repair-card repairing-card">

          <div>
            <h3>Repairing</h3>
            <h2>
              {
                repairs.filter(
                  (item) => item.status === "Repairing"
                ).length
              }
            </h2>
          </div>

          <div className="repair-icon">
            <Wrench />
          </div>

        </div>

        <div className="repair-card completed-card">

          <div>
            <h3>Completed Repairs</h3>
            <h2>
              {
                repairs.filter(
                  (item) => item.status === "Completed"
                ).length
              }
            </h2>
          </div>

          <div className="repair-icon">
            <CheckCircle2 />
          </div>

        </div>

      </div>

      {/* SEARCH */}

      <div className="repair-search">

        <Search size={18} />

        <input
          type="text"
          placeholder="Search repair orders..."
        />

      </div>

      {/* TABLE */}

      <div className="repair-table-wrapper">

        <table className="repair-table">

          <thead>

            <tr>
              <th>Repair ID</th>
              <th>Customer</th>
              <th>Device</th>
              <th>Issue</th>
              <th>Technician</th>
              <th>Status</th>
              <th>Update Status</th>
              
            </tr>

          </thead>

          <tbody>

            {activeRepairs.map((repair, index) => (

              <tr key={index}>

                <td>{repair.id}</td>

                <td>

                  <div className="customer-info">

                    <div className="avatar">
                      {repair.customer.charAt(0)}
                    </div>

                    <div>
                      <h4>{repair.customer}</h4>
                      <p>{repair.email}</p>
                    </div>

                  </div>

                </td>

                <td>{repair.device}</td>

                <td>{repair.issue}</td>

                <td>{repair.technician}</td>

                <td>

                  <span
                    className={`status-badge ${repair.status.toLowerCase()}`}
                  >
                    {repair.status}
                  </span>

                </td>

                {/* STATUS UPDATE */}

                <td>

                  <select
                    className="status-select"
                    value={repair.status}
                    onChange={(e) =>
                      updateStatus(repair.id, e.target.value)
                    }
                  >

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Repairing">
                      Repairing
                    </option>

                    <option value="Completed">
                      Completed
                    </option>

                  </select>

                </td>

             

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );
};

export default Repair;