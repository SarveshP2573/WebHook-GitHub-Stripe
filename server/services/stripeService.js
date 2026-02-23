const Stripe = require('stripe');
const StripeEvent = require('../db/StripeEvent');
const StripeInvoice = require('../db/StripeInvoice');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.handleWebhook = async (req) => {
  const sig = req.headers['stripe-signature'];

  // =====================================================
  // VERIFY WEBHOOK SIGNATURE
  // =====================================================
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    throw new Error('Invalid Stripe Signature');
  }

  console.log('🔔 Stripe Event:', event.type);

  // =====================================================
  // DEDUPLICATION — skip if already processed
  // =====================================================
  const existing = await StripeEvent.findOne({ eventId: event.id });
  if (existing) {
    console.log('⚠️ Duplicate event, skipping:', event.id);
    return;
  }

  // =====================================================
  // SAVE RAW EVENT LOG
  // =====================================================
  await StripeEvent.create({
    eventId: event.id,
    eventType: event.type,
    status: 'pending',
    rawPayload: event,
  });

  const obj = event.data.object;

  // =====================================================
  // HANDLE: invoice.paid
  // =====================================================
  if (event.type === 'invoice.paid') {
    await StripeEvent.updateOne(
      { eventId: event.id },
      {
        status: 'success',
        amount: obj.amount_paid / 100,
        currency: obj.currency,
        email: obj.customer_email,
      }
    );

    await StripeInvoice.findOneAndUpdate(
      { invoiceId: obj.id },
      {
        invoiceId: obj.id,
        paymentIntentId: obj.payment_intent,
        customerEmail: obj.customer_email,
        amount: obj.amount_paid / 100,
        currency: obj.currency,
        status: 'paid',
      },
      { upsert: true, new: true }
    );

    console.log('✅ Invoice paid:', obj.id, '| Amount:', obj.amount_paid / 100, obj.currency);
  }

  // =====================================================
  // HANDLE: invoice.payment_failed
  // =====================================================
  else if (event.type === 'invoice.payment_failed') {
    await StripeEvent.updateOne(
      { eventId: event.id },
      {
        status: 'failed',
        amount: obj.amount_due / 100,
        currency: obj.currency,
        email: obj.customer_email,
      }
    );

    await StripeInvoice.findOneAndUpdate(
      { invoiceId: obj.id },
      {
        invoiceId: obj.id,
        customerEmail: obj.customer_email,
        amount: obj.amount_due / 100,
        currency: obj.currency,
        status: 'failed',
      },
      { upsert: true, new: true }
    );

    console.log('❌ Invoice payment failed:', obj.id);
  }

  // =====================================================
  // HANDLE: invoice.finalized
  // =====================================================
  else if (event.type === 'invoice.finalized') {
    await StripeInvoice.findOneAndUpdate(
      { invoiceId: obj.id },
      {
        invoiceId: obj.id,
        customerEmail: obj.customer_email,
        amount: obj.amount_due / 100,
        currency: obj.currency,
        invoicePdf: obj.invoice_pdf,
        status: 'open',
      },
      { upsert: true, new: true }
    );

    console.log('📄 Invoice finalized:', obj.id);
  }

  // =====================================================
  // HANDLE: payment_intent.succeeded
  // =====================================================
  else if (event.type === 'payment_intent.succeeded') {
    await StripeEvent.updateOne(
      { eventId: event.id },
      {
        status: 'success',
        amount: obj.amount / 100,
        currency: obj.currency,
        email: obj.receipt_email,
      }
    );

    console.log('✅ PaymentIntent succeeded:', obj.id);
  }

  // =====================================================
  // HANDLE: payment_intent.payment_failed
  // =====================================================
  else if (event.type === 'payment_intent.payment_failed') {
    await StripeEvent.updateOne(
      { eventId: event.id },
      {
        status: 'failed',
        amount: obj.amount / 100,
        currency: obj.currency,
        email: obj.receipt_email,
      }
    );

    console.log('❌ PaymentIntent failed:', obj.id);
  }

  // =====================================================
  // UNHANDLED EVENT — logged but not processed
  // =====================================================
  else {
    console.log('ℹ️ Unhandled event type (logged only):', event.type);
  }
};