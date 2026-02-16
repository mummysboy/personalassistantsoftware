import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, message } from 'antd';
import dayjs from 'dayjs';
import { createTask, updateTask } from '../services/api';
import { STATUSES, PRIORITIES, CATEGORIES } from '../utils/constants';

export default function TaskForm({ open, onClose, task, onSuccess, defaultDate }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const isEdit = !!task;

  useEffect(() => {
    if (open) {
      if (task) {
        form.setFieldsValue({
          ...task,
          due_date: task.due_date ? dayjs(task.due_date) : null,
        });
      } else {
        form.resetFields();
        if (defaultDate) {
          form.setFieldsValue({ due_date: defaultDate });
        }
      }
    }
  }, [open, task, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const data = {
        ...values,
        due_date: values.due_date ? values.due_date.toISOString() : null,
      };

      if (isEdit) {
        await updateTask(task.id, data);
        message.success('Task updated');
      } else {
        await createTask(data);
        message.success('Task created');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      if (err.response) message.error(err.response.data.error || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEdit ? 'Edit Task' : 'New Task'}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
      width={window.innerWidth < 768 ? '95%' : 600}
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ status: 'todo', assigned_to: 2 }}>
        <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Title is required' }]}>
          <Input placeholder="Task title" />
        </Form.Item>
        <Form.Item name="description" label="Description (optional)">
          <Input.TextArea rows={3} placeholder="Task description" />
        </Form.Item>
        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 480 ? '1fr' : '1fr 1fr', gap: 16 }}>
          <Form.Item name="priority" label="Priority (optional)">
            <Select allowClear placeholder="Select priority" options={PRIORITIES.map((p) => ({ value: p.value, label: p.label }))} />
          </Form.Item>
          <Form.Item name="category" label="Category (optional)">
            <Select allowClear placeholder="Select category" options={CATEGORIES.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))} />
          </Form.Item>
          <Form.Item name="due_date" label="Due Date (optional)">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="assigned_to" label="Assign To">
            <Select
              allowClear
              placeholder="Select assignee"
              options={[
                { value: 1, label: 'Jeffery Flippo' },
                { value: 2, label: 'Isaac Hirsch' },
              ]}
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
