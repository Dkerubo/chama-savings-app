import { useAuth } from "../../context/AuthContext";

export default function UserProfile() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-gray-600 text-center">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-emerald-700 mb-6">My Profile</h2>

      <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
        <div>
          <h3 className="text-sm text-gray-500">Full Name</h3>
          <p className="text-lg text-gray-800">{user.username || "N/A"}</p>
        </div>

        <div>
          <h3 className="text-sm text-gray-500">Email</h3>
          <p className="text-lg text-gray-800">{user.email}</p>
        </div>

        <div>
          <h3 className="text-sm text-gray-500">Phone</h3>
          <p className="text-lg text-gray-800">{user.phone_number || "N/A"}</p>
        </div>

        <div>
          <h3 className="text-sm text-gray-500">Role</h3>
          <p className="text-lg text-gray-800 capitalize">{user.role}</p>
        </div>

        {user.group && (
          <div>
            <h3 className="text-sm text-gray-500">Group</h3>
            <p className="text-lg text-gray-800">{user.group.name}</p>
          </div>
        )}

        <div className="mt-6">
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded shadow text-sm">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
