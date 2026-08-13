import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Login from "../pages/auth/Login";
import ResetPassword from "../pages/auth/ResetPassword";
import Unauthorized from "../pages/auth/Unauthorized";
import Dashboard from "../pages/dashboard/Dashboard";
import LabList from "../pages/labs/LabList";
import OrganizationList from "../pages/organizations/OrganizationList";
import ExpenseList from "../pages/expenses/ExpenseList";
import ProtectedRoute from "./ProtectedRoute";
import UtilizationList from "../pages/utilization/UtilizationList";
import RequestList from "../pages/users/RequestList";
import RequestDetail from "../pages/users/RequestDetail";
import AssignSystem from "../pages/users/AssignSystem";
import AssignmentList from "../pages/users/AssignmentList";
import StudentRequestForm from "../pages/students/StudentRequestForm";
import StudentSignup from "../pages/students/StudentSignup";
import LogEntry from "../pages/logs/LogEntry";
import LogList from "../pages/logs/LogList";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/student/signup" element={<StudentSignup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/forgot-reset-password"
        element={<ResetPassword mode="forgot" />}
      />
      <Route
        path="/reset-password"
        element={
          <ProtectedRoute requireFirstLogin>
            <ResetPassword />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]} blockFirstLogin>
            <PageLayout>
              <Dashboard />
            </PageLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/unauthorized"
        element={
          <ProtectedRoute>
            <PageLayout>
              <Unauthorized />
            </PageLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizations"
        element={
          <ProtectedRoute requireSuperAdmin>
            <PageLayout>
              <OrganizationList />
            </PageLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/labs"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]} blockFirstLogin>
            <PageLayout>
              <LabList />
            </PageLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]} blockFirstLogin>
            <PageLayout>
              <ExpenseList />
            </PageLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/utilization"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]} blockFirstLogin>
            <PageLayout>
              <UtilizationList />
            </PageLayout>
          </ProtectedRoute>
        }
      />

      {/* Module 3.7 — Users & Assignment workflow */}
      <Route
        path="/requests"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]} blockFirstLogin>
            <PageLayout>
              <RequestList />
            </PageLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/requests/:id"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]} blockFirstLogin>
            <PageLayout>
              <RequestDetail />
            </PageLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/assign/:requestId"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]} blockFirstLogin>
            <PageLayout>
              <AssignSystem />
            </PageLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/assignments"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]} blockFirstLogin>
            <PageLayout>
              <AssignmentList />
            </PageLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/logs"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]} blockFirstLogin>
            <PageLayout>
              <LogEntry />
            </PageLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/logs/history"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]} blockFirstLogin>
            <PageLayout>
              <LogList />
            </PageLayout>
          </ProtectedRoute>
        }
      />

      {/* Student Dashboard Route (Guarded) */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]} blockFirstLogin>
            <StudentRequestForm />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;