// src/components/ui/Button.stories.tsx
import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { 
  Button, 
  IconButton, 
  ButtonGroup, 
  PrimaryButton, 
  SecondaryButton, 
  DangerButton, 
  SuccessButton 
} from './Button';
import { Plus, Trash2, Check, X, Loader2 } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'warning', 'success', 'ghost', 'outline', 'link'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'icon', 'icon-sm', 'icon-lg'],
    },
    fullWidth: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
    pill: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Basic button examples
export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
    size: 'md',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
    size: 'md',
  },
};

export const Danger: Story = {
  args: {
    children: 'Delete',
    variant: 'danger',
    size: 'md',
    leftIcon: <Trash2 className="w-4 h-4" />,
  },
};

export const Success: Story = {
  args: {
    children: 'Save Changes',
    variant: 'success',
    size: 'md',
    leftIcon: <Check className="w-4 h-4" />,
  },
};

// Button with icons
export const WithLeftIcon: Story = {
  args: {
    children: 'Add Item',
    variant: 'primary',
    size: 'md',
    leftIcon: <Plus className="w-4 h-4" />,
  },
};

export const WithRightIcon: Story = {
  args: {
    children: 'Continue',
    variant: 'primary',
    size: 'md',
    rightIcon: <Plus className="w-4 h-4" />,
  },
};

// Loading state
export const Loading: Story = {
  args: {
    children: 'Submit',
    variant: 'primary',
    size: 'md',
    loading: true,
    loadingText: 'Processing...',
  },
};

export const WithCustomLoadingText: Story = {
  args: {
    children: 'Submit',
    variant: 'primary',
    size: 'md',
    isLoading: true,
    loadingText: 'Please wait...',
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    variant: 'primary',
    size: 'md',
    disabled: true,
  },
};

// Full width
export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    variant: 'primary',
    size: 'lg',
    fullWidth: true,
  },
};

// Pill shape
export const Pill: Story = {
  args: {
    children: 'Pill Button',
    variant: 'primary',
    size: 'md',
    pill: true,
  },
};

// All sizes
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="xs">XS</Button>
      <Button size="sm">SM</Button>
      <Button size="md">MD</Button>
      <Button size="lg">LG</Button>
      <Button size="xl">XL</Button>
    </div>
  ),
};

// All variants
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <PrimaryButton>Primary</PrimaryButton>
      <SecondaryButton>Secondary</SecondaryButton>
      <SuccessButton>Success</SuccessButton>
      <DangerButton>Danger</DangerButton>
      <Button variant="warning">Warning</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

// Icon button
export const IconButtons: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <IconButton icon={<Plus className="w-5 h-5" />} label="Add" variant="primary" />
      <IconButton icon={<Trash2 className="w-5 h-5" />} label="Delete" variant="danger" />
      <IconButton icon={<Check className="w-5 h-5" />} label="Confirm" variant="success" />
      <IconButton icon={<X className="w-5 h-5" />} label="Close" variant="ghost" />
    </div>
  ),
};

// Button group
export const ButtonGroupExample: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <ButtonGroup>
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Save</Button>
      </ButtonGroup>

      <ButtonGroup orientation="vertical">
        <Button variant="secondary" size="sm">Edit</Button>
        <Button variant="secondary" size="sm">Duplicate</Button>
        <DangerButton size="sm">Delete</DangerButton>
      </ButtonGroup>

      <ButtonGroup spacing="lg">
        <Button variant="outline">Previous</Button>
        <Button variant="primary">Next</Button>
      </ButtonGroup>
    </div>
  ),
};

// Loading button with spinner
export const LoadingButton: Story = {
  render: function LoadingButtonComponent() {
    const [loading, setLoading] = React.useState(false);
    
    const handleClick = () => {
      setLoading(true);
      setTimeout(() => setLoading(false), 3000);
    };

    return (
      <Button 
        variant="primary" 
        isLoading={loading}
        loadingText="Saving..."
        onClick={handleClick}
        leftIcon={!loading ? <Plus className="w-4 h-4" /> : undefined}
      >
        {!loading ? 'Add Medication' : 'Saving...'}
      </Button>
    );
  },
};