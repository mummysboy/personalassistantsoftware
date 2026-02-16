import { useState } from 'react';
import { List, Input, Button, Avatar, Typography, Space } from 'antd';
import { UserOutlined, SendOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { addComment } from '../services/api';

dayjs.extend(relativeTime);
const { Text } = Typography;

export default function CommentThread({ taskId, comments = [], onUpdate }) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!content.trim()) return;
    setSending(true);
    try {
      await addComment(taskId, content.trim());
      setContent('');
      onUpdate?.();
    } catch {
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <List
        dataSource={comments}
        renderItem={(item) => (
          <List.Item style={{ padding: '8px 0' }}>
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} size="small" />}
              title={
                <Space>
                  <Text strong style={{ fontSize: 13 }}>{item.user_name}</Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>{dayjs(item.created_at).fromNow()}</Text>
                </Space>
              }
              description={<Text style={{ whiteSpace: 'pre-wrap' }}>{item.content}</Text>}
            />
          </List.Item>
        )}
      />
      <Space.Compact style={{ width: '100%', marginTop: 8 }}>
        <Input.TextArea
          rows={2}
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button type="primary" icon={<SendOutlined />} onClick={handleSend} loading={sending} style={{ height: 'auto' }} />
      </Space.Compact>
    </div>
  );
}
