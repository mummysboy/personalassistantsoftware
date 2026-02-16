import { Card, Tag, Typography, Space, Avatar, Tooltip } from 'antd';
import {
  PushpinOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { getStatusConfig, getPriorityConfig } from '../utils/constants';

const { Text, Paragraph } = Typography;

export default function TaskCard({ task, onPin }) {
  const navigate = useNavigate();
  const statusConfig = getStatusConfig(task.status);
  const priorityConfig = task.priority ? getPriorityConfig(task.priority) : null;
  const isOverdue = task.due_date && dayjs(task.due_date).isBefore(dayjs(), 'day') && task.status !== 'done';

  return (
    <Card
      size="small"
      className={`task-card ${task.is_pinned ? 'pinned-task' : ''}`}
      onClick={() => navigate(`/tasks/${task.id}`)}
      style={{ marginBottom: 8 }}
      extra={
        <Space onClick={(e) => e.stopPropagation()}>
          {task.is_pinned && <PushpinOutlined style={{ color: '#D4A06A' }} />}
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size={4}>
        <Space>
          <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
          {priorityConfig && <Tag color={priorityConfig.color}>{priorityConfig.label}</Tag>}
          {task.category !== 'general' && <Tag>{task.category}</Tag>}
        </Space>
        <Text strong>{task.title}</Text>
        <Space size={16}>
          {task.due_date && (
            <Tooltip title={dayjs(task.due_date).format('MMM D, YYYY')}>
              <Text type={isOverdue ? 'danger' : 'secondary'} style={{ fontSize: 12 }}>
                <ClockCircleOutlined /> {dayjs(task.due_date).format('MMM D')}
                {isOverdue && ' (overdue)'}
              </Text>
            </Tooltip>
          )}
          {task.assigned_to_name && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              <UserOutlined /> {task.assigned_to_name}
            </Text>
          )}
          {task.subtask_count > 0 && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              <CheckCircleOutlined /> {task.subtask_done_count}/{task.subtask_count}
            </Text>
          )}
        </Space>
      </Space>
    </Card>
  );
}
