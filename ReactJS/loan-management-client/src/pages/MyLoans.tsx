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
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { loanService } from '../services/loanService';
import { Loan, LoanApplication } from '../types';

const MyLoans: React.FC = () => {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [newLoan, setNewLoan] = useState({
        amount: '',
        purpose: '',
    });

    useEffect(() => {
        fetchLoans();
    }, []);

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

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setNewLoan({ amount: '', purpose: '' });
    };

    const handleSubmit = async () => {
        try {
            await loanService.createLoanApplication({
                amount: parseFloat(newLoan.amount),
                purpose: newLoan.purpose,
            });
            handleCloseDialog();
            fetchLoans();
        } catch (error) {
            console.error('Error creating loan application:', error);
        }
    };

    const getStatusColor = (status: Loan['status']) => {
        switch (status) {
            case 'Active':
                return 'success';
            case 'Pending':
                return 'warning';
            case 'Completed':
                return 'info';
            case 'Defaulted':
                return 'error';
            default:
                return 'default';
        }
    };

    if (loading) {
        return <LinearProgress />;
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">My Loans</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenDialog}
                >
                    Apply for a Loan
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Loan ID</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Interest Rate</TableCell>
                            <TableCell>Term (months)</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Created At</TableCell>
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
                                    <Chip
                                        label={loan.status}
                                        color={getStatusColor(loan.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {new Date(loan.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => {/* TODO: Implement view details */}}
                                    >
                                        View Details
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Apply for a New Loan</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Loan Amount"
                        type="number"
                        fullWidth
                        value={newLoan.amount}
                        onChange={(e) => setNewLoan({ ...newLoan, amount: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Purpose"
                        type="text"
                        fullWidth
                        value={newLoan.purpose}
                        onChange={(e) => setNewLoan({ ...newLoan, purpose: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        Submit Application
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MyLoans; 