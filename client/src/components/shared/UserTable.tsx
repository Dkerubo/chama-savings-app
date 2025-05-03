import { User } from "../../types";

type Props = {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
};

const UserTable = ({ users, onEdit, onDelete }: Props) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border rounded shadow-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3">Username</th>
            <th className="p-3">Email</th>
            <th className="p-3">Role</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-3">{u.username}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3">{u.role}</td>
              <td className="p-3 space-x-2">
                <button
                  onClick={() => onEdit(u)}
                  className="px-3 py-1 text-sm bg-yellow-500 text-white rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(u)}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
