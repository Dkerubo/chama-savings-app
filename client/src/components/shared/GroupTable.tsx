// src/components/shared/GroupTable.tsx
const GroupTable = ({
    groups,
    onDelete,
  }: {
    groups: any[];
    onDelete: (id: number) => void;
  }) => (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-2">Groups</h3>
      <table className="table-auto w-full border text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Created By</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {groups.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center p-4">No groups found.</td>
            </tr>
          ) : (
            groups.map((group) => (
              <tr key={group.id}>
                <td className="p-2 border">{group.id}</td>
                <td className="p-2 border">{group.name}</td>
                <td className="p-2 border">{group.created_by}</td>
                <td className="p-2 border">
                  <button onClick={() => onDelete(group.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
  
  export default GroupTable;
  