import { useEffect, useState } from "react";

const AdminMeetings = () => {
  const [meetings, setMeetings] = useState([]);

  const fetchMeetings = async () => {
    try {
      const res = await fetch("/api/admin/meetings");
      const data = await res.json();
      setMeetings(data);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Meetings</h1>

      <div className="bg-white rounded-lg shadow p-4">
        {meetings.length > 0 ? (
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Group</th>
                <th className="border px-4 py-2">Topic</th>
                <th className="border px-4 py-2">Date</th>
                <th className="border px-4 py-2">Time</th>
                <th className="border px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map((meeting: any) => (
                <tr key={meeting.id}>
                  <td className="border px-4 py-2">{meeting.id}</td>
                  <td className="border px-4 py-2">{meeting.groupName}</td>
                  <td className="border px-4 py-2">{meeting.topic}</td>
                  <td className="border px-4 py-2">{meeting.date}</td>
                  <td className="border px-4 py-2">{meeting.time}</td>
                  <td className="border px-4 py-2">{meeting.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No meetings found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminMeetings;
