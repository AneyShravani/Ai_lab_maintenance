// ============================================================
// CONTROLLER: dashboardController  (Module 3.1)
// ------------------------------------------------------------
// getStats         -> aggregate counts for THIS org only:
//                     students, systems, tools, total expenses,
//                     active assignments, upcoming deadlines.
// getOccupancy     -> per lab: total / occupied / available
//                     + "fully occupied" flag when available=0.
// checkReferenceId -> look up an Assignment by referenceId,
//                     return ACTIVE / NEARING_EXPIRY / EXPIRED
//                     + assignment details.
// getNotifications -> unread deadline notifications.
// ============================================================

const Lab = require('../models/Lab');
const System = require('../models/System');
const Expense = require('../models/Expense');
const Assignment = require('../models/Assignment');
const { getStatus } = require('../services/referenceIdService');

const getStats = async (req, res) => {
  try {
    const orgId = req.user.orgId;

    const [labCount, systemCount, expenses, activeAssignments] = await Promise.all([
      Lab.countDocuments({ orgId }),
      System.countDocuments({ orgId }),
      Expense.find({ orgId }),
      Assignment.countDocuments({ orgId, status: 'ACTIVE' }),
    ]);

    const totalExpenses = expenses.reduce((sum, e) => sum + e.cost, 0);
    const totalSpent = expenses.reduce((sum, e) => sum + e.amountSpent, 0);

    return res.status(200).json({
      success: true,
      stats: {
        labCount,
        systemCount,
        toolCount: expenses.length,
        totalExpenses,
        totalSpent,
        activeAssignments,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const getOccupancy = async (req, res) => {
  try {
    const orgId = req.user.orgId;
    const labs = await Lab.find({ orgId });

    const occupancy = await Promise.all(
      labs.map(async (lab) => {
        const total = await System.countDocuments({ labId: lab._id });
        const occupied = await System.countDocuments({ labId: lab._id, status: 'OCCUPIED' });
        const available = total - occupied;

        return {
          labId: lab._id,
          labName: lab.name,
          total,
          occupied,
          available,
          fullyOccupied: total > 0 && available === 0,
        };
      })
    );

    return res.status(200).json({ success: true, occupancy });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// GET /api/dashboard/reference/:refId
const checkReferenceId = async (req, res) => {
  try {
    const orgId = req.user.orgId;
    const { refId } = req.params;

    const assignment = await Assignment.findOne({ referenceId: refId, orgId })
      .populate('labUserId', 'name rollNumber department')
      .populate({
        path: 'systemId',
        select: 'name labId',
        populate: { path: 'labId', select: 'name' },
      });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'No assignment found with that Reference ID.',
      });
    }

    const liveStatus = getStatus(assignment);

    return res.status(200).json({
      success: true,
      status: liveStatus,
      referenceId: assignment.referenceId,
      projectName: assignment.projectName,
      startDate: assignment.startDate,
      endDate: assignment.endDate,
      user: {
        name: assignment.labUserId?.name || '—',
        rollNumber: assignment.labUserId?.rollNumber || '—',
        department: assignment.labUserId?.department || '—',
      },
      system: {
        name: assignment.systemId?.name || '—',
        labName: assignment.systemId?.labId?.name || '—',
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = { getStats, getOccupancy, checkReferenceId };