import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
      apiVersion: "2026-04-22.dahlia",
    });

    const body = await request.text();
    const sig = request.headers.get("stripe-signature") ?? "";

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET ?? ""
      );
    } catch (err) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId ?? null;
        const plan = session.metadata?.plan ?? null;
        if (!userId || !plan) break;

        await prisma.auditLog.create({
          data: {
            userId,
            action: "stripe.checkout.completed",
            metadata: { plan, sessionId: session.id },
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;

        await prisma.auditLog.create({
          data: {
            userId,
            action: "stripe.subscription.cancelled",
            metadata: { subscriptionId: sub.id },
          },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const userId = invoice.metadata?.userId ?? null;
        if (!userId) break;

        await prisma.auditLog.create({
          data: {
            userId,
            action: "stripe.payment.failed",
            metadata: { invoiceId: invoice.id },
          },
        });
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[STRIPE/WEBHOOK] Error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}