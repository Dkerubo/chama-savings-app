import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type GroupFormProps = {
  onCreate?: (data: any) => void;
};

const GroupForm = ({ onCreate }: GroupFormProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    target_amount: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (onCreate) {
      // For optional callback usage
      onCreate({
        ...formData,
        target_amount: parseFloat(formData.target_amount),
      });
      setFormData({ name: "", description: "", target_amount: "" });
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        target_amount: parseFloat(formData.target_amount),
      };

      await axios.post("/api/groups", payload);
      navigate("/member/my-groups");
    } catch (err: any) {
      console.error("Error creating group:", err);
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white shadow-md rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4">Create a New Group</h2>
      {error && <div className="text-red-500 mb-3">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Group Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-700 focus:border-emerald-700"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-700 focus:border-emerald-700"
          />
        </div>

        <div>
          <label htmlFor="target_amount" className="block text-sm font-medium text-gray-700">
            Target Amount
          </label>
          <input
            type="number"
            id="target_amount"
            name="target_amount"
            required
            min="0"
            step="0.01"
            value={formData.target_amount}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-700 focus:border-emerald-700"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2 px-4 bg-emerald-700 text-white rounded-md hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
        >
          {submitting ? "Creating..." : "Create Group"}
        </button>
      </form>
    </div>
  );
};

export default GroupForm;
