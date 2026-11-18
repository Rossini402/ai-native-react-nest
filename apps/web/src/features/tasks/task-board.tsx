import { PlusOutlined } from "@ant-design/icons";
import {
  type CreateTaskInput,
  type Task,
  type TaskPriority,
  TaskPrioritySchema,
  type TaskStatus,
} from "@repo/contracts";
import {
  Alert,
  Button,
  Card,
  Col,
  Input,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { type FormEvent, useState } from "react";

export interface TaskBoardProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onCreate: (input: CreateTaskInput) => Promise<void> | void;
  onStatusChange: (id: string, status: TaskStatus) => Promise<void> | void;
}

const NEXT_STATUS: Record<TaskStatus, TaskStatus | null> = {
  todo: "in_progress",
  in_progress: "done",
  done: null,
};

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  low: "default",
  medium: "processing",
  high: "error",
};

const STATUS_COLOR: Record<TaskStatus, string> = {
  todo: "default",
  in_progress: "warning",
  done: "success",
};

export function TaskBoard({ tasks, loading, error, onCreate, onStatusChange }: TaskBoardProps) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    void onCreate({ title: trimmed, priority });
    setTitle("");
  };

  const columns: ColumnsType<Task> = [
    {
      title: "Task Title",
      dataIndex: "title",
      key: "title",
      render: (val: string, record) => (
        <Typography.Text delete={record.status === "done"} strong={record.status !== "done"}>
          {val}
        </Typography.Text>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 120,
      render: (val: TaskPriority) => <Tag color={PRIORITY_COLOR[val]}>{val}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (val: TaskStatus) => <Tag color={STATUS_COLOR[val]}>{val}</Tag>,
    },
    {
      title: "Operation",
      key: "action",
      width: 180,
      render: (_, record) => {
        const next = NEXT_STATUS[record.status];
        return next ? (
          <Button size="small" onClick={() => void onStatusChange(record.id, next)}>
            Move to {next}
          </Button>
        ) : (
          <Typography.Text type="secondary" className="text-xs">
            Completed
          </Typography.Text>
        );
      },
    },
  ];

  return (
    <div aria-label="Task Board" className="flex flex-col gap-4">
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Backlog (Todo)"
              value={tasks.filter((t) => t.status === "todo").length}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="In Progress"
              value={tasks.filter((t) => t.status === "in_progress").length}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic title="Completed" value={tasks.filter((t) => t.status === "done").length} />
          </Card>
        </Col>
      </Row>

      <Card title="Engineering Task Ledger (Ant Design Table)">
        <form onSubmit={handleSubmit} className="mb-4 flex flex-wrap items-center gap-2">
          <Input
            aria-label="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task summary..."
            maxLength={120}
            className="max-w-md flex-1"
          />
          <Select
            aria-label="Priority"
            value={priority}
            onChange={(val) => {
              const parsed = TaskPrioritySchema.safeParse(val);
              if (parsed.success) setPriority(parsed.data);
            }}
            options={[
              { value: "low", label: "Low Priority" },
              { value: "medium", label: "Medium Priority" },
              { value: "high", label: "High Priority" },
            ]}
            className="w-40"
          />
          <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
            Add Task
          </Button>
        </form>

        {error && <Alert role="alert" type="error" showIcon message={error} className="mb-4" />}

        <Space direction="vertical" className="w-full">
          <Table<Task>
            rowKey="id"
            size="middle"
            bordered
            loading={loading}
            columns={columns}
            dataSource={tasks}
            pagination={false}
            locale={{ emptyText: "No tasks yet. Create your first task above." }}
          />
        </Space>
      </Card>
    </div>
  );
}
