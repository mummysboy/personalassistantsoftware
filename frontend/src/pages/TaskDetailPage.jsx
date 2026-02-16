import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography, Tag, Button, Space, Card, Descriptions, Select, Spin, Empty,
  Popconfirm, message, Divider, Breadcrumb,
} from 'antd';
import {
  EditOutlined, DeleteOutlined, PushpinOutlined, ArrowLeftOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTask } from '../hooks/useTasks';
import { useAuth } from '../context/AuthContext';
import { updateTask, deleteTask, togglePin } from '../services/api';
import { STATUSES, PRIORITIES, getStatusConfig, getPriorityConfig } from '../utils/constants';
import TaskForm from '../components/TaskForm';
import SubtaskChecklist from '../components/SubtaskChecklist';
import CommentThread from '../components/CommentThread';
import AttachmentList from '../components/AttachmentList';
import ActivityTimeline from '../components/ActivityTimeline';

const { Title, Text, Paragraph } = Typography;

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isBoss, user } = useAuth();
  const { task, loading, refetch } = useTask(id);
  const [editOpen, setEditOpen] = useState(false);

  if (loading) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />;
  if (!task) return <Empty description="Task not found" />;

  const statusConfig = getStatusConfig(task.status);
  const priorityConfig = task.priority ? getPriorityConfig(task.priority) : null;
  const isOverdue = task.due_date && dayjs(task.due_date).isBefore(dayjs(), 'day') && task.status !== 'done';
  const canEdit = isBoss || task.created_by === user?.id || task.assigned_to === user?.id;

  const handleStatusChange = async (newStatus) => {
    try {
      await updateTask(task.id, { status: newStatus });
      message.success('Status updated');
      refetch();
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(task.id);
      message.success('Task deleted');
      navigate('/tasks');
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to delete task');
    }
  };

  const handleTogglePin = async () => {
    await togglePin(task.id);
    refetch();
  };

  return (
    <div>
      <Breadcrumb style={{ marginBottom: 16 }} items={[
        { title: <a onClick={() => navigate('/tasks')}>Tasks</a> },
        { title: task.title },
      ]} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/tasks')} />
            <Title level={4} style={{ margin: 0 }}>{task.title}</Title>
            {task.is_pinned && <PushpinOutlined style={{ color: '#D4A06A', fontSize: 18 }} />}
          </Space>
          <Space style={{ marginTop: 8 }}>
            <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
            {priorityConfig && <Tag color={priorityConfig.color}>{priorityConfig.label}</Tag>}
            {task.category !== 'general' && <Tag>{task.category}</Tag>}
            {isOverdue && <Tag color="error">Overdue</Tag>}
          </Space>
        </div>
        <Space>
          <Button icon={<PushpinOutlined />} onClick={handleTogglePin}>
            {task.is_pinned ? 'Unpin' : 'Pin'}
          </Button>
          {canEdit && (
            <Button icon={<EditOutlined />} onClick={() => setEditOpen(true)}>Edit</Button>
          )}
          {isBoss && (
            <Popconfirm title="Delete this task?" onConfirm={handleDelete} okText="Delete" okButtonProps={{ danger: true }}>
              <Button danger icon={<DeleteOutlined />}>Delete</Button>
            </Popconfirm>
          )}
        </Space>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div>
          <Card title="Details" size="small" style={{ marginBottom: 16 }}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Status">
                <Select
                  value={task.status}
                  onChange={handleStatusChange}
                  size="small"
                  style={{ width: 180 }}
                  options={STATUSES.map((s) => ({ value: s.value, label: s.label }))}
                  disabled={false}
                />
              </Descriptions.Item>
              {priorityConfig && <Descriptions.Item label="Priority">{priorityConfig.label}</Descriptions.Item>}
              <Descriptions.Item label="Assigned To">{task.assigned_to_name || 'Unassigned'}</Descriptions.Item>
              <Descriptions.Item label="Created By">{task.created_by_name}</Descriptions.Item>
              <Descriptions.Item label="Due Date">
                {task.due_date ? (
                  <Text type={isOverdue ? 'danger' : undefined}>
                    {dayjs(task.due_date).format('MMM D, YYYY')}
                  </Text>
                ) : 'Not set'}
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {dayjs(task.created_at).format('MMM D, YYYY h:mm A')}
              </Descriptions.Item>
            </Descriptions>
            {task.description && (
              <>
                <Divider style={{ margin: '12px 0' }} />
                <Paragraph>{task.description}</Paragraph>
              </>
            )}
          </Card>

          <Card title="Subtasks" size="small" style={{ marginBottom: 16 }}>
            <SubtaskChecklist taskId={task.id} subtasks={task.subtasks} onUpdate={refetch} />
          </Card>

          <Card title="Comments" size="small" style={{ marginBottom: 16 }}>
            <CommentThread taskId={task.id} comments={task.comments} onUpdate={refetch} />
          </Card>
        </div>

        <div>
          <Card title="Attachments" size="small" style={{ marginBottom: 16 }}>
            <AttachmentList taskId={task.id} attachments={task.attachments} onUpdate={refetch} />
          </Card>

          <Card title="Activity" size="small">
            <ActivityTimeline activity={task.activity} />
          </Card>
        </div>
      </div>

      <TaskForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        task={task}
        onSuccess={refetch}
      />
    </div>
  );
}
