// ============================================================
// PAGE: CreateLab  (Module 3.4 — Lab Creation)
// ------------------------------------------------------------
// Form for the Admin to create a new AI lab for their org.
// Calls labService.create().
// ============================================================
import React, { useEffect, useState } from 'react';
import Button from '../../components/common/Button';
import labService from '../../services/labService';
import '../organizations/CreateOrganization.css';
import AddSystems from '../infrastructure/AddSystems';

function CreateLab({ onClose, onSave, initialLab }) {
  const [name, setName] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialLab) {
      setName(initialLab.name || '');
    }
  }, [initialLab]);

  const resetForm = () => {
    setName('');
    setFieldError('');
    setSubmitError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const resolvedName = name.trim();

    if (!resolvedName) {
      setFieldError('Lab name is required.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload = { name: resolvedName };
      const response = initialLab
        ? await labService.update(initialLab.id, payload)
        : await labService.create(payload);

      if (response?.success) {
        onSave?.({
          ...(response.lab || {}),
          message: response.message || (initialLab ? 'Lab updated successfully.' : 'Lab created successfully.'),
        });
        resetForm();
        return;
      }

      setSubmitError(response?.message || 'Unable to save lab');
    } catch (error) {
      setSubmitError(error?.response?.data?.message || 'Unable to save lab');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="create-org-form" onSubmit={handleSubmit}>
      <div className="create-org-field">
        <label htmlFor="labName">Lab Name</label>
        <input
          id="labName"
          name="labName"
          type="text"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setFieldError('');
            setSubmitError('');
          }}
          placeholder="AI Lab"
          className={fieldError ? 'input-error' : ''}
        />
        {fieldError ? <span className="field-error">{fieldError}</span> : null}
      </div>

      {submitError ? <p className="field-error">{submitError}</p> : null}

      <div className="create-org-actions">
        <Button label="Cancel" variant="secondary" onClick={() => { onClose(); resetForm(); }} />
        <Button
          label={isSubmitting ? (initialLab ? 'Saving...' : 'Creating...') : initialLab ? 'Save Changes' : 'Create Lab'}
          variant="primary"
          type="submit"
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
}

export default CreateLab;
