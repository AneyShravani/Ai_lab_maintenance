// ============================================================
// SECTION: OccupancyTable (part of Dashboard, Module 3.1)
// ------------------------------------------------------------
// Per-lab table: Lab | Total systems | Occupied | Available | Status
// SPEC RULE: flag a lab as "Fully occupied" when available = 0,
// otherwise show "Space available".
// ============================================================

import React from 'react';
import { useEffect, useState } from 'react';
import dashboardService from '../../services/dashboardService';

export default function OccupancyTable() {
  const [occupancy, setOccupancy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOccupancy = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await dashboardService.getOccupancy();
        setOccupancy(res.data.occupancy);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load occupancy data.');
      } finally {
        setLoading(false);
      }
    };
    fetchOccupancy();
  }, []);

  return (
    <div className="dash-card" style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: 10, padding: 20 }}>
      <h3 style={{ color: 'var(--color-heading)', marginBottom: 16 }}>Lab Occupancy</h3>

      {error && <p style={{ color: 'var(--color-white)', background: 'var(--color-danger)', padding: '8px 12px', borderRadius: 6, fontSize: 14 }}>{error}</p>}

      {loading ? (
        <p style={{ color: 'var(--color-text)' }}>Loading occupancy...</p>
      ) : occupancy.length === 0 ? (
        <p style={{ color: 'var(--color-text)' }}>No labs found for your organization yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-light-bg)' }}>
              <Th>Lab</Th><Th>Total Systems</Th><Th>Occupied</Th><Th>Available</Th><Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {occupancy.map((lab) => (
              <tr key={lab.labId} style={{ borderTop: '1px solid var(--color-table-border)' }}>
                <Td>{lab.labName}</Td><Td>{lab.total}</Td><Td>{lab.occupied}</Td><Td>{lab.available}</Td>
                <Td>
                  <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, color: 'var(--color-white)', background: lab.fullyOccupied ? 'var(--color-danger)' : 'var(--color-success)' }}>
                    {lab.fullyOccupied ? 'Fully Occupied' : 'Space Available'}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Th({ children }) { return <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: 13, color: 'var(--color-heading)' }}>{children}</th>; }
function Td({ children }) { return <td style={{ padding: '10px 14px', fontSize: 14, color: 'var(--color-text)' }}>{children}</td>; }