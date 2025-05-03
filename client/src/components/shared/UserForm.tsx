// src/components/UserForm.tsx

import React, { useState, ChangeEvent, FormEvent } from "react";
import { User } from "../../types";

type Props = {
  user: Partial<User>;
  onSubmit: (user: Partial<User>) => void;
  onCancel: () => void;
};

const UserForm = ({ user, onSubmit, onCancel }: Props) => {
  const [form, setForm] = useState<Partial<User>>({
    username: user.username || "",
    email: user.email || "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    switch (name) {
      case "username":
        if (!value.match(/^[a-zA-Z0-9_]{3,20}$/)) {
          newErrors.username = "Username must be 3–20 characters (letters, numbers, underscores)";
        } else {
          delete newErrors.username;
        }
        break;
      case "email":
        if (!value.match(/^[^@]+@[^@]+\.[^@]+$/)) {
          newErrors.email = "Invalid email format";
        } else {
          delete newErrors.email;
        }
        break;
      case "password":
        if (!user.id && value.length < 8) {
          newErrors.password = "Password must be at least 8 characters";
        } else {
          delete newErrors.password;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const isValid = Object.entries(form).every(([name, value]) => {
      return validateField(name, value as string);
    });

    if (!isValid || Object.keys(errors).length > 0) return;

    setIsLoading(true);
    onSubmit(form);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg space-y-4"
        noValidate
      >
        <h2 className="text-xl font-semibold text-gray-800">
          {user.id ? "Edit User" : "Add User"}
        </h2>

        {/* Username */}
        <div className="flex flex-col">
          <label htmlFor="username" className="text-sm font-medium mb-1">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className={`px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
              errors.username ? "border-red-500 focus:ring-red-500" : "focus:ring-emerald-500"
            }`}
            placeholder="e.g. john_doe"
          />
          {errors.username && <p className="text-sm text-red-600 mt-1">{errors.username}</p>}
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label htmlFor="email" className="text-sm font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className={`px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
              errors.email ? "border-red-500 focus:ring-red-500" : "focus:ring-emerald-500"
            }`}
            placeholder="e.g. user@example.com"
          />
          {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
        </div>

        {/* Password */}
        {!user.id && (
          <div className="flex flex-col">
            <label htmlFor="password" className="text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={`px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                errors.password ? "border-red-500 focus:ring-red-500" : "focus:ring-emerald-500"
              }`}
              placeholder="At least 8 characters"
            />
            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:bg-emerald-400"
          >
            {isLoading ? "Saving..." : user.id ? "Update User" : "Add User"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;