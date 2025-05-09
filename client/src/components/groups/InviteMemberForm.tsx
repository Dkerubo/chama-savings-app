import React, { useState } from 'react';
import api from '../../api/api';
import { Modal, Form, Input, Button, message, Select, Typography } from 'antd';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

interface InviteMemberFormProps {
  visible: boolean;
  onClose: () => void;
  groupId: number | null;
}

const InviteMemberForm: React.FC<InviteMemberFormProps> = ({ visible, onClose, groupId }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    if (!groupId) return;
    
    try {
      setLoading(true);
      await api.post('/invitations', {
        group_id: groupId,
        email: values.email,
        message: values.message,
        role: values.role
      });
      message.success('Invitation sent successfully');
      form.resetFields();
      onClose();
    } catch (error) {
      console.error('Error sending invitation:', error);
      message.error('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Invite Members to Group"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
          Send Invitation
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ role: 'member' }}
      >
        <Form.Item
          label="Email Address"
          name="email"
          rules={[
            { required: true, message: 'Please input the email address!' },
            { type: 'email', message: 'Please enter a valid email address!' }
          ]}
        >
          <Input placeholder="user@example.com" />
        </Form.Item>

        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: 'Please select a role!' }]}
        >
          <Select>
            <Option value="member">Member</Option>
            <Option value="admin">Admin</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Custom Message (Optional)"
          name="message"
        >
          <TextArea rows={4} placeholder="Add a personal message to include with the invitation" />
        </Form.Item>

        <Text type="secondary">
          An email will be sent with a registration link if the user doesn't have an account yet.
        </Text>
      </Form>
    </Modal>
  );
};

export default InviteMemberForm;
