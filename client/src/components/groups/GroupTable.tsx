import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Progress,
  Popconfirm,
  message,
  Input,
  Card,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import CreateGroupForm from './CreateGroupForm';
import InviteMemberForm from './InviteMemberForm'; // ✅ this was likely missing

const { Search } = Input;

interface Group {
  id: number;
  name: string;
  description: string;
  created_at: string;
  target_amount: number;
  current_amount: number;
  is_public: boolean;
  status: string;
  admin_id: number;
  meeting_schedule?: string;
  location?: string;
  logo_url?: string;
  progress: number;
}

const GroupTable: React.FC = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const endpoint = user?.role === 'admin' ? '/groups' : '/groups/my-groups';
      const { data } = await api.get(endpoint);
      const updatedGroups = data.map((group: any) => ({
        ...group,
        progress: group.target_amount
          ? (group.current_amount / group.target_amount) * 100
          : 0,
      }));
      setGroups(updatedGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
      message.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/groups/${id}`);
      message.success('Group deleted successfully');
      fetchGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      message.error('Failed to delete group');
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchText.toLowerCase()) ||
    group.description.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<Group> = [
    {
      title: 'Group Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (_: string, record: Group) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {record.logo_url && (
            <img
              src={record.logo_url}
              alt="Group Logo"
              style={{ width: 32, height: 32, borderRadius: '50%', marginRight: 8 }}
            />
          )}
          <span>{record.name}</span>
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      sorter: (a, b) => a.progress - b.progress,
      render: (_: any, record) => (
        <Progress
          percent={Math.min(100, record.progress)}
          status={record.progress >= 100 ? 'success' : 'active'}
          format={() =>
            `$${record.current_amount.toLocaleString()} / $${record.target_amount.toLocaleString()}`
          }
        />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
        { text: 'Archived', value: 'archived' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          active: 'green',
          inactive: 'orange',
          archived: 'red',
        };
        return <Tag color={colorMap[status] || 'default'}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Visibility',
      dataIndex: 'is_public',
      key: 'is_public',
      filters: [
        { text: 'Public', value: true },
        { text: 'Private', value: false },
      ],
      onFilter: (value, record) => record.is_public === value,
      render: (isPublic: boolean) => (
        <Tag color={isPublic ? 'blue' : 'purple'}>
          {isPublic ? 'PUBLIC' : 'PRIVATE'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record) => {
        const canEdit = user?.role === 'admin' || record.admin_id === user?.id;

        return (
          <Space size="middle">
            <Button
              type="link"
              icon={<EditOutlined />}
              disabled={!canEdit}
              onClick={() => {
                setCurrentGroup(record);
                setModalVisible(true);
              }}
            />
            <Popconfirm
              title="Are you sure you want to delete this group?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
              disabled={!canEdit}
            >
              <Button
                type="link"
                icon={<DeleteOutlined />}
                danger
                disabled={!canEdit}
              />
            </Popconfirm>
            <Button
              type="link"
              onClick={() => {
                setSelectedGroupId(record.id);
                setInviteModalVisible(true);
              }}
            >
              Invite
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <Card
        title="Groups"
        extra={
          <Space>
            <Search
              placeholder="Search groups"
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={(value) => setSearchText(value)}
              style={{ width: 250 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setCurrentGroup(null);
                setModalVisible(true);
              }}
            >
              New Group
            </Button>
          </Space>
        }
      >
        <Table<Group>
          pagination={{ pageSize: 10 }}
          columns={columns}
          dataSource={filteredGroups}
          rowKey="id"
          loading={loading}
        />
      </Card>

      {modalVisible && (
        <CreateGroupForm
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          groupToEdit={currentGroup}
          onSuccess={fetchGroups}
          
        />
      )}

      {inviteModalVisible && selectedGroupId && (
        <InviteMemberForm
          visible={inviteModalVisible}
          groupId={selectedGroupId}
          onClose={() => setInviteModalVisible(false)}
        />
      )}
    </>
  );
};

export default GroupTable;
