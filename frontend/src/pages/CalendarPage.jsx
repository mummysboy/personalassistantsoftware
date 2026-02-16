import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Card, Calendar, Badge, Spin, Tag, List, Empty, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getCalendarTasks } from '../services/api';
import { getStatusConfig, getPriorityConfig } from '../utils/constants';
import TaskForm from '../components/TaskForm';

const { Title, Text } = Typography;

export default function CalendarPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const navigate = useNavigate();

  const fetchTasks = () => {
    const start = currentDate.startOf('month').subtract(7, 'day').toISOString();
    const end = currentDate.endOf('month').add(7, 'day').toISOString();
    setLoading(true);
    getCalendarTasks({ start, end })
      .then((res) => setTasks(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTasks();
  }, [currentDate.format('YYYY-MM')]);

  const getTasksForDate = (date) => {
    return tasks.filter((t) => dayjs(t.due_date).format('YYYY-MM-DD') === date.format('YYYY-MM-DD'));
  };

  const dateCellRender = (date) => {
    const dayTasks = getTasksForDate(date);
    if (dayTasks.length === 0) return null;

    return (
      <div>
        {dayTasks.slice(0, 3).map((task) => {
          const priority = getPriorityConfig(task.priority);
          return (
            <div
              key={task.id}
              style={{ fontSize: 11, marginBottom: 2, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              onClick={(e) => { e.stopPropagation(); navigate(`/tasks/${task.id}`); }}
            >
              <Badge color={priority.color} text={<span style={{ fontSize: 11 }}>{task.title}</span>} />
            </div>
          );
        })}
        {dayTasks.length > 3 && (
          <Text type="secondary" style={{ fontSize: 10 }}>+{dayTasks.length - 3} more</Text>
        )}
      </div>
    );
  };

  const selectedTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>Calendar</Title>

      {loading && <Spin />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <Card size="small">
          <Calendar
            cellRender={dateCellRender}
            onPanelChange={(date) => setCurrentDate(date)}
            onSelect={(date) => setSelectedDate(date)}
          />
        </Card>

        <Card
          title={selectedDate ? selectedDate.format('MMM D, YYYY') : 'Select a date'}
          size="small"
          extra={selectedDate && (
            <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>
              Add Task
            </Button>
          )}
        >
          {!selectedDate ? (
            <Text type="secondary">Click a date to see tasks</Text>
          ) : selectedTasks.length === 0 ? (
            <Empty description="No tasks on this date" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <List
              size="small"
              dataSource={selectedTasks}
              renderItem={(task) => {
                const status = getStatusConfig(task.status);
                const priority = getPriorityConfig(task.priority);
                return (
                  <List.Item
                    style={{ cursor: 'pointer', padding: '8px 0' }}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                  >
                    <List.Item.Meta
                      title={<Text style={{ fontSize: 13 }}>{task.title}</Text>}
                      description={
                        <span>
                          <Tag color={status.color} style={{ fontSize: 11 }}>{status.label}</Tag>
                          <Tag color={priority.color} style={{ fontSize: 11 }}>{priority.label}</Tag>
                        </span>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          )}
        </Card>
      </div>

      <TaskForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={fetchTasks}
        defaultDate={selectedDate}
      />
    </div>
  );
}
