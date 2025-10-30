import type { Meta, StoryObj } from '@storybook/react';
import CharacterResult from './CharacterResult';
import characterDescriptions from '../data/character-descriptions.json';
import type { HalloweenCharacter } from '../types';

const meta = {
  title: 'Components/CharacterResult',
  component: CharacterResult,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#050505' },
      ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    character: {
      control: 'select',
      options: ['zombie', 'joker', 'skeleton', 'nun', 'jack-o-lantern', 'vampire', 'ghost', 'frankenstein'],
      description: 'The Halloween character type',
    },
    onRetakeTest: { action: 'retake-test-clicked' },
    onViewProfile: { action: 'view-profile-clicked' },
  },
} satisfies Meta<typeof CharacterResult>;

export default meta;
type Story = StoryObj<typeof meta>;

// Helper to get character info
const getCharacterInfo = (character: HalloweenCharacter) => {
  return characterDescriptions[character];
};

// Default story - Zombie
export const Zombie: Story = {
  args: {
    character: 'zombie',
    characterInfo: getCharacterInfo('zombie'),
    onRetakeTest: () => console.log('Retake test clicked'),
  },
};

// Joker
export const Joker: Story = {
  args: {
    character: 'joker',
    characterInfo: getCharacterInfo('joker'),
    onRetakeTest: () => console.log('Retake test clicked'),
  },
};

// Skeleton
export const Skeleton: Story = {
  args: {
    character: 'skeleton',
    characterInfo: getCharacterInfo('skeleton'),
    onRetakeTest: () => console.log('Retake test clicked'),
  },
};

// Nun
export const Nun: Story = {
  args: {
    character: 'nun',
    characterInfo: getCharacterInfo('nun'),
    onRetakeTest: () => console.log('Retake test clicked'),
  },
};

// Jack-o'-lantern
export const JackOLantern: Story = {
  args: {
    character: 'jack-o-lantern',
    characterInfo: getCharacterInfo('jack-o-lantern'),
    onRetakeTest: () => console.log('Retake test clicked'),
  },
};

// Vampire
export const Vampire: Story = {
  args: {
    character: 'vampire',
    characterInfo: getCharacterInfo('vampire'),
    onRetakeTest: () => console.log('Retake test clicked'),
  },
};

// Ghost
export const Ghost: Story = {
  args: {
    character: 'ghost',
    characterInfo: getCharacterInfo('ghost'),
    onRetakeTest: () => console.log('Retake test clicked'),
  },
};

// Frankenstein
export const Frankenstein: Story = {
  args: {
    character: 'frankenstein',
    characterInfo: getCharacterInfo('frankenstein'),
    onRetakeTest: () => console.log('Retake test clicked'),
  },
};

// With Profile Button (Advanced Mode)
export const WithProfileButton: Story = {
  args: {
    character: 'zombie',
    characterInfo: getCharacterInfo('zombie'),
    onRetakeTest: () => console.log('Retake test clicked'),
    onViewProfile: () => console.log('View profile clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the component with the "View Profile" button enabled (advanced mode with email authentication).',
      },
    },
  },
};

// Mobile View
export const MobileView: Story = {
  args: {
    character: 'joker',
    characterInfo: getCharacterInfo('joker'),
    onRetakeTest: () => console.log('Retake test clicked'),
    onViewProfile: () => console.log('View profile clicked'),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Component displayed on a mobile device viewport.',
      },
    },
  },
};

// Tablet View
export const TabletView: Story = {
  args: {
    character: 'skeleton',
    characterInfo: getCharacterInfo('skeleton'),
    onRetakeTest: () => console.log('Retake test clicked'),
    onViewProfile: () => console.log('View profile clicked'),
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'Component displayed on a tablet device viewport.',
      },
    },
  },
};

// All Characters Showcase
export const AllCharacters: Story = {
  render: () => (
    <div className="space-y-8 p-8">
      {(Object.keys(characterDescriptions) as HalloweenCharacter[]).map((character) => (
        <div key={character} className="border-t-2 border-halloween-purple pt-8 first:border-t-0 first:pt-0">
          <CharacterResult
            character={character}
            characterInfo={getCharacterInfo(character)}
            onRetakeTest={() => console.log(`Retake test for ${character}`)}
          />
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Displays all 8 Halloween characters in a single view for comparison.',
      },
    },
  },
};
