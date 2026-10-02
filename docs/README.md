# AI Lab Maintenance Platform

A full-stack web application for managing AI laboratories, systems, users, assignments, resource utilization, expenses, and availability across multiple organizations.

The platform provides **role-based access control** for Super Admins, Admins, and Users, while maintaining organization-level data isolation and structured lab/system assignment workflows.

The application has also been **deployed on AWS**, with the frontend hosted using **Amazon S3** and the backend deployed on **Amazon EC2**.

---

## 🚀 Project Overview

The AI Lab Maintenance Platform is designed to digitize and streamline the management of AI laboratory resources.

It allows administrators to:

* Manage AI laboratories and systems
* Manage users and organizations
* Track system availability and utilization
* Review user requests
* Assign available systems
* Generate unique Reference IDs
* Track assignment validity and deadlines
* Manage AI tools and related expenses
* Monitor resource usage

Users can submit requests for lab/system access and track their assignment using the generated Reference ID.

---

## 🛠️ Tech Stack

### Frontend

* React
* JavaScript
* Axios
* HTML
* CSS

### Backend

* Node.js
* Express.js
* REST APIs
* JWT Authentication
* Nodemailer
* Multer
* Node Cron

### Database

* MongoDB

### Cloud & Deployment

* Amazon S3 — Frontend hosting
* Amazon EC2 — Backend deployment
* Linux / Amazon Linux
* Git & GitHub
* MongoDB Atlas

### Development Tools

* Git
* GitHub
* VS Code

---

## ☁️ Cloud Deployment

The application has been deployed to AWS to make the web application accessible outside the local development environment.

### Frontend — Amazon S3

The React frontend is built and hosted using an **Amazon S3 static website**.

```text
React Application
       │
       ▼
npm run build
       │
       ▼
Production Build
       │
       ▼
Amazon S3
       │
       ▼
Public Web Application
```

### Backend — Amazon EC2

The Node.js/Express backend is deployed on an **Amazon EC2 Linux instance**.

```text
Node.js + Express Backend
          │
          ▼
       GitHub
          │
          ▼
     Amazon EC2
          │
          ▼
     Port 5000
          │
          ▼
      REST APIs
```

### Database — MongoDB Atlas

The deployed backend connects to **MongoDB Atlas** for persistent application data.

```text
Amazon S3
   │
   │ API Requests
   ▼
Amazon EC2
   │
   │ MongoDB Connection
   ▼
MongoDB Atlas
```

### Deployment Components

| Component         | Technology        |
| ----------------- | ----------------- |
| Frontend          | React             |
| Frontend Hosting  | Amazon S3         |
| Backend           | Node.js + Express |
| Backend Hosting   | Amazon EC2        |
| Operating System  | Amazon Linux      |
| Database          | MongoDB Atlas     |
| Source Control    | Git + GitHub      |
| API Communication | REST APIs         |

### Deployment Repository

The cloud deployment configuration, deployment documentation, and AWS-related project work are maintained separately in the cloud deployment repository:

**AWS Cloud Deployment Repository:**
https://github.com/AneyShravani/aws-cloud-web-deployment

---

## ✨ Key Features

### 1. Role-Based Access Control

The application supports three primary roles:

**Super Admin**

* Creates and manages organizations
* Assigns administrators

**Admin**

* Manages labs and systems
* Manages users
* Reviews requests
* Assigns systems
* Tracks utilization
* Manages expenses
* Monitors assignment deadlines

**User**

* Submits lab/system access requests
* Provides project and duration details
* Uploads supporting documents
* Receives a Reference ID after assignment

---

### 2. Dashboard

The dashboard provides an overview of organization-level resources and activity.

It includes:

* Total systems
* Available systems
* Occupied systems
* Lab utilization
* Assignment information
* Reference ID status

---

### 3. Lab & System Management

Administrators can:

* Create and manage AI labs
* Add systems to individual labs
* Track system availability
* Track occupied systems
* Prevent unavailable systems from being assigned

---

### 4. Request & Assignment Management

Users can submit requests containing:

* Project details
* Department
* Required duration
* Lab/system requirements
* Supporting documents

Administrators can then:

1. Review the request
2. Check available labs and systems
3. Assign an available system
4. Generate a unique Reference ID
5. Track the assignment status
6. Monitor the assignment validity period

---

### 5. Utilization Tracking

The platform tracks usage of AI laboratory resources.

Administrators can record and monitor:

* Project details
* AI tools/systems being used
* Utilization status
* Project status
* Live project URLs
* Active and inactive utilization records

---

### 6. Expense Management

Administrators can maintain records of AI tools/models and associated costs.

The system supports:

* AI tool management
* Expense tracking
* Cost monitoring
* Organization-level spending records

---

### 7. Authentication & Security

The application implements:

