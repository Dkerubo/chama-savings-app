import { useEffect, useState } from "react";
import { User } from "../../types";
import { getCurrentUser, deleteUser } from "../../api/userApi";
import Alert from "../../components/shared/Alert";
import ConfirmDialog from "../../components/shared/ConfirmDialog";

const MemberProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchProfile = async () => {
    try {
      const profile = await getCurrentUser();
      setUser(profile);
    } catch {
      setAlert({ type: "error", message: "Failed to load profile." });
    }
  };

  const handleDelete = async () => {
    try {
      if (user) {
        await deleteUser(user.id);
        setAlert({ type: "success", message: "Profile deleted." });
        // Redirect or logout logic can be added here
      }
    } catch {
      setAlert({ type: "error", message: "Failed to delete profile." });
    } finally {
      setShowConfirm(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (!user) return null;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">My Profile</h1>
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      <div className="bg-white rounded shadow p-4">
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <button
          onClick={() => setShowConfirm(true)}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
        >
          Delete My Account
        </button>
      </div>

      {showConfirm && (
        <ConfirmDialog
          message="Are you sure you want to delete your profile?"
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
};

export default MemberProfilePage;
