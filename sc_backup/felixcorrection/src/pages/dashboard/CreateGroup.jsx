import { useState } from 'react';
import { UserGroupIcon } from '@heroicons/react/outline';

const CreateGroup = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contributionAmount: '',
    meetingSchedule: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Group created:', formData);
    // Redirect to group page or show success message
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center">
            <UserGroupIcon className="h-10 w-10 text-blue-600" />
            <h1 className="ml-3 text-2xl font-bold text-gray-900">Create New Group</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Fill in the details below to create a new savings group.
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Group Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="contributionAmount" className="block text-sm font-medium text-gray-700">
                  Contribution Amount (KES)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="contributionAmount"
                    id="contributionAmount"
                    value={formData.contributionAmount}
                    onChange={handleChange}
                    required
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="meetingSchedule" className="block text-sm font-medium text-gray-700">
                  Meeting Schedule
                </label>
                <div className="mt-1">
                  <select
                    id="meetingSchedule"
                    name="meetingSchedule"
                    value={formData.meetingSchedule}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  >
                    <option value="">Select schedule</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Group
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;