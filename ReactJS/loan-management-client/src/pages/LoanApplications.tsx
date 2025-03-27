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
    MenuItem,
} from '@mui/material';
import { loanService } from '../services/loanService';
import { Loan, LoanApplication } from '../types';

const LoanApplications: React.FC = () => {
    const [applications, setApplications] = useState<LoanApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApplication, setSelectedApplication] = useState<LoanApplication | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [approvalData, setApprovalData] = useState({
        interestRate: '',
        term: '',
        rejectionReason: '',
    });

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const data = await loanService.getAllLoans();
            // Filter pending loans and map them to loan applications
            const pendingApplications = data
                .filter(loan => loan.status === 'Pending')
                .map(loan => ({
                    id: loan.id,
                    borrowerId: loan.borrowerId,
                    amount: loan.amount,
                    purpose: 'Loan Application', // Default purpose since it's not in the Loan type
                    status: loan.status as LoanApplication['status'],
                    createdAt: loan.createdAt,
                    updatedAt: loan.updatedAt,
                }));
            setApplications(pendingApplications);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (application: LoanApplication) => {
        setSelectedApplication(application);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedApplication(null);
        setApprovalData({
            interestRate: '',
            term: '',
            rejectionReason: '',
        });
    };

    const handleApprove = async () => {
        if (!selectedApplication) return;

        try {
            await loanService.approveLoan(selectedApplication.id, {
                interestRate: parseFloat(approvalData.interestRate),
                term: parseInt(approvalData.term),
            });
            handleCloseDialog();
            fetchApplications();
        } catch (error) {
            console.error('Error approving loan:', error);
        }
    };

    const handleReject = async () => {
        if (!selectedApplication) return;

        try {
            await loanService.rejectLoan(selectedApplication.id, approvalData.rejectionReason);
            handleCloseDialog();
            fetchApplications();
        } catch (error) {
            console.error('Error rejecting loan:', error);
        }
    };

    if (loading) {
        return <LinearProgress />;
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Loan Applications
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Application ID</TableCell>
                            <TableCell>Borrower</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Purpose</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Created At</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {applications.map((application) => (
                            <TableRow key={application.id}>
                                <TableCell>{application.id.slice(0, 8)}</TableCell>
                                <TableCell>{application.borrowerId}</TableCell>
                                <TableCell>${application.amount.toLocaleString()}</TableCell>
                                <TableCell>{application.purpose}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={application.status}
                                        color="warning"
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {new Date(application.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleOpenDialog(application)}
                                    >
                                        Review
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Review Loan Application</DialogTitle>
                <DialogContent>
                    {selectedApplication && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Application Details
                            </Typography>
                            <Typography>Amount: ${selectedApplication.amount.toLocaleString()}</Typography>
                            <Typography>Purpose: {selectedApplication.purpose}</Typography>
                            <Typography>
                                Created: {new Date(selectedApplication.createdAt).toLocaleDateString()}
                            </Typography>
                        </Box>
                    )}
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Interest Rate (%)"
                        type="number"
                        fullWidth
                        value={approvalData.interestRate}
                        onChange={(e) => setApprovalData({ ...approvalData, interestRate: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Term (months)"
                        type="number"
                        fullWidth
                        value={approvalData.term}
                        onChange={(e) => setApprovalData({ ...approvalData, term: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Rejection Reason (if rejecting)"
                        type="text"
                        fullWidth
                        multiline
                        rows={3}
                        value={approvalData.rejectionReason}
                        onChange={(e) => setApprovalData({ ...approvalData, rejectionReason: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        onClick={handleReject}
                        color="error"
                        disabled={!approvalData.rejectionReason}
                    >
                        Reject
                    </Button>
                    <Button
                        onClick={handleApprove}
                        variant="contained"
                        disabled={!approvalData.interestRate || !approvalData.term}
                    >
                        Approve
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default LoanApplications; 