import { useState } from "react";

type Group = {
  id: number;
  name: string;
  target_amount: number;
  progress?: number;
  status?: string;
  admin_name?: string;
};

type Props = {
  groups: Group[];
  onDelete: (id: number) => void;
  onEdit: (group: Group) => void;
};

const GroupTable: React.FC<Props> = ({ groups, onDelete, onEdit }) => {
  const [filter, setFilter] = useState<string>("");

  // Filter the groups based on the filter string
  const filteredGroups = groups.filter((group) => {
    return (
      group.name.toLowerCase().includes(filter.toLowerCase()) ||
      (group.status?.toLowerCase().includes(filter.toLowerCase()) ?? false)
    );
  });

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Groups</h3>
      
      {/* Filter input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or status"
          className="p-2 border border-gray-300 rounded-md w-full"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <table className="w-full table-auto border border-gray-200 text-sm">
        <thead className="bg-emerald-700 text-white">
          <tr>
            <th className="p-2 border">#</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Target</th>
            <th className="p-2 border">Progress</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Created By</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredGroups.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center p-4 text-gray-500">
                No groups found.
              </td>
            </tr>
          ) : (
            filteredGroups.map((group, index) => (
              <tr key={group.id} className="hover:bg-gray-50">
                <td className="p-2 border text-center">{index + 1}</td>
                <td className="p-2 border">{group.name}</td>
                <td className="p-2 border">${group.target_amount.toFixed(2)}</td>
                <td className="p-2 border">{group.progress?.toFixed(1)}%</td>
                <td className="p-2 border capitalize">{group.status}</td>
                <td className="p-2 border">{group.admin_name || "—"}</td>
                <td className="p-2 border space-x-2 text-center">
                  <button className="text-emerald-700 hover:underline">View</button>
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => onEdit(group)} // Call the onEdit function when Edit button is clicked
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => onDelete(group.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default GroupTable;
