// ============================================================
// PAGE: LabList  (Module 3.4 — Lab Creation)
// ------------------------------------------------------------
// Table of all AI labs of THIS organization (an org can have
// multiple labs). Shows lab name + number of systems.
// Calls labService.getAll().
// UPDATED: added "Add Systems" button + modal (Module 3.5)
// UPDATED: added occupancy stat strip + highlighted total count (UI pass)
// UPDATED: systems table + occupancy strip moved into SystemList.jsx —
// this file now just passes data down and handles edit/delete modals.
// ============================================================
import React, { useEffect, useState } from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import labService from '../../services/labService';
import CreateLab from './CreateLab';
import AddSystems from '../infrastructure/AddSystems'; // form to add N systems to a lab
import EditSystem from '../infrastructure/EditSystem'; // NEW: form to edit one system
import SystemList from '../infrastructure/SystemList'; // NEW: displays systems table + occupancy strip for a lab
import '../organizations/OrganizationList.css';
import './LabList.css';
import systemService from '../../services/systemService';

const normalizeLab = (lab) => ({
  id: lab?.id || lab?._id,
  name: lab?.name || '',
  systemCount: Number(lab?.systemCount || 0),
  createdAt: lab?.createdAt ? new Date(lab.createdAt).toLocaleDateString() : '',
  updatedAt: lab?.updatedAt ? new Date(lab.updatedAt).toLocaleDateString() : '',
});

const formatDateTime = (dateValue) => (
  dateValue ? new Date(dateValue).toLocaleString() : 'N/A'
);

const normalizeLabDetails = (lab) => ({
  id: lab?.id || lab?._id,
  name: lab?.name || 'N/A',
  organizationName: lab?.organizationName || 'N/A',
  createdBy: lab?.createdBy || 'N/A',
  adminEmail: lab?.adminEmail || 'N/A',
  createdAt: formatDateTime(lab?.createdAt),
  updatedAt: formatDateTime(lab?.updatedAt),
  systemCount: Number(lab?.systemCount || 0),
  systems: Array.isArray(lab?.systems) ? lab.systems.map((system) => ({
    id: system?.id || system?._id,
    name: system?.name || 'N/A',
    status: system?.status || 'AVAILABLE',
    createdAt: formatDateTime(system?.createdAt),
  })) : [],
});