* JWT-based authentication
* Role-based authorization
* Protected frontend routes
* Organization-level access control
* Request validation
* Error handling
* Environment variables for sensitive configuration
* Exclusion of sensitive credentials from version control

---

### 8. Assignment Deadlines & Notifications

The backend tracks assignment start and end dates.

The system can:

* Identify assignments approaching expiration
* Track expired assignments
* Generate administrator notifications
* Perform scheduled deadline checks using backend jobs

---

## 📸 Application Screenshots


[View all screenshots →](screenshots/)


## 🔄 Core Application Workflow

```text
User
 │
 ▼
Submit Lab/System Request
 │
 ▼
Admin Reviews Request
 │
 ▼
Check Available Labs & Systems
 │
 ▼
Assign Available System
 │
 ▼
Generate Reference ID
 │
 ▼
Track Assignment
 │
 ├── Active
 ├── Nearing Expiry
 └── Expired
 │
 ▼
Track Resource Utilization
```

---

## ☁️ Cloud Architecture

```text
                     Users
                       │
                       ▼
              ┌─────────────────┐
              │  Amazon S3      │
              │ React Frontend  │
              └────────┬────────┘
                       │
                  REST API Calls
                       │
                       ▼
              ┌─────────────────┐
              │  Amazon EC2     │
              │ Node.js/Express │
              │    Backend      │
              └────────┬────────┘
                       │
                 MongoDB Driver
                       │
                       ▼
              ┌─────────────────┐
              │ MongoDB Atlas   │
              │    Database     │
              └─────────────────┘
```

---

## 🏗️ Application Architecture

```text
                  ┌─────────────────────────┐
                  │         Users           │
                  │ Super Admin / Admin     │
                  │        / User           │
                  └────────────┬────────────┘
                               │
                               ▼
                  ┌─────────────────────────┐
                  │     React Frontend      │
                  │    Admin Dashboard      │
                  └────────────┬────────────┘
                               │
                         REST APIs
                               │
                               ▼
                  ┌─────────────────────────┐
                  │    Node.js + Express    │
                  │         Backend         │
                  ├─────────────────────────┤
                  │ Authentication          │
                  │ Authorization           │
                  │ Business Logic          │
                  │ Validation               │
                  │ File Uploads             │
                  │ Notifications            │
                  └────────────┬────────────┘
                               │
                               ▼
                  ┌─────────────────────────┐
                  │         MongoDB         │
                  ├─────────────────────────┤
                  │ Organizations            │
                  │ Users                    │
                  │ Labs                     │
                  │ Systems                  │
                  │ Assignments              │
                  │ Expenses                 │
                  │ Utilization              │
                  └─────────────────────────┘
```

---

## 📁 Project Structure

```text
Ai_lab_maintenance/
│
├── admin/
│   └── React frontend and dashboard
│
├── backend/
│   └── Node.js + Express backend
│
├── screenshots/
│   └── Application screenshots
│
├── docs/
│   └── Project documentation
│
├── PROJECT_ARCHITECTURE.md
├── AI_LAB_Tracker_V1_DOC.docx
├── .gitignore
└── README.md
```

---

## 🔐 Organization-Level Data Isolation

The system uses organization-level data isolation.

Each administrator can access data associated with their assigned organization.

Backend queries use the organization's identifier to prevent unauthorized access to another organization's:

* Labs
* Systems
* Users
* Assignments
* Expenses
* Utilization records

---

## 📋 Example Workflow

### Request

A user submits a request for access to an AI laboratory system.

### Review

The administrator reviews the project details, duration, department, and supporting documents.

### Assignment

The administrator checks system availability and assigns an available system.

### Reference ID

The system generates a unique Reference ID for the assignment.

### Tracking

The assignment is tracked throughout its validity period.

### Utilization

The administrator can monitor the associated project and resource utilization.

### Expiration

The system identifies assignments approaching their end date and tracks expired assignments.

---

## 📚 Documentation

Additional project documentation is available in the repository, including:

* System architecture
* Project documentation
* Application screenshots

For the AWS deployment process and cloud-specific implementation details, see the separate deployment repository:

**AWS Cloud Deployment:**
https://github.com/AneyShravani/aws-cloud-web-deployment

---

## 🔮 Future Enhancements

Potential future improvements include:

* Automated CI/CD pipeline
* Application monitoring and centralized logging
* Improved reporting and analytics
* Additional notification channels
* Containerized deployment using Docker
* Advanced resource utilization analytics

---

## 👩‍💻 Author

**Shravani Aney**

GitHub: https://github.com/AneyShravani

---

## 📌 Project Focus

This project demonstrates practical experience with:

* Full-stack web development
* REST API development
* Role-based access control
* Database-driven application design
* Resource management
* Authentication and authorization
* Backend scheduling
* File handling
* Organization-level data isolation
* Git and GitHub
* AWS cloud deployment
* Amazon S3
* Amazon EC2
* MongoDB Atlas
