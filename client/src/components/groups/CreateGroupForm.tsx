import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CreateGroupPayload } from '../../types/group';

interface CreateGroupFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateGroupPayload) => Promise<void>;
  isSubmitting: boolean;
}

const initialFormState = (user_id: number): CreateGroupPayload => ({
  name: '',
  description: '',
  target_amount: 0,
  meeting_schedule: '',
  location: '',
  logo_url: '',
  is_public: false,
  user_id,
});

const CreateGroupForm = ({ isOpen, onClose, onSubmit, isSubmitting }: CreateGroupFormProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<CreateGroupPayload>(() =>
    initialFormState(user?.id || 0)
  );

  useEffect(() => {
    if (user?.id && isOpen) {
      setFormData(initialFormState(user.id));
    }
  }, [user, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, type, value } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-emerald-700">Create New Group</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            disabled={isSubmitting}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {[
            { id: 'name', label: 'Group Name*', required: true, type: 'text' },
            { id: 'description', label: 'Description', type: 'textarea' },
            { id: 'target_amount', label: 'Target Amount*', required: true, type: 'number' },
            { id: 'meeting_schedule', label: 'Meeting Schedule', type: 'text' },
            { id: 'location', label: 'Location', type: 'text' },
            { id: 'logo_url', label: 'Logo URL', type: 'url' },
          ].map(({ id, label, type = 'text', required }) => (
            <div className="mb-4" key={id}>
              <label htmlFor={id} className="block text-gray-700 mb-2">
                {label}
              </label>
              {type === 'textarea' ? (
                <textarea
                  id={id}
                  name={id}
                  value={(formData as any)[id]}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  disabled={isSubmitting}
                />
              ) : (
                <input
                  id={id}
                  name={id}
                  value={(formData as any)[id]}
                  onChange={handleChange}
                  type={type}
                  required={required}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  disabled={isSubmitting}
                />
              )}
            </div>
          ))}

          {/* Is Public */}
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_public"
                checked={formData.is_public}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-emerald-600"
                disabled={isSubmitting}
              />
              <span className="ml-2 text-gray-700">Public Group</span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupForm;
