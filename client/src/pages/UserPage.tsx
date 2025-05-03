import { useState, useEffect } from "react";
import { User } from "../types";
import UserForm from "../components/shared/UserForm";
import UserTable from "../components/shared/UserTable";
import Alert from "../components/shared/Alert";
import ConfirmDialog from "../components/shared/ConfirmDialog";
import { get_user, addUser, updateUser, deleteUser } from "../api/userApi";

const UserPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User>>({});
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ userId: string; visible: boolean }>({ userId: "", visible: false });

  // Fetch users on mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await get_user();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users", error);
        setAlert({ type: "error", message: "Failed to fetch users" });
      }
    };

    loadUsers();
  }, []);

  const handleAddUser = async (user: Partial<User>) => {
    try {
      const newUser = {
        ...user,
        id: (Math.random() * 1000000).toString(),
      };
      await addUser(newUser);
      const updatedUsers = await get_user();
      setUsers(updatedUsers);
      setShowForm(false);
      setAlert({ type: "success", message: "User added successfully!" });
    } catch (error) {
      setAlert({ type: "error", message: "Failed to add user." });
    }
  };

  const handleUpdateUser = async (user: Partial<User>) => {
    try {
      if (!user.id) return;
      await updateUser(user.id, user);
      const updatedUsers = await get_user();
      setUsers(updatedUsers);
      setShowForm(false);
      setAlert({ type: "success", message: "User updated successfully!" });
    } catch (error) {
      setAlert({ type: "error", message: "Failed to update user." });
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser(confirmDelete.userId);
      const updatedUsers = await get_user();
      setUsers(updatedUsers);
      setConfirmDelete({ ...confirmDelete, visible: false });
      setAlert({ type: "success", message: "User deleted successfully!" });
    } catch (error) {
      setAlert({ type: "error", message: "Failed to delete user." });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
      <button
        onClick={() => {
          setShowForm(true);
          setCurrentUser({});
        }}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Add User
      </button>

      {showForm && (
        <UserForm
          user={currentUser}
          onSubmit={currentUser.id ? handleUpdateUser : handleAddUser}
          onCancel={() => setShowForm(false)}
        />
      )}

      <UserTable
        users={users}
        onEdit={(user) => {
          setCurrentUser(user);
          setShowForm(true);
        }}
        onDelete={(user) => setConfirmDelete({ userId: user.id, visible: true })}
      />

      {confirmDelete.visible && (
        <ConfirmDialog
          message="Are you sure you want to delete this user?"
          onConfirm={handleDeleteUser}
          onCancel={() => setConfirmDelete({ userId: "", visible: false })}
        />
      )}
    </div>
  );
};

export default UserPage;
