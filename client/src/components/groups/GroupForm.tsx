import { useState } from "react";
// import axios from 'axios';

type GroupPayload = {
  name: string;
  description: string;
  target_amount: number | string;
};

type Props = {
  onSuccess: () => void;       // accept onSuccess
};

const GroupForm = ({ onSuccess }: Props) => {
  const [group, setGroup] = useState<GroupPayload>({
    name: "",
    description: "",
    target_amount: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGroup((g) => ({ ...g, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...group, 
          target_amount: parseFloat(String(group.target_amount)) 
        }),
      });
      if (!res.ok) throw new Error("Failed to create");
      setGroup({ name: "", description: "", target_amount: "" });
      onSuccess();            // call onSuccess
    } catch (err: any) {
      setError(err.message || "Error creating group");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-md mb-6">
      <div className="flex flex-wrap gap-4">
        <input
          name="name"
          placeholder="Name"
          value={group.name}
          onChange={handleChange}
          className="flex-1 border p-2 rounded"
          required
        />
        <input
          name="description"
          placeholder="Description"
          value={group.description}
          onChange={handleChange}
          className="flex-1 border p-2 rounded"
          required
        />
        <input
          name="target_amount"
          type="number"
          placeholder="Target"
          value={group.target_amount}
          onChange={handleChange}
          className="w-32 border p-2 rounded"
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-emerald-700 text-white px-4 py-2 rounded"
        >
          {submitting ? "Creating..." : "Create"}
        </button>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
};

export default GroupForm;
