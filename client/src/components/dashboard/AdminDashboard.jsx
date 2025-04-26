import StatsCard from './StatsCard';
import RecentActivity from './RecentActivity';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const AdminDashboard = ({ groups }) => {
  const totalGroups = groups.length;
  const activeGroups = groups.filter(g => g.status === 'active').length;
  const totalMembers = groups.reduce((sum, group) => sum + group.memberCount, 0);
  const totalContributions = groups.reduce((sum, group) => sum + group.currentAmount, 0);
  
  const groupStatusData = {
    labels: ['Active', 'Inactive'],
    datasets: [
      {
        data: [activeGroups, totalGroups - activeGroups],
        backgroundColor: ['#0ea5e9', '#94a3b8'],
      },
    ],
  };
  
  
  return (
    
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Total Groups" value={totalGroups} icon="groups" />
        <StatsCard title="Active Groups" value={activeGroups} icon="active" />
        <StatsCard title="Total Members" value={totalMembers} icon="people" />
        <StatsCard 
          title="Total Contributions" 
          value={`$${totalContributions.toLocaleString()}`} 
          icon="money" 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Groups Status</h2>
          <div className="h-64">
            <Pie data={groupStatusData} />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Groups</h2>
          <Link 
            to="/groups/new" 
            className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600"
          >
            Create New Group
          </Link>
        </div>
        
        {groups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map(group => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">You haven't created any groups yet.</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;



{/* <script src="https://cdn.socket.io/4.0.0/socket.io.min.js"></script>
<script>
    const socket = io('http://localhost:5000/notifications');

    socket.on('connect', () => {
        console.log('Connected to notifications WebSocket!');
    });

    socket.on('new_notification', (data) => {
        console.log('New notification received:', data);
        // Here you can dynamically update your dashboard UI, e.g., show a toast
        alert(`New Notification: ${data.title} - ${data.message}`);
    });
</script> */}
