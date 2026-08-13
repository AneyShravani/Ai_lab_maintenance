import React, { useEffect, useMemo, useState } from 'react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import organizationService from '../../services/organizationService';
import CreateOrganization from './CreateOrganization';
import './OrganizationList.css';

const normalizeOrganization = (organization) => ({
  id: organization?.id || organization?._id,
  name: organization?.name || '',
  address: organization?.address || '',
  city: organization?.city || '',
  state: organization?.state || '',
  country: organization?.country || '',
  adminName: organization?.adminName || organization?.adminId?.name || '',
  adminEmail: organization?.adminEmail || organization?.adminId?.email || '',
  createdAt: organization?.createdAt ? new Date(organization.createdAt).toLocaleDateString() : '',
});

function OrganizationList() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadOrganizations = async () => {
    try {
      setIsLoading(true);
      const response = await organizationService.getOrganizations();
      const organizationList = Array.isArray(response?.organizations) ? response.organizations : [];
      setOrganizations(organizationList.map(normalizeOrganization));
      setFeedback('');
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to load organizations';
      setFeedback(message);
      setOrganizations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  const filteredOrganizations = useMemo(() => {
    if (!search.trim()) {
      return organizations;
    }

    return organizations.filter((organization) =>
      [organization.name, organization.adminName, organization.adminEmail]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [organizations, search]);

  const handleOpenCreate = () => {
    setFeedback('');
    setEditingOrganization(null);
    setIsModalOpen(true);
  };

  const handleCreateOrganization = (organization) => {
    setOrganizations((previous) => [organization, ...previous]);
    setFeedback(organization?.message || 'Organization created successfully.');
    setIsModalOpen(false);
  };

  const handleEditOrganization = async (organization) => {
    try {
      const response = await organizationService.getOrganization(organization.id);
      const details = normalizeOrganization(response?.organization || response);
      setEditingOrganization(details);
      setFeedback('');
      setIsModalOpen(true);
    } catch (error) {
      setFeedback(error?.response?.data?.message || 'Unable to load organization');
    }
  };

  const handleUpdateOrganization = (updatedOrganization) => {
    setOrganizations((previous) =>
      previous.map((organization) =>
        organization.id === updatedOrganization.id ? updatedOrganization : organization
      )
    );
    setEditingOrganization(null);
    setIsModalOpen(false);
    setFeedback(updatedOrganization?.message || 'Organization updated successfully.');
  };

  const handleDeleteOrganization = async (orgId) => {
    const shouldDelete = window.confirm('Are you sure you want to delete this organization?');
    if (!shouldDelete) {
      return;
    }

    try {
      const response = await organizationService.deleteOrganization(orgId);
      if (response?.success) {
        setOrganizations((previous) => previous.filter((organization) => organization.id !== orgId));
        setFeedback(response.message || 'Organization deleted successfully.');
        return;
      }

      setFeedback(response?.message || 'Unable to delete organization');
    } catch (error) {
      setFeedback(error?.response?.data?.message || 'Unable to delete organization');
    }
  };

  return (
    <div className="organizations-page">
      <div className="organizations-toolbar">
        <div>
          <h2 className="organizations-title">Organizations</h2>
          <p className="page-subtitle">Manage colleges and their assigned administrators.</p>
        </div>
        <div className="organization-actions">
          <input
            className="organizations-search"
            type="search"
            placeholder="Search organizations"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Button label="Create Organization" variant="primary" onClick={handleOpenCreate} />
        </div>
      </div>

      <Card title="Organizations" value={String(organizations.length)} />

      {feedback ? <p className="page-subtitle">{feedback}</p> : null}

      <div className="organizations-card">
        {isLoading ? (
          <div className="organization-empty">
            <p>Loading organizations...</p>
          </div>
        ) : filteredOrganizations.length === 0 ? (
          <div className="organization-empty">
            <p>No organizations found.</p>
          </div>
        ) : (
          <Table
            columns={['Organization Name', 'Admin Name', 'Admin Email', 'Created Date', 'Actions']}
            rows={filteredOrganizations.map((organization) => [
              organization.name,
              organization.adminName,
              organization.adminEmail,
              organization.createdAt,
              <div className="organization-actions" key={organization.id}>
                <Button label="Edit" variant="secondary" onClick={() => handleEditOrganization(organization)} />
                <Button label="Delete" variant="danger" onClick={() => handleDeleteOrganization(organization.id)} />
              </div>
            ])}
            emptyState="No organizations found."
          />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        title={editingOrganization ? 'Edit Organization' : 'Create Organization'}
        onClose={() => {
          setIsModalOpen(false);
          setEditingOrganization(null);
        }}
      >
        <CreateOrganization
          onClose={() => {
            setIsModalOpen(false);
            setEditingOrganization(null);
          }}
          onSave={editingOrganization ? handleUpdateOrganization : handleCreateOrganization}
          initialOrganization={editingOrganization}
        />
      </Modal>
    </div>
  );
}

export default OrganizationList;
