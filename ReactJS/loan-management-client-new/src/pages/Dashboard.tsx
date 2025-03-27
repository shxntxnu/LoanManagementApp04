import React, { useEffect, useState } from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    LinearProgress,
} from '@mui/material';
import {
    AccountBalance as LoanIcon,
    Payment as PaymentIcon,
    TrendingUp as TrendingUpIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { loanService } from '../services/loanService';
import { Loan } from '../types';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLoans = async () => {
            try {
                const data = await loanService.getMyLoans();
                setLoans(data);
            } catch (error) {
                console.error('Error fetching loans:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLoans();
    }, []);

    const activeLoans = loans.filter(loan => loan.status === 'Active');
    const pendingLoans = loans.filter(loan => loan.status === 'Pending');
    const totalLoanAmount = activeLoans.reduce((sum, loan) => sum + loan.amount, 0);

    const getStatusColor = (status: Loan['status']) => {
        switch (status) {
            case 'Active':
                return 'success.main';
            case 'Pending':
                return 'warning.main';
            case 'Completed':
                return 'info.main';
            case 'Defaulted':
                return 'error.main';
            default:
                return 'text.secondary';
        }
    };

    const StatCard: React.FC<{
        title: string;
        value: string | number;
        icon: React.ReactNode;
        color: string;
    }> = ({ title, value, icon, color }) => (
        <Card>
            <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                    <Box
                        sx={{
                            backgroundColor: `${color}15`,
                            borderRadius: 1,
                            p: 1,
                            mr: 2,
                        }}
                    >
                        {icon}
                    </Box>
                    <Typography variant="h6" component="div">
                        {title}
                    </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ color }}>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );

    if (loading) {
        return <LinearProgress />;
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Welcome back, {user?.name}!
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Active Loans"
                        value={activeLoans.length}
                        icon={<LoanIcon sx={{ color: 'success.main' }} />}
                        color="success.main"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Pending Applications"
                        value={pendingLoans.length}
                        icon={<PaymentIcon sx={{ color: 'warning.main' }} />}
                        color="warning.main"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Loan Amount"
                        value={`$${totalLoanAmount.toLocaleString()}`}
                        icon={<TrendingUpIcon sx={{ color: 'info.main' }} />}
                        color="info.main"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Defaulted Loans"
                        value={loans.filter(loan => loan.status === 'Defaulted').length}
                        icon={<WarningIcon sx={{ color: 'error.main' }} />}
                        color="error.main"
                    />
                </Grid>
            </Grid>

            <Paper sx={{ mt: 4, p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Recent Loan Activity
                </Typography>
                <Grid container spacing={2}>
                    {loans.slice(0, 5).map((loan) => (
                        <Grid item xs={12} key={loan.id}>
                            <Card>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="subtitle1">
                                                Loan #{loan.id.slice(0, 8)}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Amount: ${loan.amount.toLocaleString()}
                                            </Typography>
                                        </Box>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: getStatusColor(loan.status),
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {loan.status}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Paper>
        </Box>
    );
};

export default Dashboard; 