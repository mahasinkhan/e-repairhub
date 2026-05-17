import { useParams } from "react-router-dom";

export default function OrderDetails() {
  const { orderId } = useParams();
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Order Details Page</h1>
      <p className="mt-2 text-sm text-slate-500">Order ID: {orderId || "—"}</p>
      <p className="mt-1 text-sm text-slate-500">Paste order detail UI here.</p>
    </div>
  );
}
