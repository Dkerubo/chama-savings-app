// src/pages/admin/Users.tsx
import { useEffect, useState } from "react";
import UserForm from "../../components/admin/UserForm";
import UserTable from "../../components/admin/UserTable";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
  };

  const addUser = async (newUser: any) => {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });
    if (res.ok) fetchUsers();
  };

  const deleteUser = async (id: number) => {
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Users</h2>
      <UserForm onAdd={addUser} />
      <UserTable users={users} onDelete={deleteUser} />
    </div>
  );
};

export default AdminUsers;
