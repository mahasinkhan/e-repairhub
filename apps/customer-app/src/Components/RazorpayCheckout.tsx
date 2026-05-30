const BASE = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:3000";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if ((window as any).Razorpay) { resolve(true); return; }
    const script    = document.createElement("script");
    script.src      = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload   = () => resolve(true);
    script.onerror  = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface RazorpayCheckoutOptions {
  orderNumber:   string;
  amount:        number;
  customerName:  string;
  customerPhone: string;
  description:   string;
  onSuccess:     (paymentId: string) => void;
  onFailure:     (error: string) => void;
}

export async function openRazorpayCheckout(opts: RazorpayCheckoutOptions): Promise<void> {
  // Load Razorpay script
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    opts.onFailure("Failed to load payment gateway. Check your internet connection.");
    return;
  }

  // Create Razorpay order on backend
  let rzpOrder: any;
  let keyId: string;
  try {
    const res = await fetch(`${BASE}/payments/customer/create-order`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ orderNumber: opts.orderNumber }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Failed to create payment order");
    rzpOrder = data.data.razorpayOrder;
    keyId    = data.data.keyId;
  } catch (e: any) {
    opts.onFailure(e.message || "Failed to initialize payment. Please try again.");
    return;
  }

  // Open Razorpay checkout modal
  const rzp = new (window as any).Razorpay({
    key:         keyId,
    amount:      rzpOrder.amount,      // already in paise from backend
    currency:    rzpOrder.currency,
    order_id:    rzpOrder.id,
    name:        "E-RepairHub",
    description: opts.description,
    image:       "https://i.imgur.com/n5tjHFD.png",
    prefill: {
      name:    opts.customerName,
      contact: opts.customerPhone,
    },
    notes: {
      orderNumber: opts.orderNumber,
    },
    theme: {
      color: "#f97316",
    },
    modal: {
      ondismiss: () => {
        opts.onFailure("Payment cancelled");
      },
    },
    handler: async (response: {
      razorpay_order_id:   string;
      razorpay_payment_id: string;
      razorpay_signature:  string;
    }) => {
      // Verify signature on backend
      try {
        const verifyRes = await fetch(`${BASE}/payments/customer/verify`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            razorpayOrderId:   response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          }),
        });
        const verifyData = await verifyRes.json();
        if (!verifyData.success) throw new Error(verifyData.message || "Payment verification failed");
        opts.onSuccess(response.razorpay_payment_id);
      } catch (e: any) {
        opts.onFailure(e.message || "Payment verification failed. Contact support.");
      }
    },
  });

  rzp.open();
}