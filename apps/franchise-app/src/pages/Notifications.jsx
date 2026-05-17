// Notifications.jsx

import React, { useState } from "react";
import "./../styles/notifications.css";

import {
  Bell,
  CheckCircle2,
  Clock3,
  Truck,
  Wrench,
  AlertTriangle,
  Search,
  PackageCheck,
  ClipboardList,
  MailOpen,
} from "lucide-react";

const Notifications = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const notifications = [
    {
      id: 1,
      title: "New Repair Assigned",
      message:
        "A new iPhone 13 Pro repair order has been assigned to your franchise.",
      time: "2 min ago",
      type: "Repair",
      status: "Unread",
      icon: <Wrench size={20} />,
      iconClass: "icon-repair",
    },
    {
      id: 2,
      title: "Repair Completed",
      message: "Samsung S22 repair has been completed successfully.",
      time: "15 min ago",
      type: "Completed",
      status: "Read",
      icon: <CheckCircle2 size={20} />,
      iconClass: "icon-completed",
    },
    {
      id: 3,
      title: "Pickup Delayed",
      message: "Delivery agent is delayed for order ORD-1024 pickup.",
      time: "30 min ago",
      type: "Delivery",
      status: "Unread",
      icon: <Truck size={20} />,
      iconClass: "icon-delivery",
    },
    {
      id: 4,
      title: "Pending Repair Reminder",
      message: "3 repair orders are still pending for more than 24 hours.",
      time: "1 hour ago",
      type: "Pending",
      status: "Unread",
      icon: <Clock3 size={20} />,
      iconClass: "icon-pending",
    },
    {
      id: 5,
      title: "Spare Part Required",
      message: "Display replacement part required for iPhone 12 repair.",
      time: "2 hours ago",
      type: "Alert",
      status: "Read",
      icon: <AlertTriangle size={20} />,
      iconClass: "icon-alert",
    },
  ];

  const unreadCount = notifications.filter((n) => n.status === "Unread").length;

  const filteredNotifications = notifications
    .filter((item) => activeFilter === "All" || item.status === activeFilter)
    .filter(
      (item) =>
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.message.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="notifications-page">

      {/* HEADER ROW — filters left, bell right */}
      <div className="notifications-topbar">

        {/* FILTERS */}
        <div className="filter-buttons">
          {["All", "Unread", "Read"].map((filter) => (
            <button
              key={filter}
              className={activeFilter === filter ? "active-filter" : ""}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
              {filter === "Unread" && unreadCount > 0 && (
                <span className="filter-badge">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* BELL ICON — top right */}
        <div className="bell-wrapper">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="bell-badge">{unreadCount}</span>
          )}
        </div>

      </div>

      {/* SEARCH */}
      <div className="notification-search">
        <Search size={17} className="search-icon" />
        <input
          type="text"
          placeholder="Search notifications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* STATS CARDS */}
      <div className="notification-stats">

        <div className="stats-card">
          <div className="stats-icon icon-stats-total">
            <ClipboardList size={20} />
          </div>
          <div className="stats-info">
            <h3>Total Notifications</h3>
            <h2>{notifications.length}</h2>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon icon-stats-unread">
            <Bell size={20} />
          </div>
          <div className="stats-info">
            <h3>Unread Alerts</h3>
            <h2>{unreadCount}</h2>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon icon-stats-completed">
            <PackageCheck size={20} />
          </div>
          <div className="stats-info">
            <h3>Completed Repairs</h3>
            <h2>12</h2>
          </div>
        </div>

      </div>

      {/* NOTIFICATION LIST */}
      <div className="notification-list">

        {filteredNotifications.length === 0 ? (
          <div className="no-notifications">
            <MailOpen size={36} />
            <p>No notifications found</p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              className={`notification-card ${
                item.status === "Unread" ? "unread-card" : ""
              }`}
            >
              {/* LEFT */}
              <div className="notification-left">

                <div className={`notification-icon ${item.iconClass}`}>
                  {item.icon}
                </div>

                <div className="notification-content">
                  <div className="notification-top">
                    <h3>{item.title}</h3>
                    <span className="time">{item.time}</span>
                  </div>
                  <p>{item.message}</p>
                </div>

              </div>

              {/* RIGHT */}
              <div className="notification-right">
                <span className={`notification-status ${item.status.toLowerCase()}`}>
                  {item.status}
                </span>
              </div>

            </div>
          ))
        )}

      </div>

    </div>
  );
};

export default Notifications;
