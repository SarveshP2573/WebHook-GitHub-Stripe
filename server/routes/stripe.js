const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const StripeLog = require('../db/StripeLog');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


// =====================================================
// CREATE INVOICE
// =====================================================
router.post('/create-invoice', async (req, res) => {
  try {
    const { email, amount, description, currency, name } = req.body;
    const numericAmount      = Number(amount);
    const resolvedCurrency   = currency || 'usd';
    const resolvedDescription = description || 'Service Fee';

    if (!email || isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: 'Valid email and amount required' });
    }

    // 1️⃣ Create customer
    const customer = await stripe.customers.create({
      email,
      ...(name && { name }),
    });

    // 2️⃣ Create invoice first (empty shell)
    const invoice = await stripe.invoices.create({
      customer:          customer.id,
      collection_method: 'send_invoice',
      days_until_due:    7,
      auto_advance:      false,
    });

    // 3️⃣ Attach line item directly to the invoice
    await stripe.invoiceItems.create({
      customer:    customer.id,
      invoice:     invoice.id,   // ✅ explicit link — prevents floating items
      amount:      Math.round(numericAmount * 100),
      currency:    resolvedCurrency,
      description: resolvedDescription,
    });

    // 4️⃣ Finalize — triggers PDF generation
    await stripe.invoices.finalizeInvoice(invoice.id);

    // 5️⃣ Re-fetch after finalization to get correct amount_due + invoice_pdf
    const finalized = await stripe.invoices.retrieve(invoice.id);

    console.log('📄 Invoice finalized:', {
      id:         finalized.id,
      amount_due: finalized.amount_due,
      status:     finalized.status,
      lines:      finalized.lines?.data?.length,
      has_pdf:    !!finalized.invoice_pdf,
    });

    // 6️⃣ Guard — should never happen after finalization but just in case
    if (!finalized.invoice_pdf) {
      throw new Error('PDF not generated — invoice may not have finalized correctly');
    }

    return res.json({
      invoiceId:  finalized.id,
      invoicePdf: finalized.invoice_pdf,
      total:      finalized.amount_due / 100,
      currency:   finalized.currency.toUpperCase(),
    });

  } catch (error) {
    console.error('❌ Stripe Error:', error);
    return res.status(500).json({
      message: error.message,
      type:    error.type,
      param:   error.param,
    });
  }
});


// =====================================================
// STRIPE WEBHOOK
// =====================================================
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('✅ Webhook received:', event.type);

  try {
    // Deduplicate — skip if already stored
    const exists = await StripeLog.findOne({ eventId: event.id });
    if (!exists) {
      await StripeLog.create({
        eventId: event.id,
        type:    event.type,
        data:    event.data.object,
      });
    }
  } catch (dbErr) {
    // Log DB errors but still ACK Stripe so it doesn't retry
    console.error('❌ DB error saving webhook:', dbErr.message);
  }

  return res.json({ received: true });
});


// =====================================================
// GET STRIPE LOGS
// =====================================================
router.get('/logs', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);

    const logs = await StripeLog.find()
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.json(logs);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


// =====================================================
// GET ANALYTICS SUMMARY
// =====================================================
router.get('/analytics', async (req, res) => {
  try {
    const logs = await StripeLog.find().sort({ createdAt: -1 });

    const paidLogs   = logs.filter(l =>
      l.type === 'invoice.paid' || l.type === 'payment_intent.succeeded'
    );
    const failedLogs = logs.filter(l => l.type?.includes('failed'));

    // Total revenue in cents → dollars
    const totalRevenue = paidLogs.reduce((sum, l) => {
      return sum + (l.data?.amount_paid ?? l.data?.amount ?? 0);
    }, 0) / 100;

    // Revenue grouped by calendar day
    const revenueByDay = {};
    paidLogs.forEach(l => {
      const day = new Date(l.createdAt).toISOString().slice(0, 10);
      revenueByDay[day] = (revenueByDay[day] ?? 0) +
        (l.data?.amount_paid ?? l.data?.amount ?? 0) / 100;
    });

    // Top customers by total spend
    const custMap = {};
    paidLogs.forEach(l => {
      const email = l.data?.customer_email ?? l.data?.receipt_email;
      if (!email) return;
      if (!custMap[email]) custMap[email] = { email, total: 0, count: 0 };
      custMap[email].total += (l.data?.amount_paid ?? l.data?.amount ?? 0) / 100;
      custMap[email].count += 1;
    });
    const topCustomers = Object.values(custMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Event type counts
    const typeMap = {};
    logs.forEach(l => { typeMap[l.type] = (typeMap[l.type] ?? 0) + 1; });
    const eventBreakdown = Object.entries(typeMap)
      .sort((a, b) => b[1] - a[1]);

    const total = paidLogs.length + failedLogs.length;

    return res.json({
      totalRevenue,
      totalEvents:    logs.length,
      paidCount:      paidLogs.length,
      failedCount:    failedLogs.length,
      successRate:    total > 0
        ? ((paidLogs.length / total) * 100).toFixed(1)
        : null,
      revenueByDay,
      topCustomers,
      eventBreakdown,
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


// =====================================================
// GET INVOICES DIRECTLY FROM STRIPE
// =====================================================
router.get('/invoices', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);

    const invoices = await stripe.invoices.list({
      limit,
      expand: ['data.customer'],
    });

    const mapped = invoices.data.map(inv => ({
      id:                  inv.id,
      customer_email:      inv.customer_email ?? inv.customer?.email,
      customer_name:       inv.customer_name  ?? inv.customer?.name,
      amount_due:          inv.amount_due,
      amount_paid:         inv.amount_paid,
      currency:            inv.currency,
      status:              inv.status,
      created:             inv.created,
      invoice_pdf:         inv.invoice_pdf,
      hosted_invoice_url:  inv.hosted_invoice_url,
    }));

    return res.json({ data: mapped, hasMore: invoices.has_more });

  } catch (error) {
    console.error('❌ Stripe invoices error:', error);
    return res.status(500).json({ error: error.message });
  }
});


module.exports = router;