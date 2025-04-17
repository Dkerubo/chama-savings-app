import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  Box, 
  Typography, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Pagination,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupsIcon from '@mui/icons-material/Groups';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';

const GroupList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchGroups = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const response = await api.get(`/groups?page=${page}&search=${search}`);
      setGroups(response.data.items);
      setTotalPages(response.data.pages);
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Failed to fetch groups', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups(page, searchTerm);
  }, [page, searchTerm]);

  const handleOpenDialog = (group = null) => {
    setEditingGroup(group);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGroup(null);
  };

  const handleDelete = async (groupId) => {
    try {
      await api.delete(`/groups/${groupId}`);
      setSnackbar({ 
        open: true, 
        message: 'Group deleted successfully', 
        severity: 'success' 
      });
      fetchGroups(page, searchTerm);
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Failed to delete group', 
        severity: 'error' 
      });
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (editingGroup) {
        await api.put(`/groups/${editingGroup.id}`, values);
        setSnackbar({ 
          open: true, 
          message: 'Group updated successfully', 
          severity: 'success' 
        });
      } else {
        await api.post('/groups', values);
        setSnackbar({ 
          open: true, 
          message: 'Group created successfully', 
          severity: 'success' 
        });
      }
      fetchGroups(page, searchTerm);
      handleCloseDialog();
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.error || 'Operation failed', 
        severity: 'error' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required('Name is required')
      .max(100, 'Name must be less than 100 characters'),
    description: Yup.string()
      .max(500, 'Description must be less than 500 characters'),
    monthly_target: Yup.number()
      .min(0, 'Target must be positive')
      .required('Monthly target is required'),
  });

  const initialValues = {
    name: editingGroup?.name || '',
    description: editingGroup?.description || '',
    monthly_target: editingGroup?.monthly_target || 0,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'error';
      case 'Pending': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center' }}>
          <GroupsIcon sx={{ mr: 1, color: 'primary.main' }} /> Groups
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search groups..."
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ minWidth: 250 }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ whiteSpace: 'nowrap' }}
          >
            New Group
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh' 
        }}>
          <CircularProgress size={60} />
        </Box>
      ) : groups.length === 0 ? (
        <Paper sx={{ 
          p: 4, 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}>
          <GroupsIcon sx={{ fontSize: 60, color: 'text.disabled' }} />
          <Typography variant="h6" color="text.secondary">
            {searchTerm ? 'No groups match your search' : 'No groups found'}
          </Typography>
          {!searchTerm && (
            <Button 
              variant="outlined" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Create your first group
            </Button>
          )}
        </Paper>
      ) : (
        <>
          <TableContainer 
            component={Paper}
            sx={{ 
              maxHeight: 'calc(100vh - 220px)',
              overflow: 'auto'
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Monthly Target</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groups.map((group) => (
                  <TableRow 
                    key={group.id} 
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                      <Button 
                        onClick={() => navigate(`/groups/${group.id}`)}
                        startIcon={<VisibilityIcon />}
                        sx={{ textTransform: 'none' }}
                      >
                        {group.name}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        sx={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '300px'
                        }}
                      >
                        {group.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={group.status} 
                        color={getStatusColor(group.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {moment(group.created_at).format('MMM D, YYYY')}
                    </TableCell>
                    <TableCell>
                      KSh {group.monthly_target?.toLocaleString() || '0'}
                    </TableCell>
                    <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                      <Tooltip title="Edit">
                        <IconButton 
                          onClick={() => handleOpenDialog(group)}
                          color="primary"
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          onClick={() => handleDelete(group.id)}
                          color="error"
                          size="small"
                          sx={{ ml: 1 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mt: 3,
              pt: 2,
              borderTop: '1px solid',
              borderColor: 'divider'
            }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
                shape="rounded"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      {/* Group Form Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        fullWidth 
        maxWidth="sm"
      >
        <DialogTitle>
          {editingGroup ? 'Edit Group' : 'Create New Group'}
        </DialogTitle>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form>
              <DialogContent dividers>
                <Field
                  as={TextField}
                  name="name"
                  label="Group Name *"
                  fullWidth
                  margin="normal"
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                />
                <Field
                  as={TextField}
                  name="description"
                  label="Description"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={4}
                  error={touched.description && Boolean(errors.description)}
                  helperText={touched.description && errors.description}
                />
                <Field
                  as={TextField}
                  name="monthly_target"
                  label="Monthly Target (KSh) *"
                  type="number"
                  fullWidth
                  margin="normal"
                  InputProps={{
                    startAdornment: 'KSh ',
                  }}
                  error={touched.monthly_target && Boolean(errors.monthly_target)}
                  helperText={touched.monthly_target && errors.monthly_target}
                />
              </DialogContent>
              <DialogActions>
                <Button 
                  onClick={handleCloseDialog}
                  color="inherit"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                >
                  {editingGroup ? 'Update' : 'Create'} Group
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GroupList;