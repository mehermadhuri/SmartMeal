import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentAPI, orderAPI } from '../api/api';
import { CheckCircle, Loader, CreditCard } from 'lucide-react';
import './Payment.css';

export default function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const o = await orderAPI.getById(orderId);
      setOrder(o);
      // Check if payment already exists
      try {
        const p = await paymentAPI.getByOrder(orderId);
        setPayment(p);
      } catch {
        // No payment yet, that's fine
      }
    } catch (err) {
      setError(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleInitiatePayment = async () => {
    setPaying(true);
    setError('');
    try {
      const res = await paymentAPI.initiate({ orderId: parseInt(orderId), method: 'UPI' });
      setPayment(res.payment || res);
      // For demo: auto-simulate success
      if (res.payment?.id || res.id) {
        const pid = res.payment?.id || res.id;
        const completed = await paymentAPI.simulateSuccess(pid);
        setPayment(completed);
        setTimeout(() => navigate(`/order-confirmation/${orderId}`), 1500);
      }
    } catch (err) {
      setError(err.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div className="spinner" />;

  const isPaid = payment?.status === 'COMPLETED' || payment?.status === 'VERIFIED' || order?.paymentStatus === 'COMPLETED';

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '560px' }}>
        <div className="page-header">
          <h1><CreditCard size={28} /> Payment</h1>
          <p>Order #{orderId}</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card payment-card">
          <div className="card-body">
            <div className="payment-amount">
              <span>Amount to Pay</span>
              <span className="amount-value">₹{order?.totalAmount}</span>
            </div>

            {isPaid ? (
              <div className="payment-success">
                <CheckCircle size={48} />
                <h3>Payment Successful!</h3>
                <p>Your order has been confirmed.</p>
                <button className="btn btn-success btn-lg" style={{ width: '100%', marginTop: '1rem' }} onClick={() => navigate(`/order-confirmation/${orderId}`)}>
                  View Receipt
                </button>
              </div>
            ) : (
              <>
                <div className="payment-info">
                  <h3>Payment Instructions</h3>
                  <p>For this demo, clicking the button below will simulate a successful UPI payment.</p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                    In production, this would integrate with a real payment gateway (Razorpay, PhonePe, etc.)
                  </p>
                </div>
                <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleInitiatePayment} disabled={paying}>
                  {paying ? <><Loader size={18} className="spin" /> Processing...</> : `Pay ₹${order?.totalAmount} via UPI`}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
