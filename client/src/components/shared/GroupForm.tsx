// src/components/shared/GroupForm.tsx
import { useState } from "react";

const GroupForm = ({ onCreate }: { onCreate: (data: any) => void }) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate({ name });
      setName("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-4 space-y-4">
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Group Name"
          className="input input-bordered w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary">Create Group</button>
      </div>
    </form>
  );
};

export default GroupForm;
