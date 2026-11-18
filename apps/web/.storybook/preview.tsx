import type { Preview } from "@storybook/react";
import { AntdDesignSystemProvider } from "../src/design-system/antd-provider";
import "../src/styles/globals.css";

const preview: Preview = {
  decorators: [
    (Story) => (
      <AntdDesignSystemProvider>
        <Story />
      </AntdDesignSystemProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "padded",
  },
};

export default preview;
