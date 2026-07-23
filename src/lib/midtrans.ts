import { createHash } from "crypto";
import type { PaymentStatus } from "@prisma/client";

const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === "true";
const SNAP_API_BASE = IS_PRODUCTION
  ? "https://app.midtrans.com/snap/v1/transactions"
  : "https://app.sandbox.midtrans.com/snap/v1/transactions";

export function isMidtransConfigured(): boolean {
  return !!process.env.MIDTRANS_SERVER_KEY;
}

/**
 * Simulation mode mimics the gateway locally (no Midtrans account needed):
 * active when no real server key is set, OR explicitly forced with
 * PAYMENT_SIMULATION="true". A configured real key always wins unless forced,
 * so adding real credentials later switches to real payments automatically.
 */
export function isSimulationMode(): boolean {
  if (process.env.PAYMENT_SIMULATION === "true") return true;
  return !isMidtransConfigured();
}

interface CreateSnapArgs {
  orderId: string;
  grossAmount: number; // IDR, integer
  itemName: string;
  customer: { name: string; email?: string | null; phone?: string | null };
}

/**
 * Creates a Snap transaction and returns its token + redirect URL.
 * Throws if the gateway isn't configured or the API rejects the request.
 */
export async function createSnapTransaction(args: CreateSnapArgs): Promise<{ token: string; redirectUrl: string }> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) throw new Error("Payment gateway belum dikonfigurasi (MIDTRANS_SERVER_KEY kosong).");

  const auth = Buffer.from(`${serverKey}:`).toString("base64");
  const amount = Math.round(args.grossAmount);
  const [firstName, ...rest] = args.customer.name.trim().split(/\s+/);

  const res = await fetch(SNAP_API_BASE, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      transaction_details: { order_id: args.orderId, gross_amount: amount },
      item_details: [{ id: args.orderId, price: amount, quantity: 1, name: args.itemName.slice(0, 50) }],
      customer_details: {
        first_name: firstName || "Pendaftar",
        last_name: rest.join(" ") || undefined,
        email: args.customer.email || undefined,
        phone: args.customer.phone || undefined,
      },
    }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.token) {
    const detail = Array.isArray(body.error_messages) ? body.error_messages.join("; ") : body.status_message;
    throw new Error(detail || "Gagal membuat transaksi di payment gateway");
  }
  return { token: body.token, redirectUrl: body.redirect_url };
}

export interface MidtransNotification {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string;
  fraud_status?: string;
  payment_type?: string;
  va_numbers?: { bank: string; va_number: string }[];
  transaction_time?: string;
}

/**
 * Verifies the notification's signature: sha512(order_id + status_code +
 * gross_amount + serverKey) must equal signature_key.
 */
export function verifyNotificationSignature(n: MidtransNotification): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) return false;
  const expected = createHash("sha512")
    .update(n.order_id + n.status_code + n.gross_amount + serverKey)
    .digest("hex");
  return expected === n.signature_key;
}

/**
 * Maps a Midtrans transaction_status (+ fraud_status for card capture) to our
 * PaymentStatus. Returns null for statuses we don't act on.
 */
export function mapTransactionStatus(n: MidtransNotification): PaymentStatus | null {
  switch (n.transaction_status) {
    case "capture":
      return n.fraud_status === "accept" ? "VERIFIED" : n.fraud_status === "deny" ? "FAILED" : "WAITING_PAYMENT";
    case "settlement":
      return "VERIFIED";
    case "pending":
      return "WAITING_PAYMENT";
    case "deny":
    case "cancel":
    case "failure":
      return "FAILED";
    case "expire":
      return "EXPIRED";
    case "refund":
    case "partial_refund":
      return "REFUNDED";
    default:
      return null;
  }
}

// Terminal success statuses that must never be downgraded by a later,
// out-of-order notification.
export const TERMINAL_SUCCESS: PaymentStatus[] = ["VERIFIED", "PAID"];
