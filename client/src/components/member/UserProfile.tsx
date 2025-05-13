import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  phone_number?: string | null;
  role?: 'admin' | 'member';
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  profile_picture?: string;
  group?: {
    id: number;
    name: string;
    updated_at: string;
  };
  is_verified?: boolean;
}


export default function UserProfile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    phone_number: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        phone_number: user.phone_number || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await updateUser(formData);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update profile"
      );
    }
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-gray-600 text-center">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-emerald-700">My Profile</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-md transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit Profile
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                minLength={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                pattern="[0-9\\s()+\\-]*"
                title="Only numbers, spaces, parentheses, plus, and dashes allowed"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 bg-gray-100 cursor-not-allowed rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input
                type="text"
                value={user.role}
                disabled
                className="w-full px-4 py-2 border border-gray-300 bg-gray-100 cursor-not-allowed rounded-lg capitalize"
              />
            </div>
          </div>

          {user.group?.name && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
              <input
                type="text"
                value={user.group.name}
                disabled
                className="w-full px-4 py-2 border border-gray-300 bg-gray-100 cursor-not-allowed rounded-lg"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  username: user.username || "",
                  phone_number: user.phone_number || "",
                });
                setError(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow transition flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Full Name</h3>
                <p className="text-lg font-semibold text-gray-800">
                  {user.username || "N/A"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                <p className="text-lg font-semibold text-gray-800">{user.email}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Phone</h3>
                <p className="text-lg font-semibold text-gray-800">
                  {user.phone_number || "N/A"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Role</h3>
                <p className="text-lg font-semibold text-gray-800 capitalize">
                  {user.role}
                </p>
              </div>
            </div>

            {user.group?.name && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Group</h3>
                <p className="text-lg font-semibold text-gray-800">
                  {user.group.name}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
