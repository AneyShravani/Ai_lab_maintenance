const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const systemRoutes = require('./routes/systemRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const labRoutes = require('./routes/labRoutes');
const utilizationRoutes = require('./routes/utilizationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const logRoutes = require("./routes/logRoutes");
require('./models/LabUser'); // registers LabUser schema so .populate() works in Utilization

const app = express();

app.use(cors());
app.use(express.json());

// NOTE: HOD letters are intentionally NOT served statically here.
// They are private documents and must only be reachable through the
// authenticated, org-scoped route: GET /api/assignments/uploads/:filename

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/systems', systemRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/utilization', utilizationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use("/api/assignments", require("./routes/assignmentRoutes"));
app.use("/api/logs", logRoutes);

module.exports = app;