
import { useEffect, useState } from "react";
import { User } from "../../types";
import { get_user, deleteUser, addUser, updateUser } from "../../api/userApi";
import UserForm from "../../components/shared/UserForm";
import UserTable from "../../components/shared/UserTable";
import Alert from "../../components/shared/Alert";
import ConfirmDialog from "../../components/shared/ConfirmDialog";

const AdminUserDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<Partial<User> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await get_user();
      setUsers(res);
    } catch (error) {
      setAlert({ type: "error", message: "Failed to fetch users." });
    }
  };

  const handleAdd = () => {
    setSelectedUser(null);
    setShowForm(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleDelete = (user: User) => {
    setConfirmDelete(user);
  };

  const confirmDeleteUser = async () => {
    try {
      if (confirmDelete) {
        await deleteUser(confirmDelete.id);
        setAlert({ type: "success", message: "User deleted successfully." });
        fetchUsers();
      }
    } catch {
      setAlert({ type: "error", message: "Failed to delete user." });
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleSubmit = async (user: Partial<User>) => {
    try {
      if (user.id) {
        await updateUser(user.id, user);
        setAlert({ type: "success", message: "User updated." });
      } else {
        await addUser(user);
        setAlert({ type: "success", message: "User added." });
      }
      setShowForm(false);
      fetchUsers();
    } catch {
      setAlert({ type: "error", message: "Action failed." });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-emerald-700">Manage Users</h2>
        <button
          onClick={handleAdd}
          className="bg-emerald-700 text-white px-4 py-2 rounded hover:bg-emerald-800 transition"
        >
          Add User
        </button>
      </div>

      {alert && (
        <div className="mb-4">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      {showForm && (
        <div className="mb-8">
          <UserForm
            user={selectedUser || {}}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <UserTable users={users} onEdit={handleEdit} onDelete={handleDelete} />

      {confirmDelete && (
        <ConfirmDialog
          message={`Are you sure you want to delete ${confirmDelete.username}?`}
          onConfirm={confirmDeleteUser}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
};

export default AdminUserDashboard;
