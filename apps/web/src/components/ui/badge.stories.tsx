import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./badge";

const meta = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: {
    children: "in_progress",
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Secondary: Story = {
  args: { variant: "secondary" },
};

export const Success: Story = {
  args: { variant: "success", children: "done" },
};

export const Warning: Story = {
  args: { variant: "warning", children: "high priority" },
};

export const Destructive: Story = {
  args: { variant: "destructive", children: "blocked" },
};
