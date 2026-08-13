import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../assets/colors.css';
import '../auth/Login.css'; // reuse login page styling
import authService from '../../services/authService';

function StudentSignup() {
    const navigate = useNavigate();
    const [orgs, setOrgs] = useState([]); // dropdown list of colleges
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        rollNumber: '',
        department: '',
        userType: 'student',
        orgId: '',
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // load college dropdown on mount
        authService.getPublicOrganizations()
            .then((data) => setOrgs(data))
            .catch(() => setError('Unable to load colleges. Please refresh.'));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.name || !form.email || !form.password || !form.rollNumber || !form.department || !form.orgId) {
            setError('Please fill in all fields.');
            return;
        }

        setIsSubmitting(true);
        try {
            await authService.signup(form);
            navigate('/login', { state: { message: 'Account created. Please log in.' } });
        } catch (err) {
            setError(err?.response?.data?.message || 'Signup failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-brand">
                    <h1>AI Lab Maintenance</h1>
                    <p>Create your student account</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="login-field">
                        <label htmlFor="name">Full Name</label>
                        <input id="name" name="name" type="text" value={form.name} onChange={handleChange} />
                    </div>

                    <div className="login-field">
                        <label htmlFor="email">Email</label>
                        <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
                    </div>

                    <div className="login-field">
                        <label htmlFor="password">Password</label>
                        <input id="password" name="password" type="password" value={form.password} onChange={handleChange} />
                    </div>

                    <div className="login-field">
                        <label htmlFor="rollNumber">Roll Number</label>
                        <input id="rollNumber" name="rollNumber" type="text" value={form.rollNumber} onChange={handleChange} />
                    </div>

                    <div className="login-field">
                        <label htmlFor="department">Department</label>
                        <input id="department" name="department" type="text" value={form.department} onChange={handleChange} />
                    </div>

                    <div className="login-field">
                        <label htmlFor="userType">You are a</label>
                        <select id="userType" name="userType" value={form.userType} onChange={handleChange}>
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                            <option value="hod">HOD</option>
                            <option value="hr">HR</option>
                            <option value="employee">Employee</option>
                        </select>
                    </div>

                    <div className="login-field">
                        <label htmlFor="orgId">College</label>
                        <select id="orgId" name="orgId" value={form.orgId} onChange={handleChange}>
                            <option value="">Select your college</option>
                            {orgs.map((org) => (
                                <option key={org._id} value={org._id}>{org.name}</option>
                            ))}
                        </select>
                    </div>

                    {error ? <p className="login-error">{error}</p> : null}

                    <button className="app-button button-primary" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="login-signup-link">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </div>
        </div>
    );
}

export default StudentSignup;