function LabList() {
  const [labs, setLabs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedLabDetails, setSelectedLabDetails] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isAddSystemsOpen, setIsAddSystemsOpen] = useState(false); // controls Add Systems modal visibility
  const [editingSystem, setEditingSystem] = useState(null); // NEW: which system is being edited (null = modal closed)

  const loadLabs = async () => {
    try {
      setIsLoading(true);
      const response = await labService.getAll();
      const labList = Array.isArray(response?.labs) ? response.labs : [];
      setLabs(labList.map(normalizeLab));
      setFeedback('');
    } catch (error) {
      setFeedback(error?.response?.data?.message || 'Unable to load labs');
      setLabs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLabs();
  }, []);

  const handleOpenCreate = () => {
    setFeedback('');
    setEditingLab(null);
    setIsModalOpen(true);
  };

  const handleEditLab = async (lab) => {
    try {
      const response = await labService.getById(lab.id);
      setEditingLab(normalizeLab(response?.lab || response));
      setFeedback('');
      setIsModalOpen(true);
    } catch (error) {
      setFeedback(error?.response?.data?.message || 'Unable to load lab');
    }
  };

  const handleViewMore = async (lab) => {
    try {
      setIsDetailsOpen(true);
      setIsDetailsLoading(true);
      setSelectedLabDetails(null);
      setFeedback('');
      const response = await labService.getDetails(lab.id);
      setSelectedLabDetails(normalizeLabDetails(response?.lab || response));
    } catch (error) {
      setIsDetailsOpen(false);
      setFeedback(error?.response?.data?.message || 'Unable to load lab details');
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedLabDetails(null);
  };

  const handleSaveLab = async (savedLab) => {
    setIsModalOpen(false);
    setEditingLab(null);
    setFeedback(savedLab?.message || 'Lab saved successfully.');
    await loadLabs();
  };

  const handleDeleteLab = async (labId) => {
    const shouldDelete = window.confirm('Are you sure you want to delete this lab?');
    if (!shouldDelete) {
      return;
    }

    try {
      const response = await labService.delete(labId);
      if (response?.success) {
        setFeedback(response.message || 'Lab deleted successfully.');
        await loadLabs();
        return;
      }

      setFeedback(response?.message || 'Unable to delete lab');
    } catch (error) {
      setFeedback(error?.response?.data?.message || 'Unable to delete lab');
    }
  };

  // NEW: refreshes both the details modal AND the labs table —
  // same two-call pattern used by AddSystems' onSave, for the same reason:
  // selectedLabDetails and labs are two separate pieces of state.
  const refreshAfterSystemChange = async () => {
    await handleViewMore({ id: selectedLabDetails.id });
    await loadLabs();
  };

  // NEW: called when the Edit button is clicked on a system row in SystemList
  const handleEditSystem = (system) => {
    setEditingSystem(system);
  };

  // NEW: called when the Delete button is clicked on a system row in SystemList
  const handleDeleteSystem = async (system) => {
    const shouldDelete = window.confirm(`Delete ${system.name}? This cannot be undone.`);
    if (!shouldDelete) {
      return;
    }

    try {
      await systemService.deleteSystem(system.id);
      setFeedback('System deleted successfully.');
      await refreshAfterSystemChange();
    } catch (error) {
      setFeedback(error?.response?.data?.message || 'Unable to delete system');
    }
  };

  return (
    <div className="organizations-page">
      <div className="organizations-toolbar">
        <div>
          <h2 className="organizations-title">Labs</h2>
          <p className="page-subtitle">Manage labs for your assigned organization.</p>
        </div>
        <div className="organization-actions">
          <Button label="Create Lab" variant="primary" onClick={handleOpenCreate} />
        </div>
      </div>

      <Card title="Labs" value={String(labs.length)} />

      {feedback ? <p className="page-subtitle">{feedback}</p> : null}

      <div className="organizations-card">
        {isLoading ? (
          <div className="organization-empty">
            <p>Loading labs...</p>
          </div>
        ) : labs.length === 0 ? (
          <div className="organization-empty">
            <p>No labs added yet.</p>
          </div>
        ) : (
          <Table
            columns={['Lab Name', 'System Count', 'Created Date', 'Actions']}
            rows={labs.map((lab) => [
              lab.name,
              lab.systemCount,
              lab.createdAt,
              <div className="organization-actions lab-row-actions" key={lab.id}>
                <button className="lab-action-button lab-action-view" type="button" onClick={() => handleViewMore(lab)}>
                  <Eye size={16} strokeWidth={2.2} />
                  <span>View</span>
                </button>
                <button className="lab-action-button lab-action-edit" type="button" onClick={() => handleEditLab(lab)}>
                  <Pencil size={16} strokeWidth={2.2} />
                  <span>Edit</span>
                </button>
                <button className="lab-action-button lab-action-delete" type="button" onClick={() => handleDeleteLab(lab.id)}>
                  <Trash2 size={16} strokeWidth={2.2} />
                  <span>Delete</span>
                </button>
              </div>,
            ])}
            emptyState="No labs added yet."
          />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        title={editingLab ? 'Edit Lab' : 'Create Lab'}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLab(null);
        }}
      >
        <CreateLab
          onClose={() => {
            setIsModalOpen(false);
            setEditingLab(null);
          }}
          onSave={handleSaveLab}
          initialLab={editingLab}
        />
      </Modal>

      <Modal
          isOpen={isDetailsOpen}
          title={selectedLabDetails?.name ? `${selectedLabDetails.name} Details` : 'Lab Details'}
          onClose={handleCloseDetails}
          size="wide"
        >
        {isDetailsLoading ? (
          <div className="lab-detail-empty">Loading lab details...</div>
        ) : selectedLabDetails ? (
          <div className="lab-detail">
            <div className="lab-detail-grid">
              <div className="lab-detail-item">
                <span>Lab Name</span>
                <strong>{selectedLabDetails.name}</strong>
              </div>
              <div className="lab-detail-item">
                <span>Organization Name</span>
                <strong>{selectedLabDetails.organizationName}</strong>
              </div>
              <div className="lab-detail-item">
                <span>Created By</span>
                <strong>{selectedLabDetails.createdBy}</strong>
              </div>
              <div className="lab-detail-item">
                <span>Admin Email</span>
                <strong>{selectedLabDetails.adminEmail}</strong>
              </div>
              <div className="lab-detail-item">
                <span>Created Date</span>
                <strong>{selectedLabDetails.createdAt}</strong>
              </div>
              <div className="lab-detail-item">
                <span>Last Updated Date</span>
                <strong>{selectedLabDetails.updatedAt}</strong>
              </div>
              {/* highlighted so it stands out from the 6 plain reference fields above */}
              <div className="lab-detail-item lab-detail-item-highlight">
                <span>Total Systems Count</span>
                <strong>{selectedLabDetails.systemCount}</strong>
              </div>
            </div>

            <div className="lab-systems-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4>Systems</h4>
                <Button
                  label="Add Systems"
                  variant="primary"
                  onClick={() => setIsAddSystemsOpen(true)}
                />
              </div>

              {/* NEW: SystemList now owns the occupancy strip + table + edit/delete buttons.
                  LabList just hands it the data and two callback functions. */}
              <SystemList
                systems={selectedLabDetails.systems}
                onEdit={handleEditSystem}
                onDelete={handleDeleteSystem}
              />
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={isAddSystemsOpen}
        title="Add Systems"
        onClose={() => setIsAddSystemsOpen(false)}
      >
        <AddSystems
          labId={selectedLabDetails?.id}
          onClose={() => setIsAddSystemsOpen(false)}
          onSave={async () => {
            setIsAddSystemsOpen(false);
            await refreshAfterSystemChange();
          }}
        />
      </Modal>

      {/* NEW: Edit System modal — opens when editingSystem is set (non-null) */}
      <Modal
        isOpen={Boolean(editingSystem)}
        title="Edit System"
        onClose={() => setEditingSystem(null)}
      >
        {editingSystem ? (
          <EditSystem
            system={editingSystem}
            onClose={() => setEditingSystem(null)}
            onSave={async () => {
              setEditingSystem(null);
              await refreshAfterSystemChange();
            }}
          />
        ) : null}
      </Modal>
    </div>
  );
}

export default LabList;