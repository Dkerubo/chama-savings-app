import { Link, useLocation } from "react-router-dom";

type Props = {
  role: "admin" | "member";
};

const Sidebar = ({ role }: Props) => {
  const location = useLocation();

  const adminLinks = [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Users", path: "/admin/users" },
    { label: "Groups", path: "/admin/groups" },
    { label: "Loans", path: "/admin/loans" },
    { label: "Investments", path: "/admin/investments" },
    { label: "Meetings", path: "/admin/meetings" },
  ];

  const memberLinks = [
    { label: "Dashboard", path: "/member/dashboard" },
    { label: "Create Group", path: "/member/create-group" },
    { label: "My Groups", path: "/member/groups" },
    { label: "Contributions", path: "/member/contributions" },
    { label: "Invitations", path: "/member/invitations" },
  ];

  const links = role === "admin" ? adminLinks : memberLinks;

  return (
    <aside className="w-64 bg-white shadow-md h-screen p-4 sticky top-0">
      <h2 className="text-xl font-bold mb-4">{role === "admin" ? "Admin" : "Member"} Panel</h2>
      <ul className="space-y-2">
        {links.map(({ label, path }) => (
          <li key={path}>
            <Link
              to={path}
              className={`block px-4 py-2 rounded hover:bg-blue-100 ${
                location.pathname === path ? "bg-blue-200 font-semibold" : ""
              }`}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
