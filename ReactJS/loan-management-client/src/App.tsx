import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { theme } from './theme';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoadingSpinner } from './components/LoadingSpinner';

// Lazy load components for better performance
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const MyLoans = React.lazy(() => import('./pages/MyLoans'));
const LoanApplications = React.lazy(() => import('./pages/LoanApplications'));
const Payments = React.lazy(() => import('./pages/Payments'));
const Users = React.lazy(() => import('./pages/Users'));
const Settings = React.lazy(() => import('./pages/Settings'));

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <Router>
                    <React.Suspense fallback={<LoadingSpinner />}>
                        <Routes>
                            {/* Public routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            {/* Protected routes */}
                            <Route
                                path="/"
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <Dashboard />
                                        </Layout>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/loans"
                                element={
                                    <ProtectedRoute allowedRoles={['Borrower']}>
                                        <Layout>
                                            <MyLoans />
                                        </Layout>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/loan-applications"
                                element={
                                    <ProtectedRoute allowedRoles={['Loan Officer']}>
                                        <Layout>
                                            <LoanApplications />
                                        </Layout>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/payments"
                                element={
                                    <ProtectedRoute allowedRoles={['Borrower']}>
                                        <Layout>
                                            <Payments />
                                        </Layout>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/users"
                                element={
                                    <ProtectedRoute allowedRoles={['Admin']}>
                                        <Layout>
                                            <Users />
                                        </Layout>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/settings"
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <Settings />
                                        </Layout>
                                    </ProtectedRoute>
                                }
                            />

                            {/* Catch all route */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </React.Suspense>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App; 