import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Layout,
  Menu,
  Badge,
  Dropdown,
  Avatar,
  List,
  Typography,
  Button,
  Space,
  Empty,
  Drawer,
} from 'antd';
import {
  DashboardOutlined,
  UnorderedListOutlined,
  CalendarOutlined,
  SyncOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/tasks', icon: <UnorderedListOutlined />, label: 'Tasks' },
  { key: '/calendar', icon: <CalendarOutlined />, label: 'Calendar' },
  { key: '/recurring', icon: <SyncOutlined />, label: 'Recurring' },
];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
}

export default function AppLayout({ children }) {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(isMobile);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = ({ key }) => {
    navigate(key);
    if (isMobile) setDrawerOpen(false);
  };

  const notificationContent = (
    <div style={{ width: isMobile ? 'calc(100vw - 48px)' : 360, maxWidth: 360, maxHeight: 400, overflow: 'auto' }}>
      <div style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E8E0D8' }}>
        <Text strong>Notifications</Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={markAllRead}>
            Mark all read
          </Button>
        )}
      </div>
      {notifications.length === 0 ? (
        <Empty description="No notifications" style={{ padding: 24 }} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <List
          dataSource={notifications.slice(0, 20)}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: '8px 16px',
                background: item.is_read ? 'transparent' : '#FFF8F0',
                cursor: 'pointer',
              }}
              onClick={() => {
                markRead(item.id);
                if (item.task_id) navigate(`/tasks/${item.task_id}`);
              }}
            >
              <List.Item.Meta
                description={
                  <>
                    <Text style={{ fontSize: 13 }}>{item.message}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {dayjs(item.created_at).fromNow()}
                    </Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  const siderMenu = (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname === '/' ? '/' : '/' + location.pathname.split('/')[1]]}
      items={menuItems}
      onClick={handleMenuClick}
      style={{ background: '#F5F0EB', color: '#6B5E50', borderRight: 'none' }}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {isMobile ? (
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={220}
          styles={{ body: { padding: 0, background: '#F5F0EB' } }}
          closable={false}
        >
          <div className="logo">
            <span>JF Tasks</span>
          </div>
          {siderMenu}
        </Drawer>
      ) : (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          style={{ background: '#F5F0EB' }}
          theme="light"
        >
          <div className="logo">
            {!collapsed && <span>JF Tasks</span>}
          </div>
          {siderMenu}
        </Sider>
      )}
      <Layout>
        <Header
          style={{
            padding: '0 16px',
            background: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 1px 3px rgba(139,115,85,0.08)',
          }}
        >
          {isMobile ? (
            <Button type="text" icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} />
          ) : (
            <div />
          )}
          <Space size={isMobile ? 8 : 16}>
            <Dropdown
              dropdownRender={() => notificationContent}
              trigger={['click']}
              placement="bottomRight"
            >
              <Badge count={unreadCount} size="small">
                <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
              </Badge>
            </Dropdown>
            {!isMobile && (
              <Space>
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: user?.role === 'boss' ? '#8B7355' : '#7A9B6D' }} />
                <Text strong>{user?.name}</Text>
              </Space>
            )}
            <Button type="text" icon={<LogoutOutlined />} onClick={logout} />
          </Space>
        </Header>
        <Content style={{ margin: isMobile ? 8 : 16 }}>
          <div className="site-layout-content">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
