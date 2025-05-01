import { useState } from "react";

interface InviteMemberFormProps {
  groupId: string;
}

const InviteMemberForm = ({ groupId }: InviteMemberFormProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    const res = await fetch(`/api/groups/${groupId}/invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setSuccessMessage("Invitation sent successfully!");
    } else {
      setErrorMessage("Failed to send invitation.");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Member's Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      {successMessage && (
        <p className="text-green-500 text-sm">{successMessage}</p>
      )}
      {errorMessage && (
        <p className="text-red-500 text-sm">{errorMessage}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {loading ? "Sending..." : "Invite Member"}
      </button>
    </form>
  );
};

export default InviteMemberForm;
