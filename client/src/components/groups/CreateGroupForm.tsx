import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import {
  Modal,
  Button,
  Form,
  Input,
  InputNumber,
  Switch,
  Select,
  Upload,
  message,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

interface GroupFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  groupToEdit?: any;
}

const CreateGroupForm: React.FC<GroupFormProps> = ({
  visible,
  onCancel,
  onSuccess,
  groupToEdit,
}) => {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);

  useEffect(() => {
    if (groupToEdit) {
      form.setFieldsValue({
        ...groupToEdit,
        target_amount: parseFloat(groupToEdit.target_amount),
        is_public: groupToEdit.is_public ?? true,
        status: groupToEdit.status ?? 'active',
      });

      if (groupToEdit.logo_url) {
        setFileList([
          {
            uid: '-1',
            name: 'Group Logo',
            status: 'done',
            url: groupToEdit.logo_url,
          },
        ]);
      }
    } else {
      form.resetFields();
      setFileList([]);
    }
  }, [groupToEdit, form]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      let logoUrl = groupToEdit?.logo_url;

      if (fileList.length && fileList[0]?.originFileObj) {
        const formData = new FormData();
        formData.append('file', fileList[0].originFileObj);

        const { data } = await api.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        logoUrl = data.url;
      }

      const payload = {
        ...values,
        target_amount: values.target_amount.toString(),
        is_public: values.is_public ?? true,
        admin_id: user?.id,
        logo_url: logoUrl,
      };

      if (groupToEdit) {
        await api.put(`/api/groups/${groupToEdit.id}`, payload);
        message.success('Group updated successfully');
      } else {
        await api.post('/api/groups', payload);
        message.success('Group created successfully');
      }

      form.resetFields();
      setFileList([]);
      onSuccess();
      onCancel();
    } catch (error: any) {
      console.error('Error saving group:', error);
      message.error(
        error.response?.data?.error || 'Failed to save group. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    onRemove: () => setFileList([]),
    beforeUpload: (file: any) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return false;
      }

      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Image must be smaller than 2MB!');
        return false;
      }

      setFileList([file]);
      return false;
    },
    fileList,
    maxCount: 1,
  };

  return (
    <Modal
      title={groupToEdit ? 'Edit Group' : 'Create New Group'}
      open={visible}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => form.submit()}
          loading={loading}
        >
          {groupToEdit ? 'Update' : 'Create'}
        </Button>,
      ]}
      width={700}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          is_public: true,
          status: 'active',
        }}
      >
        <Form.Item
          label="Group Name"
          name="name"
          rules={[
            { required: true, message: 'Please input the group name!' },
            { min: 3, message: 'Group name must be at least 3 characters' },
          ]}
        >
          <Input placeholder="e.g. Investment Club 2023" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please input the group description!' }]}
        >
          <TextArea rows={4} placeholder="Describe the purpose of this group" />
        </Form.Item>

        <Form.Item
          label="Target Amount"
          name="target_amount"
          rules={[
            { required: true, message: 'Please input the target amount!' },
            { type: 'number', min: 1, message: 'Amount must be positive' },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={1}
            formatter={(value) =>
              `Kshs ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            }
            parser={(value: string | undefined) =>
              Number((value || '').replace(/[^\d.]/g, ''))
            }
          />
        </Form.Item>

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            label="Meeting Schedule"
            name="meeting_schedule"
            style={{ flex: 1 }}
          >
            <Input placeholder="e.g. Every 1st Monday" />
          </Form.Item>
          <Form.Item label="Location" name="location" style={{ flex: 1 }}>
            <Input placeholder="e.g. Online or Physical address" />
          </Form.Item>
        </div>

        <Form.Item
          label="Group Logo"
          name="logo"
          valuePropName="fileList"
          getValueFromEvent={() => fileList}
        >
          <Upload {...uploadProps} listType="picture">
            <Button icon={<UploadOutlined />}>Upload Logo</Button>
          </Upload>
        </Form.Item>

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            label="Visibility"
            name="is_public"
            valuePropName="checked"
          >
            <Switch checkedChildren="Public" unCheckedChildren="Private" />
          </Form.Item>

          {groupToEdit && (
            <Form.Item label="Status" name="status" style={{ flex: 1 }}>
              <Select>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Form.Item>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default CreateGroupForm;
