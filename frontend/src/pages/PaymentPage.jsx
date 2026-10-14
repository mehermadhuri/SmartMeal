import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { paymentAPI, orderAPI } from '../api/api';
import { CheckCircle, Loader, CreditCard, QrCode, Store, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import './Payment.css';

export default function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('UPI'); // 'UPI', 'CARD', 'CANTEEN'

  // Demo card inputs (safe simulation only, never stored as real credentials)
  const [cardName, setCardName] = useState('Student Cardholder');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');

  // Optional manual UTR input for UPI proof
  const [manualUtr, setManualUtr] = useState('');
  const [showUtrInput, setShowUtrInput] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const o = await orderAPI.getById(orderId);
      setOrder(o);
      // Fetch or initiate payment record
      try {
        const p = await paymentAPI.getByOrder(orderId);
        setPayment(p);
      } catch {
        // If not found yet, initiate one
        const init = await paymentAPI.initiate({ orderId: parseInt(orderId), paymentMethod: 'UPI_QR' });
        setPayment(init);
      }
    } catch (err) {
      setError(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentId = () => payment?.id || payment?.paymentId;

  // 1. UPI Sandbox Simulation
  const handleUpiSimulate = async () => {
    if (paying) return;
    setPaying(true);
    setError('');
    try {
      let pid = getPaymentId();
      if (!pid) {
        const init = await paymentAPI.initiate({ orderId: parseInt(orderId), paymentMethod: 'UPI_QR' });
        pid = init.paymentId || init.id;
        setPayment(init);
      }
      const completed = await paymentAPI.simulateSuccess(pid);
      setPayment(completed);
      setTimeout(() => navigate(`/order-confirmation/${orderId}`), 1000);
    } catch (err) {
      setError(err.message || 'Payment simulation failed');
      setPaying(false);
    }
  };

  // 1b. UPI Manual UTR proof submission
  const handleUpiProofSubmit = async (e) => {
    e.preventDefault();
    if (!manualUtr.trim()) {
      setError('Please enter a reference/UTR number');
      return;
    }
    setPaying(true);
    setError('');
    try {
      let pid = getPaymentId();
      if (!pid) {
        const init = await paymentAPI.initiate({ orderId: parseInt(orderId), paymentMethod: 'UPI_QR' });
        pid = init.paymentId || init.id;
      }
      const updated = await paymentAPI.submitProof(pid, { providerReference: manualUtr.trim() });
      setPayment(updated);
      setTimeout(() => navigate(`/order-confirmation/${orderId}`), 1000);
    } catch (err) {
      setError(err.message || 'Failed to submit proof');
      setPaying(false);
    }
  };

  // 2. Card Demo Simulation
  const handleCardSimulate = async (e) => {
    e.preventDefault();
    if (paying) return;
    setPaying(true);
    setError('');
    try {
      let pid = getPaymentId();
      if (!pid) {
        const init = await paymentAPI.initiate({ orderId: parseInt(orderId), paymentMethod: 'CARD_DEMO' });
        pid = init.paymentId || init.id;
        setPayment(init);
      }
      const completed = await paymentAPI.simulateCard(pid);
      setPayment(completed);
      setTimeout(() => navigate(`/order-confirmation/${orderId}`), 1000);
    } catch (err) {
      setError(err.message || 'Card payment simulation failed');
      setPaying(false);
    }
  };

  // 3. Pay at Canteen
  const handlePayAtCanteen = async () => {
    if (paying) return;
    setPaying(true);
    setError('');
    try {
      let pid = getPaymentId();
      if (!pid) {
        const init = await paymentAPI.initiate({ orderId: parseInt(orderId), paymentMethod: 'PAY_AT_CANTEEN' });
        pid = init.paymentId || init.id;
        setPayment(init);
      }
      const completed = await paymentAPI.payAtCanteen(pid);
      setPayment(completed);
      setTimeout(() => navigate(`/order-confirmation/${orderId}`), 1000);
    } catch (err) {
      setError(err.message || 'Failed to confirm Pay at Canteen');
      setPaying(false);
    }
  };

  if (loading) return <div className="spinner" />;

  const isPaid = payment?.status === 'PAID' || order?.paymentStatus === 'PAID';
  const isCanteenPending = payment?.paymentMethod === 'PAY_AT_CANTEEN' || order?.paymentReference?.includes('COUNTER');

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '640px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
            <ArrowLeft size={16} /> View Orders
          </Link>
        </div>

        <div className="page-header">
          <h1><CreditCard size={28} /> Payment Options</h1>
          <p>Order {order?.orderNumber ? `#${order.orderNumber}` : `#${orderId}`}</p>
        </div>

        {error && <div className="alert alert-error"><AlertCircle size={18} /> {error}</div>}

        {/* Order Bill Summary */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <h3 style={{ color: 'var(--primary-dark)', margin: 0 }}>Bill Summary</h3>
              <span className="badge badge-primary">{order?.mealCategory || 'MEAL'}</span>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: '0.85rem' }}>
              🕐 <strong>Pickup Slot:</strong> {order?.pickupSlot || 'Counter Pickup'}
            </div>

            <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '0.65rem', marginBottom: '0.65rem' }}>
              {order?.items?.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '0.35rem 0' }}>
                  <span>{item.itemNameSnapshot || item.menuName} × {item.quantity}</span>
                  <span style={{ fontWeight: 600 }}>₹{item.lineTotal || (item.unitPriceSnapshot * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="payment-amount" style={{ marginBottom: 0 }}>
              <span>Total Payable</span>
              <span className="amount-value">₹{order?.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* If Already Completed */}
        {isPaid || isCanteenPending ? (
          <div className="card payment-card">
            <div className="card-body payment-success">
              <CheckCircle size={52} />
              <h3>{isPaid ? 'Payment Successful!' : 'Order Confirmed (Pay at Canteen)'}</h3>
              <p>
                {isPaid
                  ? 'Your meal has been booked and confirmed.'
                  : `Please pay ₹${order?.totalAmount} at the canteen collection counter.`}
              </p>
              <button
                className="btn btn-success btn-lg"
                style={{ width: '100%', marginTop: '1.25rem' }}
                onClick={() => navigate(`/order-confirmation/${orderId}`)}
              >
                View Official Receipt
              </button>
            </div>
          </div>
        ) : (
          <div className="card payment-card">
            <div className="card-body">
              <h3 style={{ marginBottom: '0.75rem', color: 'var(--gray-800)' }}>Select Payment Method</h3>
              
              {/* Method Tabs */}
              <div className="method-tabs">
                <button
                  type="button"
                  className={`method-tab-btn ${selectedMethod === 'UPI' ? 'active' : ''}`}
                  onClick={() => setSelectedMethod('UPI')}
                >
                  <QrCode size={20} />
                  <span>UPI / QR</span>
                </button>
                <button
                  type="button"
                  className={`method-tab-btn ${selectedMethod === 'CARD' ? 'active' : ''}`}
                  onClick={() => setSelectedMethod('CARD')}
                >
                  <CreditCard size={20} />
                  <span>Card (Demo)</span>
                </button>
                <button
                  type="button"
                  className={`method-tab-btn ${selectedMethod === 'CANTEEN' ? 'active' : ''}`}
                  onClick={() => setSelectedMethod('CANTEEN')}
                >
                  <Store size={20} />
                  <span>Pay at Counter</span>
                </button>
              </div>

              {/* OPTION 1: UPI */}
              {selectedMethod === 'UPI' && (
                <div>
                  <div className="qr-box">
                    <span className="demo-chip">⚡ DEMO SIMULATOR & QR PREVIEW</span>
                    <div style={{
                      width: 130, height: 130, margin: '0.5rem auto', background: '#f5f5f5',
                      border: '2px solid #333', borderRadius: '8px', display: 'flex',
                      flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <QrCode size={70} style={{ color: '#222' }} />
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, marginTop: '0.2rem' }}>UPI QR</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--gray-900)' }}>
                      Anurag University Canteen
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--gray-600)', fontFamily: 'monospace' }}>
                      anuragcanteen@upi
                    </div>
                  </div>

                  <div className="payment-info">
                    <p style={{ margin: 0, fontSize: '0.82rem' }}>
                      <strong>Demo Notice:</strong> In a production environment, scanning this QR code in Google Pay, PhonePe, or Paytm initiates real UPI transfer. For testing, click the simulation button below:
                    </p>
                  </div>

                  <button
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', marginBottom: '1rem' }}
                    onClick={handleUpiSimulate}
                    disabled={paying}
                  >
                    {paying ? <><Loader size={18} className="spin" /> Processing...</> : `Simulate Successful UPI Payment (₹${order?.totalAmount})`}
                  </button>

                  <div style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.82rem', textDecoration: 'underline' }}
                      onClick={() => setShowUtrInput(!showUtrInput)}
                    >
                      {showUtrInput ? 'Hide manual UTR entry' : 'Have a test UTR / Transaction ID? Click to enter'}
                    </button>
                  </div>

                  {showUtrInput && (
                    <form onSubmit={handleUpiProofSubmit} style={{ marginTop: '0.85rem', padding: '0.85rem', background: 'var(--gray-50)', borderRadius: '6px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                        Enter 12-Digit Bank Reference / UTR Number:
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., 324109854321"
                        value={manualUtr}
                        onChange={e => setManualUtr(e.target.value)}
                        style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}
                      />
                      <button type="submit" className="btn btn-outline btn-sm" disabled={paying} style={{ width: '100%' }}>
                        Submit UTR for Verification
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* OPTION 2: DEBIT / CREDIT CARD (DEMO) */}
              {selectedMethod === 'CARD' && (
                <div>
                  <div className="alert alert-info" style={{ marginBottom: '1rem', fontSize: '0.82rem' }}>
                    <ShieldCheck size={18} />
                    <strong>Safe Sandbox:</strong> Do NOT enter real debit/credit card numbers or CVV. This form simulates card authorization for testing purposes.
                  </div>

                  <form onSubmit={handleCardSimulate} className="card-mock-form">
                    <div className="form-group">
                      <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Cardholder Name (Test)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={cardName}
                        onChange={e => setCardName(e.target.value)}
                        placeholder="e.g., Student Name"
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Test Card Number</label>
                      <input
                        type="text"
                        className="form-control"
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        placeholder="4111 2222 3333 4444"
                      />
                      <small style={{ color: 'var(--gray-500)', fontSize: '0.74rem' }}>Pre-filled with test sandbox card</small>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group">
                        <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Expiry (MM/YY)</label>
                        <input
                          type="text"
                          className="form-control"
                          value={cardExpiry}
                          onChange={e => setCardExpiry(e.target.value)}
                          placeholder="12/28"
                        />
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>CVV (Test)</label>
                        <input
                          type="password"
                          className="form-control"
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value)}
                          placeholder="•••"
                          maxLength={4}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      style={{ width: '100%', marginTop: '0.5rem' }}
                      disabled={paying}
                    >
                      {paying ? <><Loader size={18} className="spin" /> Authorizing...</> : `Simulate Card Payment (₹${order?.totalAmount})`}
                    </button>
                  </form>
                </div>
              )}

              {/* OPTION 3: PAY AT CANTEEN */}
              {selectedMethod === 'CANTEEN' && (
                <div>
                  <div className="payment-info">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Store size={18} style={{ color: 'var(--primary)' }} /> Pay Cash / UPI at Counter
                    </h3>
                    <p>
                      Your order will be immediately sent to the canteen kitchen and prepared for your selected pickup window (<strong>{order?.pickupSlot}</strong>).
                    </p>
                    <p style={{ marginTop: '0.5rem' }}>
                      <strong>Payment Condition:</strong> Payment status will remain <em>PENDING</em> until you collect your food and pay <strong>₹{order?.totalAmount}</strong> in cash or counter UPI.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%' }}
                    onClick={handlePayAtCanteen}
                    disabled={paying}
                  >
                    {paying ? <><Loader size={18} className="spin" /> Confirming...</> : `Confirm Order — Pay ₹${order?.totalAmount} at Counter`}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
