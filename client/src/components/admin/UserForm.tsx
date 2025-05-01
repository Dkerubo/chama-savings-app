// src/components/admin/UserForm.tsx
import { useState } from "react";

const UserForm = ({ onAdd }: { onAdd: (user: any) => void }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "member",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({ username: "", email: "", role: "member" });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-4 space-y-4">
      <div className="flex gap-4">
        <input
          type="text"
          name="username"
          placeholder="Username"
          className="input input-bordered w-full"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="input input-bordered w-full"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <select name="role" value={formData.role} onChange={handleChange} className="input input-bordered">
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" className="btn btn-primary">Add User</button>
      </div>
    </form>
  );
};

export default UserForm;
