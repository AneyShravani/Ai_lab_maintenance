// ============================================================
// PAGE: SystemList  (Module 3.5 — Infrastructure)
// ------------------------------------------------------------
// Pick a lab -> see all its systems (computers) with status
// occupied / available. This is the pool users get assigned from.
// Calls systemService.getByLab(labId).
//
// NOTE: rendered INSIDE LabList.jsx's Lab Details modal — it
// does not fetch its own data. The parent (LabList) already has
// the systems array from labService.getDetails(), and passes it
// down as a prop. This avoids a duplicate API call for the same data.
// FIX (Copilot LOW): removed unused Button import — was flagged
// as an unused-import lint risk, never actually rendered here.
// ============================================================
import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import Table from '../../components/common/Table';
import '../labs/LabList.css'; 

const systemStatusTone = (status) => (
    status === 'AVAILABLE' ? 'success' : status === 'OCCUPIED' ? 'warning' : 'neutral'
);

// derives {total, available, occupied} from the systems array passed in —
// same counting logic the backend's getOccupancyForLab computes server-side
const getOccupancySummary = (systems) => {
    const total = systems.length;
    const occupied = systems.filter((system) => system.status === 'OCCUPIED').length;
    const available = total - occupied;
    return { total, occupied, available };
};

function SystemList({ systems, onEdit, onDelete }) {
    if (!systems || systems.length === 0) {
        return <div className="lab-detail-empty">No systems available for this lab.</div>;
    }

    const { total, occupied, available } = getOccupancySummary(systems);

    return (
        <>
            <div className="occupancy-strip">
                <div className="occupancy-chip occupancy-chip-total">
                    <span>Total</span>
                    <strong>{total}</strong>
                </div>
                <div className="occupancy-chip occupancy-chip-available">
                    <span>Available</span>
                    <strong>{available}</strong>
                </div>
                <div className="occupancy-chip occupancy-chip-occupied">
                    <span>Occupied</span>
                    <strong>{occupied}</strong>
                </div>
            </div>

            <div className="lab-systems-table">
                <Table
                    columns={['System Name', 'Status', 'Created Date', 'Actions']}
                    rows={systems.map((system) => [
                        system.name,
                        <StatusBadge key={`${system.id}-status`} label={system.status} tone={systemStatusTone(system.status)} />,
                        system.createdAt,
                        <div className="organization-actions lab-row-actions" key={`${system.id}-actions`}>
                            <button
                                className="lab-action-button lab-action-edit"
                                type="button"
                                onClick={() => onEdit(system)}
                            >
                                <Pencil size={14} strokeWidth={2.2} />
                                <span>Edit</span>
                            </button>
                            <button
                                className="lab-action-button lab-action-delete"
                                type="button"
                                onClick={() => onDelete(system)}
                            >
                                <Trash2 size={14} strokeWidth={2.2} />
                                <span>Delete</span>
                            </button>
                        </div>,
                    ])}
                    emptyState="No systems available for this lab."
                />
            </div>
        </>
    );
}

export default SystemList;