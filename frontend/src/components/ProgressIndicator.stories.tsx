import type { Meta, StoryObj } from '@storybook/react';
import ProgressIndicator from './ProgressIndicator';

const meta = {
  title: 'Components/ProgressIndicator',
  component: ProgressIndicator,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#050505' },
      ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    currentPage: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Current page number',
    },
    totalPages: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Total number of pages',
    },
  },
} satisfies Meta<typeof ProgressIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstPage: Story = {
  args: {
    currentPage: 1,
    totalPages: 3,
  },
};

export const MiddlePage: Story = {
  args: {
    currentPage: 2,
    totalPages: 3,
  },
};

export const LastPage: Story = {
  args: {
    currentPage: 3,
    totalPages: 3,
  },
};

export const FivePages: Story = {
  args: {
    currentPage: 3,
    totalPages: 5,
  },
};

export const TenPages: Story = {
  args: {
    currentPage: 7,
    totalPages: 10,
  },
};

export const Interactive: Story = {
  args: {
    currentPage: 1,
    totalPages: 3,
  },
  parameters: {
    docs: {
      description: {
        story: 'Use the controls to adjust the current page and total pages to see the progress indicator update in real-time.',
      },
    },
  },
};
