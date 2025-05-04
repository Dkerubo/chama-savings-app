import { useState, ChangeEvent, FormEvent } from "react";
import { User } from "../../types";
import Alert from "../shared/Alert";

interface UserFormData {
  id?: number;
  username: string;
  email: string;
  role: string;
  password: string;
  phone_number: string | null;
}

type Props = {
  user: Partial<User>;
  onSubmit: (user: Partial<User>) => void;
  onCancel: () => void;
};

const UserForm = ({ user, onSubmit, onCancel }: Props) => {
  const [form, setForm] = useState<UserFormData>({
    id: user.id ?? undefined,
    username: user.username ?? "",
    email: user.email ?? "",
    role: user.role ?? "member",
    password: "",
    phone_number: user.phone_number ?? null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [formAlert, setFormAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const validateField = (name: string, value: string | null) => {
    const newErrors = { ...errors };

    switch (name) {
      case "username":
        if (!value?.trim()) {
          newErrors.username = "Username is required";
        } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(value)) {
          newErrors.username = "Must be 3–20 characters (letters, numbers, underscores)";
        } else {
          delete newErrors.username;
        }
        break;
      case "email":
        if (!value?.trim()) {
          newErrors.email = "Email is required";
        } else if (!/^[^@]+@[^@]+\.[^@]+$/.test(value)) {
          newErrors.email = "Invalid email format";
        } else {
          delete newErrors.email;
        }
        break;
      case "password":
        if (!user.id && (value?.length ?? 0) < 8) {
          newErrors.password = "Password must be at least 8 characters";
        } else if (value && value.length < 8) {
          newErrors.password = "Password must be at least 8 characters";
        } else {
          delete newErrors.password;
        }
        break;
      case "phone_number":
        if (value && !/^\+?[\d\s-]{10,15}$/.test(value)) {
          newErrors.phone_number = "Invalid phone number format";
        } else {
          delete newErrors.phone_number;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: name === "phone_number" ? (value || null) : value 
    }));
    if (errors[name]) validateField(name, name === "phone_number" ? (value || null) : value);
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    validateField(name, name === "phone_number" ? (value || null) : value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const isValid = Object.entries(form).every(([name, value]) => {
      if (name === "id") return true;
      if (name === "password" && user.id && !value) return true;
      return validateField(name, value as string | null);
    });

    if (!isValid || Object.keys(errors).length > 0) {
      setFormAlert({ type: "error", message: "Please fix the errors in the form" });
      return;
    }

    try {
      setIsLoading(true);
      const submitData = {
        ...form,
        password: form.password || (user.id ? undefined : ""),
        phone_number: form.phone_number || undefined
      };
      await onSubmit(submitData);
    } catch (err) {
      setFormAlert({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to submit form",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md space-y-4"
        noValidate
      >
        <h2 className="text-xl font-semibold text-gray-800">
          {user.id ? "Edit User" : "Add New User"}
        </h2>

        {formAlert && (
          <Alert
            type={formAlert.type}
            message={formAlert.message}
            onClose={() => setFormAlert(null)}
          />
        )}

        <div className="grid gap-4">
          {/* Username */}
          <div className="flex flex-col">
            <label htmlFor="username" className="text-sm font-medium text-gray-700 mb-1">
              Username *
            </label>
            <input
              type="text"
              name="username"
              value={form.username || ""}
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
            <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={form.email || ""}
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

          {/* Role */}
          <div className="flex flex-col">
            <label htmlFor="role" className="text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select
              name="role"
              value={form.role || "member"}
              onChange={handleChange}
              className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Phone Number */}
          <div className="flex flex-col">
            <label htmlFor="phone_number" className="text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone_number"
              value={form.phone_number || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                errors.phone_number ? "border-red-500 focus:ring-red-500" : "focus:ring-emerald-500"
              }`}
              placeholder="e.g. +1234567890"
            />
            {errors.phone_number && <p className="text-sm text-red-600 mt-1">{errors.phone_number}</p>}
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1">
              {user.id ? "New Password" : "Password *"}
            </label>
            <input
              type="password"
              name="password"
              value={form.password || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              required={!user.id}
              className={`px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                errors.password ? "border-red-500 focus:ring-red-500" : "focus:ring-emerald-500"
              }`}
              placeholder={user.id ? "Leave blank to keep current" : "At least 8 characters"}
            />
            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 text-white rounded transition-colors ${
              isLoading ? "bg-emerald-400" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {isLoading ? "Submitting..." : user.id ? "Update User" : "Create User"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;