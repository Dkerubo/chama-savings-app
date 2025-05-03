import React, { useEffect, useState } from "react";
import Alert from "../shared/Alert";

// Define the User interface
interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

const UserTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Omit<User, "id">>({
    username: "",
    email: "",
    role: "member",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mockUsers: User[] = [
    { id: 1, username: "aik", email: "aik@gmail.com", role: "member" },
    { id: 2, username: "mum", email: "aik@gmail.com", role: "member" },
    { id: 3, username: "jim", email: "aik@gmail.com", role: "member" },
    { id: 4, username: "jose", email: "jose@gmail.com", role: "member" },
    { id: 5, username: "mike", email: "mike@gmail.com", role: "member" },
    { id: 6, username: "leoo", email: "leoo@gmail.com", role: "member" },
    { id: 7, username: "gee", email: "gee@gmail.com", role: "member" },
    { id: 8, username: "dee", email: "Dee@gmail.com", role: "member" },
    { id: 9, username: "kama", email: "kama@gmail.com", role: "member" },
  ];

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      setUsers(mockUsers);
    } catch (err) {
      setError("Failed to fetch users.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    setError(null);
    try {
      setUsers(users.filter((user) => user.id !== id));
      setSuccess("User deleted successfully.");
    } catch {
      setError("Failed to delete user.");
    }
  };

  const handleEditSave = () => {
    if (editingUser) {
      setUsers(users.map((u) => (u.id === editingUser.id ? editingUser : u)));
      setSuccess("User updated successfully.");
      setEditingUser(null);
    }
  };

  const handleAddUser = () => {
    if (!newUser.username || !newUser.email) {
      setError("Username and email are required.");
      return;
    }

    const nextId = Math.max(0, ...users.map((u) => u.id)) + 1;
    const newUserWithId: User = { id: nextId, ...newUser };
    setUsers([...users, newUserWithId]);
    setSuccess("User added successfully.");
    setNewUser({ username: "", email: "", role: "member" });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-emerald-700">User List</h3>
        <button
          onClick={fetchUsers}
          disabled={isLoading}
          className="text-sm bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700 disabled:opacity-50"
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="mb-4">
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}
      {success && (
        <div className="mb-4">
          <Alert type="success" message={success} onClose={() => setSuccess(null)} />
        </div>
      )}

      {/* Add User Form */}
      <div className="mb-4 p-4 border rounded bg-gray-50">
        <h4 className="text-lg font-medium mb-2 text-emerald-700">Add User</h4>
        <div className="flex gap-4 flex-wrap">
          <input
            type="text"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            placeholder="Username"
            className="border p-2 rounded"
          />
          <input
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            placeholder="Email"
            className="border p-2 rounded"
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>
          <button
            onClick={handleAddUser}
            className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700"
          >
            Add User
          </button>
        </div>
      </div>

      {/* Edit User Form */}
      {editingUser && (
        <div className="mb-4 p-4 border rounded bg-gray-50">
          <h4 className="text-lg font-medium mb-2 text-emerald-700">Edit User</h4>
          <div className="flex gap-4 flex-wrap">
            <input
              type="text"
              value={editingUser.username}
              onChange={(e) =>
                setEditingUser({ ...editingUser, username: e.target.value })
              }
              placeholder="Username"
              className="border p-2 rounded"
            />
            <input
              type="email"
              value={editingUser.email}
              onChange={(e) =>
                setEditingUser({ ...editingUser, email: e.target.value })
              }
              placeholder="Email"
              className="border p-2 rounded"
            />
            <select
              value={editingUser.role}
              onChange={(e) =>
                setEditingUser({ ...editingUser, role: e.target.value })
              }
              className="border p-2 rounded"
            >
              <option value="admin">Admin</option>
              <option value="member">Member</option>
            </select>
            <button
              onClick={handleEditSave}
              className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700"
            >
              Save
            </button>
            <button
              onClick={() => setEditingUser(null)}
              className="text-red-600 underline px-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* User Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
          <thead className="bg-emerald-700 text-white">
            <tr>
              <th className="px-4 py-2 font-semibold">ID</th>
              <th className="px-4 py-2 font-semibold">Username</th>
              <th className="px-4 py-2 font-semibold">Email</th>
              <th className="px-4 py-2 font-semibold">Role</th>
              <th className="px-4 py-2 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 py-6">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map(({ id, username, email, role }) => (
                <tr key={id} className="hover:bg-emerald-50 transition duration-150">
                  <td className="px-4 py-2">{id}</td>
                  <td className="px-4 py-2">{username}</td>
                  <td className="px-4 py-2">{email}</td>
                  <td className="px-4 py-2 capitalize">{role}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      onClick={() => setEditingUser({ id, username, email, role })}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
