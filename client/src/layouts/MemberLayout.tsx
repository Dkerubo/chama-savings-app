import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const MemberLayout = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar role="member" />
      <div className="flex-1 bg-gray-100 p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default MemberLayout;
