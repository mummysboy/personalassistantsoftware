import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Statistic, Typography, List, Tag, Spin, Space, Empty, Button, Skeleton } from 'antd';
import {
  PlusOutlined,
  HeartOutlined,
  LinkOutlined,
  BookOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { getDashboardStats, getInspiration } from '../services/api';
import TaskForm from '../components/TaskForm';

dayjs.extend(relativeTime);
const { Title, Text, Paragraph } = Typography;

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [inspiration, setInspiration] = useState(null);
  const [inspirationLoading, setInspirationLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getInspiration()
      .then((res) => setInspiration(res.data))
      .catch(console.error)
      .finally(() => setInspirationLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />;

  if (!stats) return <Empty description="Could not load dashboard" />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Teamwork makes the dream work!</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>
          New Task
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} md={4}>
          <Card hoverable onClick={() => navigate('/tasks?status=todo')} style={{ cursor: 'pointer' }}>
            <Statistic title="To Do" value={stats.statusCounts.todo} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card hoverable onClick={() => navigate('/tasks?status=in_progress')} style={{ cursor: 'pointer' }}>
            <Statistic title="In Progress" value={stats.statusCounts.in_progress} valueStyle={{ color: '#8B7355' }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card hoverable onClick={() => navigate('/tasks?status=waiting')} style={{ cursor: 'pointer' }}>
            <Statistic title="Waiting" value={stats.statusCounts.waiting} valueStyle={{ color: '#D4A06A' }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card hoverable onClick={() => navigate('/tasks?status=awaiting_approval')} style={{ cursor: 'pointer' }}>
            <Statistic title="Approval" value={stats.statusCounts.awaiting_approval} valueStyle={{ color: '#C4916B' }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card hoverable onClick={() => navigate('/tasks?status=done')} style={{ cursor: 'pointer' }}>
            <Statistic title="Done" value={stats.statusCounts.done} valueStyle={{ color: '#7A9B6D' }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card hoverable onClick={() => navigate(`/tasks?due_end=${dayjs().subtract(1, 'day').format('YYYY-MM-DD')}`)} style={{ cursor: 'pointer' }}>
            <Statistic title="Overdue" value={stats.overdue} valueStyle={{ color: '#C46B5A' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col xs={24} md={14}>
          <Card title="Recent Activity" size="small">
            {stats.recentActivity.length === 0 ? (
              <Empty description="No recent activity" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <List
                size="small"
                dataSource={stats.recentActivity}
                renderItem={(item) => (
                  <List.Item
                    style={{ cursor: 'pointer', padding: '8px 0' }}
                    onClick={() => navigate(`/tasks/${item.task_id}`)}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text style={{ fontSize: 13 }}>{item.user_name}</Text>
                          <Tag>{item.action}</Tag>
                        </Space>
                      }
                      description={
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {item.task_title} &middot; {dayjs(item.created_at).fromNow()}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} md={10}>
          <Card title={<span><HeartOutlined style={{ color: '#C46B5A', marginRight: 8 }} />Daily Inspiration</span>} size="small">
            {inspirationLoading || !inspiration ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : (
              <>
                <Paragraph style={{ fontSize: 15, fontStyle: 'italic', color: '#6B5E50', marginBottom: 16 }}>
                  {inspiration.quote}
                </Paragraph>
                <Card size="small" style={{ background: '#FFF8F0', border: '1px solid #E8E0D8', marginBottom: 12 }}>
                  <Text strong style={{ color: '#8B7355', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Affirmation</Text>
                  <Paragraph style={{ margin: '4px 0 0', fontSize: 13, color: '#6B5E50' }}>
                    {inspiration.affirmation}
                  </Paragraph>
                </Card>
                <Card size="small" style={{ background: '#F5F0EB', border: '1px solid #E8E0D8', marginBottom: 12 }}>
                  <Text strong style={{ color: '#7A9B6D', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Wellness Tip</Text>
                  <Paragraph style={{ margin: '4px 0 0', fontSize: 13, color: '#6B5E50' }}>
                    {inspiration.tip}
                  </Paragraph>
                </Card>
                {inspiration.scripture && (
                  <Card size="small" style={{ background: '#F0F4FF', border: '1px solid #D6DDEF', marginBottom: 12 }}>
                    <Text strong style={{ color: '#5B6A8A', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      <BookOutlined style={{ marginRight: 4 }} />Daily Scripture
                    </Text>
                    <Paragraph style={{ margin: '4px 0 0', fontSize: 13, color: '#4A5568', fontStyle: 'italic' }}>
                      "{inspiration.scripture.verse}"
                    </Paragraph>
                    <Text type="secondary" style={{ fontSize: 12 }}>— {inspiration.scripture.reference}</Text>
                  </Card>
                )}
                {inspiration.fitness && (
                  <Card size="small" style={{ background: '#F0FFF4', border: '1px solid #C6F6D5', marginBottom: 12 }}>
                    <Text strong style={{ color: '#276749', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      <ThunderboltOutlined style={{ marginRight: 4 }} />Recovery Fitness
                    </Text>
                    <Text strong style={{ display: 'block', margin: '4px 0 2px', fontSize: 13, color: '#2D3748' }}>
                      {inspiration.fitness.name}
                    </Text>
                    <Paragraph style={{ margin: 0, fontSize: 13, color: '#4A5568' }}>
                      {inspiration.fitness.description}
                    </Paragraph>
                  </Card>
                )}
                <Button
                  type="link"
                  icon={<LinkOutlined />}
                  onClick={() => window.open(inspiration.link.url, '_blank')}
                  style={{ padding: 0, color: '#8B7355', fontSize: 13 }}
                >
                  {inspiration.link.label}
                </Button>
              </>
            )}
          </Card>
        </Col>
      </Row>

      <TaskForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={() => {
          getDashboardStats().then((res) => setStats(res.data)).catch(console.error);
        }}
      />
    </div>
  );
}
