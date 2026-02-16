import { useState } from 'react';
import { Checkbox, Input, Button, List, Space, Popconfirm, Progress } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { addSubtask, updateSubtask, deleteSubtask } from '../services/api';

export default function SubtaskChecklist({ taskId, subtasks = [], onUpdate }) {
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const completed = subtasks.filter((s) => s.is_completed).length;
  const total = subtasks.length;

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      await addSubtask(taskId, { title: newTitle.trim() });
      setNewTitle('');
      onUpdate?.();
    } catch {
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (subtask) => {
    await updateSubtask(taskId, subtask.id, { is_completed: !subtask.is_completed });
    onUpdate?.();
  };

  const handleDelete = async (subtaskId) => {
    await deleteSubtask(taskId, subtaskId);
    onUpdate?.();
  };

  return (
    <div>
      {total > 0 && (
        <Progress percent={Math.round((completed / total) * 100)} size="small" style={{ marginBottom: 8 }} />
      )}
      <List
        size="small"
        dataSource={subtasks}
        renderItem={(item) => (
          <List.Item
            style={{ padding: '4px 0' }}
            actions={[
              <Popconfirm title="Delete subtask?" onConfirm={() => handleDelete(item.id)} key="delete">
                <Button type="text" size="small" icon={<DeleteOutlined />} danger />
              </Popconfirm>,
            ]}
          >
            <Checkbox
              checked={item.is_completed}
              onChange={() => handleToggle(item)}
              style={{ textDecoration: item.is_completed ? 'line-through' : 'none', color: item.is_completed ? '#999' : 'inherit' }}
            >
              {item.title}
            </Checkbox>
          </List.Item>
        )}
      />
      <Space.Compact style={{ width: '100%', marginTop: 8 }}>
        <Input
          placeholder="Add subtask..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onPressEnter={handleAdd}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} loading={adding} />
      </Space.Compact>
    </div>
  );
}
