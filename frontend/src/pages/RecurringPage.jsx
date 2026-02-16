import { useState, useEffect } from 'react';
import {
  Typography, Card, Table, Button, Modal, Form, Input, Select, DatePicker,
  Switch, Space, Popconfirm, Tag, message, Spin,
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getRecurringTasks, createRecurringTask, updateRecurringTask, deleteRecurringTask } from '../services/api';
import { PRIORITIES, CATEGORIES, FREQUENCIES } from '../utils/constants';

const { Title } = Typography;

export default function RecurringPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await getRecurringTasks();
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const openModal = (task = null) => {
    setEditingTask(task);
    if (task) {
      form.setFieldsValue({
        ...task,
        next_run: dayjs(task.next_run),
      });
    } else {
      form.resetFields();
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const data = { ...values, next_run: values.next_run.toISOString() };

      if (editingTask) {
        await updateRecurringTask(editingTask.id, data);
        message.success('Updated');
      } else {
        await createRecurringTask(data);
        message.success('Created');
      }
      setModalOpen(false);
      fetchTasks();
    } catch (err) {
      if (err.response) message.error(err.response.data.error || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteRecurringTask(id);
    message.success('Deleted');
    fetchTasks();
  };

  const handleToggleActive = async (task) => {
    await updateRecurringTask(task.id, { is_active: !task.is_active });
    fetchTasks();
  };

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    {
      title: 'Frequency',
      dataIndex: 'frequency',
      key: 'frequency',
      render: (f) => <Tag>{f}</Tag>,
    },
    { title: 'Priority', dataIndex: 'priority', key: 'priority', render: (p) => <Tag>{p}</Tag> },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Assigned To', dataIndex: 'assigned_to_name', key: 'assigned_to_name' },
    {
      title: 'Next Run',
      dataIndex: 'next_run',
      key: 'next_run',
      render: (d) => dayjs(d).format('MMM D, YYYY'),
    },
    {
      title: 'Active',
      key: 'is_active',
      render: (_, record) => (
        <Switch checked={record.is_active} onChange={() => handleToggleActive(record)} />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Popconfirm title="Delete?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Recurring Tasks</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>New Recurring Task</Button>
      </div>

      <Card>
        <Table
          dataSource={tasks}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="small"
        />
      </Card>

      <Modal
        title={editingTask ? 'Edit Recurring Task' : 'New Recurring Task'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        confirmLoading={saving}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ category: 'general', frequency: 'weekly' }}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="frequency" label="Frequency" rules={[{ required: true }]}>
              <Select options={FREQUENCIES} />
            </Form.Item>
            <Form.Item name="next_run" label="Next Run" rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="priority" label="Priority">
              <Select options={PRIORITIES.map((p) => ({ value: p.value, label: p.label }))} />
            </Form.Item>
            <Form.Item name="category" label="Category">
              <Select options={CATEGORIES.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))} />
            </Form.Item>
            <Form.Item name="assigned_to" label="Assign To">
              <Select
                allowClear
                options={[
                  { value: 1, label: 'Jeffery Flippo (Boss)' },
                  { value: 2, label: 'Alex Rivera (Assistant)' },
                ]}
              />
            </Form.Item>
            <Form.Item name="day_of_week" label="Day of Week (for weekly)">
              <Select
                allowClear
                options={[
                  { value: 0, label: 'Sunday' },
                  { value: 1, label: 'Monday' },
                  { value: 2, label: 'Tuesday' },
                  { value: 3, label: 'Wednesday' },
                  { value: 4, label: 'Thursday' },
                  { value: 5, label: 'Friday' },
                  { value: 6, label: 'Saturday' },
                ]}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
