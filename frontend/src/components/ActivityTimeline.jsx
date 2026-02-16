import { Timeline, Typography } from 'antd';
import {
  PlusCircleOutlined,
  SwapOutlined,
  UserSwitchOutlined,
  MessageOutlined,
  PaperClipOutlined,
  EditOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
const { Text } = Typography;

const actionIcons = {
  created: <PlusCircleOutlined style={{ color: '#7A9B6D' }} />,
  status_changed: <SwapOutlined style={{ color: '#8B7355' }} />,
  assigned: <UserSwitchOutlined style={{ color: '#9B7DB8' }} />,
  commented: <MessageOutlined style={{ color: '#6BA3A0' }} />,
  attachment_added: <PaperClipOutlined style={{ color: '#D4A06A' }} />,
  updated: <EditOutlined style={{ color: '#A89E99' }} />,
};

function formatAction(entry) {
  const details = entry.details || {};
  switch (entry.action) {
    case 'created':
      return `${entry.user_name} created this task`;
    case 'status_changed':
      return `${entry.user_name} changed status from "${details.from}" to "${details.to}"`;
    case 'assigned':
      return `${entry.user_name} changed assignment`;
    case 'commented':
      return `${entry.user_name} added a comment`;
    case 'attachment_added':
      return `${entry.user_name} uploaded "${details.filename || 'a file'}"`;
    case 'updated':
      return `${entry.user_name} updated ${details.field || 'task'}`;
    default:
      return `${entry.user_name} ${entry.action}`;
  }
}

export default function ActivityTimeline({ activity = [] }) {
  if (activity.length === 0) {
    return <Text type="secondary">No activity yet</Text>;
  }

  return (
    <Timeline
      items={activity.map((entry) => ({
        dot: actionIcons[entry.action] || <EditOutlined />,
        children: (
          <div>
            <Text style={{ fontSize: 13 }}>{formatAction(entry)}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 11 }}>
              {dayjs(entry.created_at).fromNow()}
            </Text>
          </div>
        ),
      }))}
    />
  );
}
