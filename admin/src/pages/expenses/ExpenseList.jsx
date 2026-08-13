// ============================================================
// PAGE: ExpenseList  (Module 3.3 — Expenses)
// ------------------------------------------------------------
// Full expense breakdown with inline edit. Cost accepts
// currency strings ($20/₹1500) in both add and edit forms.
// ============================================================

import React from 'react';
import { useEffect, useState } from 'react';
import expenseService from '../../services/expenseService';
import AddExpense from './AddExpense';
import { fetchUsdToInrRate, parseCurrencyToINR } from '../../utils/currency';

export default function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rate, setRate] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ toolName: '', cost: '', amountSpent: '', notes: '' });
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    fetchUsdToInrRate().then(setRate).catch(() => {});
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await expenseService.getAll();
      setExpenses(res.data.expenses);
      setTotalCost(res.data.totalCost);
      setTotalSpent(res.data.totalSpent);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load expenses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleExpenseAdded = () => fetchExpenses();

  const startEdit = (expense) => {
    setEditingId(expense._id);
    // Pre-fill with existing rupee value as a plain string - user can retype as $ if they want
    setEditForm({
      toolName: expense.toolName,
      cost: String(expense.cost),
      amountSpent: expense.amountSpent,
      notes: expense.notes || '',
    });
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ toolName: '', cost: '', amountSpent: '', notes: '' });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveEdit = async (id) => {
    if (!editForm.toolName || editForm.cost === '') {
      setError('Tool name and cost are required.');
      return;
    }

    const costInRupees = parseCurrencyToINR(editForm.cost, rate);
    if (costInRupees === null) {
      setError(rate === null ? 'Exchange rate still loading - try again shortly.' : 'Enter cost as a number, optionally with $ or ₹.');
      return;
    }

    setSavingId(id);
    setError('');
    try {
      await expenseService.update(id, {
        toolName: editForm.toolName,
        cost: costInRupees,
        amountSpent: Number(editForm.amountSpent) || 0,
        notes: editForm.notes,
      });
      setEditingId(null);
      await fetchExpenses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update expense.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: 'var(--color-heading)', marginBottom: 20 }}>Expenses</h2>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <AddExpense onExpenseAdded={handleExpenseAdded} />

        <div style={{ flex: 1, minWidth: 320 }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            <SummaryCard label="Total Cost" value={totalCost} color="var(--color-primary)" />
            <SummaryCard label="Total Spent" value={totalSpent} color="var(--color-warning)" />
          </div>

          {error && (
            <p style={{ color: 'var(--color-white)', background: 'var(--color-danger)', padding: '8px 12px', borderRadius: 6, fontSize: 14 }}>
              {error}
            </p>
          )}

          {loading ? (
            <p style={{ color: 'var(--color-text)' }}>Loading expenses...</p>
          ) : expenses.length === 0 ? (
            <p style={{ color: 'var(--color-text)' }}>No expenses added yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: 'var(--color-light-bg)' }}>
                  <Th>Tool / Model</Th><Th>Cost</Th><Th>Amount Spent</Th><Th>Notes</Th><Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => {
                  const isEditing = editingId === e._id;
                  return (
                    <tr key={e._id} style={{ borderTop: '1px solid var(--color-table-border)' }}>
                      {isEditing ? (
                        <>
                          <Td><input type="text" name="toolName" value={editForm.toolName} onChange={handleEditChange} style={editInputStyle} /></Td>
                          <Td><input type="text" name="cost" value={editForm.cost} onChange={handleEditChange} placeholder="$20 or ₹1500" style={editInputStyle} /></Td>
                          <Td><input type="number" name="amountSpent" value={editForm.amountSpent} onChange={handleEditChange} min="0" step="0.01" style={editInputStyle} /></Td>
                          <Td><input type="text" name="notes" value={editForm.notes} onChange={handleEditChange} style={editInputStyle} /></Td>
                          <Td>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={() => saveEdit(e._id)} disabled={savingId === e._id} style={saveBtnStyle}>
                                {savingId === e._id ? 'Saving...' : 'Save'}
                              </button>
                              <button onClick={cancelEdit} style={cancelBtnStyle}>Cancel</button>
                            </div>
                          </Td>
                        </>
                      ) : (
                        <>
                          <Td>{e.toolName}</Td>
                          <Td>₹{e.cost.toFixed(2)}</Td>
                          <Td>₹{e.amountSpent.toFixed(2)}</Td>
                          <Td>{e.notes || '—'}</Td>
                          <Td><button onClick={() => startEdit(e)} style={editBtnStyle}>Edit</button></Td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '14px 20px', minWidth: 140 }}>
      <div style={{ color: 'var(--color-text)', fontSize: 13 }}>{label}</div>
      <div style={{ color, fontSize: 22, fontWeight: 700 }}>₹{value.toFixed(2)}</div>
    </div>
  );
}

function Th({ children }) {
  return <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: 13, color: 'var(--color-heading)' }}>{children}</th>;
}

function Td({ children }) {
  return <td style={{ padding: '10px 14px', fontSize: 14, color: 'var(--color-text)' }}>{children}</td>;
}

const editInputStyle = { width: '100%', padding: '6px 8px', border: '1px solid var(--color-border)', borderRadius: 4, fontSize: 13, color: 'var(--color-heading)' };
const editBtnStyle = { background: 'var(--color-info)', color: 'var(--color-white)', border: 'none', borderRadius: 4, padding: '6px 12px', fontSize: 13, cursor: 'pointer' };
const saveBtnStyle = { background: 'var(--color-success)', color: 'var(--color-white)', border: 'none', borderRadius: 4, padding: '6px 12px', fontSize: 13, cursor: 'pointer' };
const cancelBtnStyle = { background: 'var(--color-muted)', color: 'var(--color-white)', border: 'none', borderRadius: 4, padding: '6px 12px', fontSize: 13, cursor: 'pointer' };