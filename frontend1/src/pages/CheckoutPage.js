import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CheckoutPage.css';
import getBackendURL from '../utils/environment.js';

const API_BASE = getBackendURL();

function loadScript(src) {
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

function normalizeCart(raw) {
  if (!raw) return [];
  try {
    const arr = Array.isArray(raw) ? raw : JSON.parse(raw);
    const items = Array.isArray(arr) ? arr : [];
    // Accept multiple shapes and normalize
    return items.map((it) => ({
      productId: it.productId || it._id || it.id || it.product?._id || it.productId,
      name: it.name || it.product?.name,
      price: Number(it.price || it.product?.price || 0),
      image: it.image || it.product?.image,
      qty: Number(it.qty || it.quantity || 1),
    })).filter(x => x.productId && x.qty > 0);
  } catch {
    return [];
  }
}

export default function CheckoutPage() {
  const nav = useNavigate();
  const [shipping, setShipping] = useState({ name: '', phone: '', address1: '', address2: '', city: '', state: '', zip: '', country: 'India' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cartItems = useMemo(() => {
    const a = normalizeCart(localStorage.getItem('cart'));
    if (a.length) return a;
    return normalizeCart(localStorage.getItem('cartItems'));
  }, []);

  const token = localStorage.getItem('authToken');
  const user = (() => { try { return JSON.parse(localStorage.getItem('userData') || '{}'); } catch { return {}; }})();

  async function startCheckout(e) {
    e?.preventDefault?.();
    setError('');
    if (!cartItems.length) { setError('Your cart is empty.'); return; }
    if (!token) { setError('Please login to continue.'); return; }
    setLoading(true);
    try {
      // Create checkout/order
      const res = await fetch(`${API_BASE}/api/checkout/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items: cartItems, shippingAddress: shipping })
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || 'Failed to create checkout');

      const { orderId, rzpOrderId, keyId, amount, currency, demoMode } = data;

      // Demo mode - skip Razorpay and auto-complete
      if (demoMode) {
        if (window.confirm('Demo Mode: Simulate successful payment?')) {
          try {
            const ver = await fetch(`${API_BASE}/api/checkout/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                orderId,
                razorpay_order_id: rzpOrderId,
                razorpay_payment_id: `demo_pay_${Date.now()}`,
                razorpay_signature: 'demo_signature'
              })
            });
            const vj = await ver.json();
            if (!ver.ok || !vj?.success) throw new Error(vj?.message || 'Payment verification failed');
            
            // Clear cart
            localStorage.removeItem('cart');
            localStorage.removeItem('cartList');
            window.dispatchEvent(new Event('cartListUpdated'));
            
            nav(`/order/${orderId}`);
          } catch (err) {
            setError(err.message);
          }
        }
        setLoading(false);
        return;
      }

      // Load Razorpay script
      const ok = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!ok || !window.Razorpay) throw new Error('Failed to load payment SDK');

      // Open Razorpay
      const options = {
        key: keyId,
        amount,
        currency,
        name: 'E-Commerce',
        description: `Order ${orderId}`,
        order_id: rzpOrderId,
        prefill: {
          name: user?.name || shipping.name,
          email: user?.email,
          contact: shipping.phone,
        },
        handler: async function (response) {
          try {
            const ver = await fetch(`${API_BASE}/api/checkout/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const vj = await ver.json();
            if (!ver.ok || !vj?.success) throw new Error(vj?.message || 'Payment verification failed');
            
            // Clear cart
            localStorage.removeItem('cart');
            localStorage.removeItem('cartList');
            window.dispatchEvent(new Event('cartListUpdated'));
            
            nav(`/order/${orderId}`);
          } catch (err) {
            setError(err.message);
          }
        },
        modal: { ondismiss: () => setLoading(false) }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Could pre-load SDK optionally
  }, []);

  const subtotal = cartItems.reduce((s, it) => s + it.price * it.qty, 0);
  const tax = Math.round(subtotal * 0.18);
  const shippingFee = subtotal > 5000 ? 0 : 199;
  const total = subtotal + tax + shippingFee;

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h2>Checkout</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="checkout-layout">
          <div className="checkout-form-section">
            <h3>Shipping Address</h3>
            <form onSubmit={startCheckout} className="shipping-form">
              <input placeholder="Full name" value={shipping.name} onChange={e=>setShipping({...shipping, name:e.target.value})} required />
              <input placeholder="Phone number" value={shipping.phone} onChange={e=>setShipping({...shipping, phone:e.target.value})} required />
              <input placeholder="Address line 1" value={shipping.address1} onChange={e=>setShipping({...shipping, address1:e.target.value})} required />
              <input placeholder="Address line 2 (Optional)" value={shipping.address2} onChange={e=>setShipping({...shipping, address2:e.target.value})} />
              <div className="form-row">
                <input placeholder="City" value={shipping.city} onChange={e=>setShipping({...shipping, city:e.target.value})} required />
                <input placeholder="State" value={shipping.state} onChange={e=>setShipping({...shipping, state:e.target.value})} required />
                <input placeholder="ZIP Code" value={shipping.zip} onChange={e=>setShipping({...shipping, zip:e.target.value})} required />
              </div>
              <input placeholder="Country" value={shipping.country} onChange={e=>setShipping({...shipping, country:e.target.value})} required />
              <button type="submit" className="pay-button" disabled={loading}>
                {loading ? '⏳ Processing...' : '💳 Pay Now'}
              </button>
            </form>
          </div>
          <div className="order-summary-section">
            <h3>Order Summary</h3>
            <ul className="summary-items">
              {cartItems.map((it) => (
                <li key={it.productId} className="summary-item">
                  <div className="item-details">
                    <div className="item-name">{it.name || it.productId}</div>
                    <div className="item-qty">Quantity: {it.qty}</div>
                  </div>
                  <div className="item-price">₹{(it.price * it.qty).toFixed(2)}</div>
                </li>
              ))}
            </ul>
            <div className="summary-divider"></div>
            <div className="summary-row subtotal">
              <span>Subtotal</span>
              <span className="amount">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row tax">
              <span>Tax (18% GST)</span>
              <span className="amount">₹{tax.toFixed(2)}</span>
            </div>
            <div className="summary-row shipping">
              <span>Shipping</span>
              <span className={shippingFee === 0 ? 'free' : 'amount'}>
                {shippingFee === 0 ? 'FREE' : `₹${shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <div className="security-note">
              Safe and secure payments
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
