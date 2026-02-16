import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Typography, Button, Space, Spin, Empty, Segmented } from 'antd';
import { PlusOutlined, AppstoreOutlined, BarsOutlined } from '@ant-design/icons';
import { useTasks } from '../hooks/useTasks';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import FilterBar from '../components/FilterBar';
import { STATUSES } from '../utils/constants';

const { Title } = Typography;

function getInitialFilters(searchParams) {
  const initial = { sort: 'updated_at' };
  const status = searchParams.get('status');
  const due_end = searchParams.get('due_end');
  const due_start = searchParams.get('due_start');
  if (status) initial.status = status;
  if (due_end) initial.due_end = due_end;
  if (due_start) initial.due_start = due_start;
  return initial;
}

export default function TasksPage() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => getInitialFilters(searchParams));
  const [formOpen, setFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const { tasks, loading, refetch } = useTasks(filters);

  const handleClearFilters = () => setFilters({ sort: 'updated_at' });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <Title level={4} style={{ margin: 0 }}>Tasks</Title>
        <Space wrap>
          <Segmented
            options={[
              { value: 'list', icon: <BarsOutlined /> },
              { value: 'board', icon: <AppstoreOutlined /> },
            ]}
            value={viewMode}
            onChange={setViewMode}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>
            New Task
          </Button>
        </Space>
      </div>

      <FilterBar filters={filters} onChange={setFilters} onClear={handleClearFilters} />

      {loading ? (
        <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />
      ) : tasks.length === 0 ? (
        <Empty description="No tasks found" />
      ) : viewMode === 'list' ? (
        <div>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {STATUSES.map((status) => (
            <div key={status.value}>
              <Title level={5} style={{ textAlign: 'center', padding: '8px', background: '#F5F0EB', borderRadius: 10, color: '#6B5E50' }}>
                {status.label} ({tasks.filter((t) => t.status === status.value).length})
              </Title>
              {tasks
                .filter((t) => t.status === status.value)
                .map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
            </div>
          ))}
        </div>
      )}

      <TaskForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
}
