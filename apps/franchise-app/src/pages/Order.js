// ordersStore.js
// Shared state between Orders and Delivery pages
// Use this as a simple module-level store (or replace with Context/Redux as needed)

export const initialOrders = [
  {
    id: "ORD-1021",
    customer: "Rahul Sharma",
    email: "rahul@gmail.com",
    device: "iPhone 13 Pro",
    status: "Completed",
    date: "May 08, 2026",
    amount: "₹7,500",
    assignedTo: null,
    pickedUp: false,
  },
  {
    id: "ORD-1022",
    customer: "Aman Verma",
    email: "aman@gmail.com",
    device: "Samsung S22",
    status: "Repairing",
    date: "May 08, 2026",
    amount: "₹3,200",
    assignedTo: null,
    pickedUp: false,
  },
  {
    id: "ORD-1023",
    customer: "Neha Singh",
    email: "neha@gmail.com",
    device: "OnePlus 11",
    status: "Pending",
    date: "May 07, 2026",
    amount: "₹2,400",
    assignedTo: null,
    pickedUp: false,
  },
  {
    id: "ORD-1024",
    customer: "Vikas Yadav",
    email: "vikas@gmail.com",
    device: "Realme GT",
    status: "Completed",
    date: "May 07, 2026",
    amount: "₹4,500",
    assignedTo: null,
    pickedUp: false,
  },
  {
    id: "ORD-1025",
    customer: "Priya Patel",
    email: "priya@gmail.com",
    device: "iPhone 12",
    status: "Cancelled",
    date: "May 06, 2026",
    amount: "₹1,800",
    assignedTo: null,
    pickedUp: false,
  },
  {
    id: "ORD-1026",
    customer: "Karan Mehta",
    email: "karan@gmail.com",
    device: "Redmi Note 13",
    status: "Delivered",
    date: "May 06, 2026",
    amount: "₹2,900",
    assignedTo: null,
    pickedUp: false,
  },
];

export const deliveryBoys = [
  { id: "DB-01", name: "Ravi Kumar" },
  { id: "DB-02", name: "Suresh Pal" },
  { id: "DB-03", name: "Deepak Singh" },
];
