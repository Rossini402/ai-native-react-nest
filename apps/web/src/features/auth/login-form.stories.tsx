import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { LoginForm } from "./login-form";

const meta = {
  title: "Features/Auth/LoginForm",
  component: LoginForm,
  tags: ["autodocs"],
  args: {
    loading: false,
    error: null,
    onSubmit: fn(),
  },
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Submitting: Story = {
  args: {
    loading: true,
  },
};

export const InvalidCredentialsError: Story = {
  args: {
    error: "Invalid email or password",
  },
};
