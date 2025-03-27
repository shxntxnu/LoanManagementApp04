import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    LinearProgress,
    Chip,
    Grid,
    Card,
    CardContent,
} from '@mui/material';
import {
    AccountBalance as LoanIcon,
    Payment as PaymentIcon,
    TrendingUp as TrendingUpIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';
import { loanService } from '../services/loanService';
import { Loan, Payment } from '../types';

const Payments: React.FC = () => {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLoans();
    }, []);

    const fetchLoans = async () => {
        try {
            const data = await loanService.getMyLoans();
            setLoans(data.filter(loan => loan.status === 'Active'));
        } catch (error) {
            console.error('Error fetching loans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (loan: Loan) => {
        setSelectedLoan(loan);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedLoan(null);
        setPaymentAmount('');
    };

    const handleSubmitPayment = async () => {
        if (!selectedLoan || !paymentAmount) return;

        try {
            await loanService.makePayment(selectedLoan.id, parseFloat(paymentAmount));
            handleCloseDialog();
            fetchLoans();
        } catch (error) {
            console.error('Error making payment:', error);
        }
    };

    const getStatusColor = (status: Payment['status']) => {
        switch (status) {
            case 'Completed':
                return 'success';
            case 'Pending':
                return 'warning';
            case 'Failed':
                return 'error';
            default:
                return 'default';
        }
    };

    if (loading) {
        return <LinearProgress />;
    }

    const activeLoans = loans.filter(loan => loan.status === 'Active');
    const totalLoanAmount = activeLoans.reduce((sum, loan) => sum + loan.amount, 0);

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Loan Payments
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Box
                                    sx={{
                                        backgroundColor: 'success.main15',
                                        borderRadius: 1,
                                        p: 1,
                                        mr: 2,
                                    }}
                                >
                                    <LoanIcon sx={{ color: 'success.main' }} />
                                </Box>
                                <Typography variant="h6">Active Loans</Typography>
                            </Box>
                            <Typography variant="h4" color="success.main">
                                {activeLoans.length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Box
                                    sx={{
                                        backgroundColor: 'info.main15',
                                        borderRadius: 1,
                                        p: 1,
                                        mr: 2,
                                    }}
                                >
                                    <TrendingUpIcon sx={{ color: 'info.main' }} />
                                </Box>
                                <Typography variant="h6">Total Amount</Typography>
                            </Box>
                            <Typography variant="h4" color="info.main">
                                ${totalLoanAmount.toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Loan ID</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Interest Rate</TableCell>
                            <TableCell>Term (months)</TableCell>
                            <TableCell>Next Payment</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loans.map((loan) => (
                            <TableRow key={loan.id}>
                                <TableCell>{loan.id.slice(0, 8)}</TableCell>
                                <TableCell>${loan.amount.toLocaleString()}</TableCell>
                                <TableCell>{loan.interestRate}%</TableCell>
                                <TableCell>{loan.term}</TableCell>
                                <TableCell>
                                    {/* TODO: Calculate and display next payment date */}
                                    <Chip
                                        label="Due in 15 days"
                                        color="warning"
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => handleOpenDialog(loan)}
                                    >
                                        Make Payment
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Make a Payment</DialogTitle>
                <DialogContent>
                    {selectedLoan && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Loan Details
                            </Typography>
                            <Typography>Loan ID: {selectedLoan.id.slice(0, 8)}</Typography>
                            <Typography>Amount: ${selectedLoan.amount.toLocaleString()}</Typography>
                            <Typography>Interest Rate: {selectedLoan.interestRate}%</Typography>
                        </Box>
                    )}
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Payment Amount"
                        type="number"
                        fullWidth
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        onClick={handleSubmitPayment}
                        variant="contained"
                        disabled={!paymentAmount}
                    >
                        Submit Payment
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Payments; 