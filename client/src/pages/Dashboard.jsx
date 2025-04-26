import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroups } from '../redux/slices/groupSlice';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import MemberDashboard from '../components/dashboard/MemberDashboard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { groups, isLoading } = useSelector((state) => state.groups);
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(fetchGroups());
  }, [dispatch]);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {user?.role === 'admin' ? (
        <AdminDashboard groups={groups} />
      ) : (
        <MemberDashboard groups={groups} />
      )}
    </div>
  );
};

export default Dashboard;