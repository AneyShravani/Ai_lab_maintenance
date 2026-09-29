# AI Lab Maintenance Platform

A full-stack web application for managing AI laboratories, systems, users, assignments, utilization, expenses, and resource availability across multiple organizations.

The platform provides role-based access for **Super Admins, Admins, and Users**, with organization-level data isolation and system-assignment workflows.

## Tech Stack

### Frontend

* React
* JavaScript
* Axios
* HTML/CSS

### Backend

* Node.js
* Express.js
* REST APIs
* JWT Authentication
* Nodemailer
* Multer

### Database

* MongoDB

### Tools

* Git
* GitHub
* VS Code

## Key Features

### Role-Based Access

* **Super Admin:** Creates organizations and assigns administrators.
* **Admin:** Manages labs, systems, users, expenses, utilization, and assignments within their organization.
* **User:** Submits requests for lab/system access and receives a Reference ID after assignment.

### Dashboard

* Displays organization-level statistics.
* Tracks total and available systems.
* Shows occupied systems and lab utilization.
* Provides Reference ID status lookup.

### Lab & System Management

* Create and manage AI labs.
* Add systems to individual labs.
* Track system availability and occupancy.
* Prevent assignment of unavailable systems.

### User Request & Assignment

* Manage user requests containing project details, duration, department, and supporting documents.
* View available labs and systems.
* Assign systems to users.
* Generate Reference IDs for assignments.
* Track active and expired assignments.

### Utilization Tracking

* Track student/project usage of AI tools and systems.
* Record project details, status, and live URLs.
* Monitor active and inactive utilization records.

### Expense Management

* Maintain AI tools/models and associated costs.
* Track expenses and spending across the organization.

### Authentication & Security

* JWT-based authentication.
* Role-based authorization.
* Protected frontend routes.
* Organization-level data isolation.
* Request validation and error handling.
* Sensitive configuration managed through environment variables.

### Notifications & Deadlines

* Track assignment start and end dates.
* Identify assignments approaching expiration.
* Generate notifications for administrators.
* Scheduled deadline checking through backend jobs.

## System Architecture

```text
                    ┌─────────────────────┐
                    │       Users         │
                    │ Super Admin / Admin │
                    │       / User        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │    Admin Dashboard  │
                    └──────────┬──────────┘
                               │ REST APIs
                               ▼
                    ┌─────────────────────┐
                    │  Node.js + Express  │
                    │      Backend        │
                    ├─────────────────────┤
                    │ Authentication      │
                    │ Role Authorization  │
                    │ Business Logic      │
                    │ Validation          │
                    │ File Uploads        │
                    │ Notifications       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      MongoDB        │
                    │                     │
                    │ Organizations       │
                    │ Users               │
                    │ Labs                │
                    │ Systems             │
                    │ Assignments         │
                    │ Expenses            │
                    │ Utilization         │
                    └─────────────────────┘
```

## Core Workflow

1. A user submits a request containing project and access details.
2. The administrator reviews the request and supporting document.
3. Available labs and systems are displayed.
4. The administrator assigns an available system.
5. A unique Reference ID is generated for the assignment.
6. The system tracks the assignment status and validity period.
7. Deadline monitoring identifies assignments approaching expiration.
8. Administrators can check the Reference ID to determine whether an assignment is active, nearing expiry, or expired.

## Project Structure

```text
Ai_lab_maintenance/
│
├── admin/
│   └── React frontend and dashboard
│
├── backend/
│   └── Node.js + Express backend
│
├── docs/
│   └── Project documentation
│
├── PROJECT_ARCHITECTURE.md
├── .gitignore
└── README.md
```

## Data Isolation

The system follows organization-level data isolation.

Each administrator can access data belonging only to their assigned organization. Backend queries use the organization's identifier to prevent one organization from accessing another organization's labs, systems, users, expenses, or assignments.

## Security

* JWT-based authentication
* Role-based authorization
* Protected routes
* Organization-level access control
* Request validation
* Environment variables for sensitive configuration
* Sensitive credentials excluded from version control

## Future Enhancements

* Cloud deployment
* Automated CI/CD pipeline
* Application monitoring
* Improved reporting and analytics
* Additional notification channels
* Containerized deployment using Docker

## Author

**Shravani Aney**

GitHub: [AneyShravani](https://github.com/AneyShravani)
