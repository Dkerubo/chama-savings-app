// src/components/contributions/ContributionForm.tsx
import React, { useState } from 'react';

interface ContributionFormProps {
  onSubmit: (data: ContributionFormData) => void;
}

export interface ContributionFormData {
  member_id: string;
  amount: string;
  note: string;
  status: string;
  receipt_number: string;
}

const ContributionForm: React.FC<ContributionFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<ContributionFormData>({
    member_id: '',
    amount: '',
    note: '',
    status: 'pending',
    receipt_number: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ member_id: '', amount: '', note: '', status: 'pending', receipt_number: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4 mb-4">
      <input type="number" name="member_id" placeholder="Member ID" value={formData.member_id} onChange={handleChange} className="input input-bordered w-40" required />
      <input type="number" name="amount" placeholder="Amount" value={formData.amount} onChange={handleChange} className="input input-bordered w-32" required />
      <input type="text" name="note" placeholder="Note" value={formData.note} onChange={handleChange} className="input input-bordered w-48" />
      <select name="status" value={formData.status} onChange={handleChange} className="select select-bordered w-36">
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="rejected">Rejected</option>
      </select>
      <input type="text" name="receipt_number" placeholder="Receipt #" value={formData.receipt_number} onChange={handleChange} className="input input-bordered w-40" />
      <button type="submit" className="btn bg-emerald-700 text-white">Add</button>
    </form>
  );
};

export default ContributionForm;
