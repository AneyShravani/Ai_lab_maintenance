// ============================================================
// SERVICE: expenseService
// ------------------------------------------------------------
// getAll()                    -> GET  /api/expenses
// create(tool, cost, spent)   -> POST /api/expenses
// update(id, data)            -> PUT  /api/expenses/:id
// ============================================================

import api from './api';

const getAll = () => api.get('/expenses');
const create = (toolName, cost, amountSpent, notes = '') =>
  api.post('/expenses', { toolName, cost, amountSpent, notes });
const update = (id, data) => api.put(`/expenses/${id}`, data);

export default { getAll, create, update };