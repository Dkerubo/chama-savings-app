import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, ProgressBar, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface Group {
  id: number;
  name: string;
  status: string;
  current_amount: number;
  target_amount: number;
}

const MyGroups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get('/api/groups/my');
        setGroups(response.data);
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  if (loading) return <div className="text-center mt-4">Loading groups...</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">My Groups</h2>
      <div className="row">
        {groups.map((group) => {
          const progress = (group.current_amount / group.target_amount) * 100;

          return (
            <div className="col-md-4 mb-3" key={group.id}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <Card.Title>{group.name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">{group.status}</Card.Subtitle>
                  <div className="my-2">
                    <ProgressBar now={progress} label={`${Math.round(progress)}%`} />
                  </div>
                  <div className="mt-3 d-flex justify-content-between">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/groups/${group.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyGroups;
