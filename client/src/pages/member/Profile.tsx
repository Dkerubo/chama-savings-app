import { useAuth } from "../../context/AuthContext";
import UserProfile from "../../components/member/UserProfile";

export default function Profile() {
  const { user } = useAuth();

  if (!user) return <div className="p-4">Loading...</div>;

  return <UserProfile />;
}
