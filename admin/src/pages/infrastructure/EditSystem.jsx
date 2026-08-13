// ============================================================
// PAGE: EditSystem (Module 3.5 — Infrastructure)
// ------------------------------------------------------------
// Small form to correct one system's name.
// Same modal pattern as AddSystems.jsx and CreateLab.jsx.
// systemId comes from the row the admin clicked, never typed.
//
// UPDATED: status is NOT editable here. Status changes only
// happen through Module 3.7's assignment workflow (assigning/
// releasing a system to/from a user). Editing status directly
// here would let a system show OCCUPIED with no real Assignment
// record behind it — a lie the rest of the system would then trust.
// ============================================================
import React, { useState } from 'react';
import Button from '../../components/common/Button';
import systemService from '../../services/systemService';
import '../organizations/CreateOrganization.css'; // reuse existing form styling

function EditSystem({ system, onClose, onSave }) {
    const [name, setName] = useState(system?.name || '');       // pre-filled with current name
    const [fieldError, setFieldError] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const trimmedName = name.trim();
        if (!trimmedName) {
            setFieldError('System name is required.');
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');

        try {
            // NEW: status intentionally left out of the payload — backend
            // still accepts it, but this form no longer sends it
            const response = await systemService.updateSystem(system.id, { name: trimmedName });
            onSave?.(response);
        } catch (error) {
            setSubmitError(error?.response?.data?.message || 'Unable to update system');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="create-org-form" onSubmit={handleSubmit}>
            <div className="create-org-field">
                <label htmlFor="systemName">System Name</label>
                <input
                    id="systemName"
                    type="text"
                    value={name}
                    onChange={(event) => {
                        setName(event.target.value);
                        setFieldError('');
                        setSubmitError('');
                    }}
                    className={fieldError ? 'input-error' : ''}
                />
                {fieldError ? <span className="field-error">{fieldError}</span> : null}
            </div>

            {/* NEW: status shown read-only, not editable — real changes happen via assignment workflow in Module 3.7 */}
            <div className="create-org-field">
                <label>Status</label>
                <p style={{ margin: 0, fontWeight: 600 }}>{system?.status}</p>
            </div>

            {submitError ? <p className="field-error">{submitError}</p> : null}

            <div className="create-org-actions">
                <Button label="Cancel" variant="secondary" onClick={onClose} />
                <Button
                    label={isSubmitting ? 'Saving...' : 'Save Changes'}
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                />
            </div>
        </form>
    );
}

export default EditSystem;