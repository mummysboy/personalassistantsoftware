import { useState } from 'react';
import { Upload, List, Button, Typography, Popconfirm, message, Space } from 'antd';
import { UploadOutlined, DownloadOutlined, DeleteOutlined, FileOutlined, FilePdfOutlined, FileImageOutlined, EyeOutlined } from '@ant-design/icons';
import { uploadAttachment, deleteAttachment } from '../services/api';
import dayjs from 'dayjs';

const { Text } = Typography;

function getFileIcon(mimeType) {
  if (mimeType?.startsWith('image/')) return <FileImageOutlined />;
  if (mimeType?.includes('pdf')) return <FilePdfOutlined />;
  return <FileOutlined />;
}

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentList({ taskId, attachments = [], onUpdate }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (options) => {
    setUploading(true);
    try {
      await uploadAttachment(taskId, options.file);
      message.success('File uploaded');
      onUpdate?.();
    } catch {
      message.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAttachment(id);
      message.success('Attachment deleted');
      onUpdate?.();
    } catch {
      message.error('Delete failed');
    }
  };

  const handleDownload = (attachment) => {
    const apiBase = import.meta.env.VITE_API_URL || '';
    const token = localStorage.getItem('token');
    window.open(`${apiBase}/api/attachments/${attachment.id}/download?token=${token}`, '_blank');
  };

  const handleView = (attachment) => {
    const apiBase = import.meta.env.VITE_API_URL || '';
    const token = localStorage.getItem('token');
    window.open(`${apiBase}/api/attachments/${attachment.id}/view?token=${token}`, '_blank');
  };

  const isViewable = (mimeType) => {
    return mimeType?.includes('pdf') || mimeType?.startsWith('image/');
  };

  return (
    <div>
      <Upload customRequest={handleUpload} showUploadList={false}>
        <Button icon={<UploadOutlined />} loading={uploading} style={{ marginBottom: 8 }}>
          Upload File
        </Button>
      </Upload>
      <List
        size="small"
        dataSource={attachments}
        renderItem={(item) => (
          <List.Item
            actions={[
              isViewable(item.mime_type) && (
                <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(item)} key="view" title="View" />
              ),
              <Button type="link" size="small" icon={<DownloadOutlined />} onClick={() => handleDownload(item)} key="dl" title="Download" />,
              <Popconfirm title="Delete?" onConfirm={() => handleDelete(item.id)} key="del">
                <Button type="link" size="small" icon={<DeleteOutlined />} danger />
              </Popconfirm>,
            ].filter(Boolean)}
          >
            <List.Item.Meta
              avatar={getFileIcon(item.mime_type)}
              title={<Text style={{ fontSize: 13 }}>{item.filename}</Text>}
              description={
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {formatSize(item.file_size)} &middot; {item.uploaded_by_name} &middot; {dayjs(item.created_at).format('MMM D')}
                </Text>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
}
