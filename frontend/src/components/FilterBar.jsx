import { Select, Input, DatePicker, Space, Button } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { STATUSES, PRIORITIES, CATEGORIES } from '../utils/constants';

const { RangePicker } = DatePicker;

export default function FilterBar({ filters, onChange, onClear }) {
  const update = (key, value) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  return (
    <Space wrap style={{ marginBottom: 16, width: '100%' }}>
      <Input
        placeholder="Search tasks..."
        prefix={<SearchOutlined />}
        allowClear
        value={filters.search}
        onChange={(e) => update('search', e.target.value)}
        style={{ width: 200 }}
      />
      <Select
        placeholder="Status"
        allowClear
        value={filters.status}
        onChange={(v) => update('status', v)}
        style={{ width: 150 }}
        options={STATUSES.map((s) => ({ value: s.value, label: s.label }))}
      />
      <Select
        placeholder="Priority"
        allowClear
        value={filters.priority}
        onChange={(v) => update('priority', v)}
        style={{ width: 130 }}
        options={PRIORITIES.map((p) => ({ value: p.value, label: p.label }))}
      />
      <Select
        placeholder="Assignee"
        allowClear
        value={filters.assigned_to}
        onChange={(v) => update('assigned_to', v)}
        style={{ width: 180 }}
        options={[
          { value: 1, label: 'Isaac H' },
        ]}
      />
      <Select
        placeholder="Category"
        allowClear
        value={filters.category}
        onChange={(v) => update('category', v)}
        style={{ width: 140 }}
        options={CATEGORIES.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
      />
      <Select
        placeholder="Sort by"
        value={filters.sort}
        onChange={(v) => update('sort', v)}
        style={{ width: 140 }}
        options={[
          { value: 'updated_at', label: 'Last Updated' },
          { value: 'created_at', label: 'Created' },
          { value: 'due_date', label: 'Due Date' },
          { value: 'priority', label: 'Priority' },
        ]}
      />
      <Button icon={<ClearOutlined />} onClick={onClear}>Clear</Button>
    </Space>
  );
}
