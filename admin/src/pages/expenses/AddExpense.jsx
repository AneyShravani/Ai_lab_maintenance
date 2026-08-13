// ============================================================
// PAGE: AddExpense  (Module 3.3 — Expenses)
// ------------------------------------------------------------
// Form: tool/model name + cost (as currency string) + spent.
// Cost accepts "$20" or "₹1500" - converted to INR using a
// live exchange rate before being sent to the backend.
// ============================================================

import React from 'react';
import { useEffect, useState } from 'react';
import expenseService from '../../services/expenseService';
import { fetchUsdToInrRate, parseCurrencyToINR } from '../../utils/currency';

export default function AddExpense({ onExpenseAdded }) {
  const [form, setForm] = useState({ toolName: '', cost: '', amountSpent: '', notes: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rate, setRate] = useState(null);
  const [rateError, setRateError] = useState('');

  useEffect(() => {
    fetchUsdToInrRate()
      .then(setRate)
      .catch(() => setRateError('Could not load live exchange rate. $ amounts won\'t convert until this loads.'));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.toolName || form.cost === '') {
      setError('Tool name and cost are required.');
      return;
    }

    const costInRupees = parseCurrencyToINR(form.cost, rate);
    if (costInRupees === null) {
      setError(
        rate === null
          ? 'Exchange rate still loading - please wait a moment and try again.'
          : 'Enter cost as a number, optionally with $ or ₹ (e.g. $20, ₹1500).'
      );
      return;
    }

    setLoading(true);
    try {
      const res = await expenseService.create(
        form.toolName,
        costInRupees,
        Number(form.amountSpent) || 0,
        form.notes
      );
      setForm({ toolName: '', cost: '', amountSpent: '', notes: '' });
      if (onExpenseAdded) onExpenseAdded(res.data.expense);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'var(--color-card-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 10,
        padding: 24,
        maxWidth: 420,
      }}
    >
      <h3 style={{ color: 'var(--color-heading)', marginBottom: 8 }}>Add AI Tool / Expense</h3>

      {rate && (
        <p style={{ color: 'var(--color-muted)', fontSize: 12, marginBottom: 12 }}>
          Live rate: $1 = ₹{rate.toFixed(2)}
        </p>
      )}
      {rateError && (
        <p style={{ color: 'var(--color-warning)', fontSize: 12, marginBottom: 12 }}>{rateError}</p>
      )}

      {error && (
        <p style={{ color: 'var(--color-white)', background: 'var(--color-danger)', padding: '8px 12px', borderRadius: 6, fontSize: 14 }}>
          {error}
        </p>
      )}

      <label style={fieldStyle}>
        Tool / Model Name
        <input type="text" name="toolName" value={form.toolName} onChange={handleChange} placeholder="e.g. ChatGPT Plus" required style={inputStyle} />
      </label>

      <label style={fieldStyle}>
        Cost (e.g. $20 or ₹1500)
        <input type="text" name="cost" value={form.cost} onChange={handleChange} placeholder="$20 or ₹1500" required style={inputStyle} />
      </label>

      <label style={fieldStyle}>
        Amount Spent
        <input type="number" name="amountSpent" value={form.amountSpent} onChange={handleChange} min="0" step="0.01" style={inputStyle} />
      </label>

      <label style={fieldStyle}>
        Notes
        <input type="text" name="notes" value={form.notes} onChange={handleChange} placeholder="optional" style={inputStyle} />
      </label>

      <button
        type="submit"
        disabled={loading}
        style={{
          background: 'var(--color-primary)',
          color: 'var(--color-white)',
          border: 'none',
          borderRadius: 6,
          padding: '10px 20px',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          marginTop: 8,
        }}
        onMouseOver={(e) => { if (!loading) e.currentTarget.style.background = 'var(--color-primary-hover)'; }}
        onMouseOut={(e) => { if (!loading) e.currentTarget.style.background = 'var(--color-primary)'; }}
      >
        {loading ? 'Adding...' : 'Add Expense'}
      </button>
    </form>
  );
}

const fieldStyle = { display: 'block', marginBottom: 14, color: 'var(--color-text)', fontSize: 14 };
const inputStyle = { display: 'block', width: '100%', marginTop: 4, padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 14, color: 'var(--color-heading)' };