import { useState } from 'react';
import { MailIcon, UserAddIcon } from '@heroicons/react/outline';

const InviteMembers = () => {
  const [emails, setEmails] = useState(['']);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailChange = (index, value) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const addEmailField = () => {
    setEmails([...emails, '']);
  };

  const removeEmailField = (index) => {
    if (emails.length > 1) {
      const newEmails = emails.filter((_, i) => i !== index);
      setEmails(newEmails);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Filter out empty emails
    const validEmails = emails.filter(email => email.trim() !== '');
    
    // Simulate API call
    setTimeout(() => {
      console.log('Invitations sent to:', validEmails);
      console.log('Message:', message);
      setIsSubmitting(false);
      // Show success message or redirect
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center">
            <UserAddIcon className="h-10 w-10 text-blue-600" />
            <h1 className="ml-3 text-2xl font-bold text-gray-900">Invite Members</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Send invitations to join your savings group.
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Email Addresses</h3>
              <p className="mt-1 text-sm text-gray-500">
                Enter the email addresses of people you want to invite.
              </p>
            </div>

            <div className="space-y-4">
              {emails.map((email, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex-shrink-0">
                    <MailIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3 flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      placeholder="member@example.com"
                    />
                  </div>
                  {emails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmailField(index)}
                      className="ml-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addEmailField}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Another Email
            </button>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Custom Message (Optional)
              </label>
              <div className="mt-1">
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder="Join our savings group to start growing your money together..."
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send Invitations'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InviteMembers;