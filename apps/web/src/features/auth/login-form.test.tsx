import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "./login-form";

afterEach(cleanup);

describe("LoginForm", () => {
  it("submits trimmed credentials when form is submitted", () => {
    const onSubmit = vi.fn();
    render(<LoginForm loading={false} error={null} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "  admin@example.com  " },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "AdminPassword123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: "admin@example.com",
      password: "AdminPassword123!",
    });
  });

  it("populates member demo credentials when Use Member Demo is clicked", () => {
    const onSubmit = vi.fn();
    render(<LoginForm loading={false} error={null} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: /Use Member Demo/i }));
    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: "member@example.com",
      password: "MemberPassword123!",
    });
  });

  it("renders recoverable error banner when authentication fails", () => {
    render(<LoginForm loading={false} error="Invalid email or password" onSubmit={vi.fn()} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid email or password");
  });
});
