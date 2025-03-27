
import React, { useState } from 'react';
import Select, { MultiValue } from 'react-select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface Option {
  label: string;
  value: string;
}

interface MoodCapsuleFormProps {
  onSubmit: (formData: MoodCapsuleData) => void;
  initialData?: Partial<MoodCapsuleData>;
}

interface MoodCapsuleData {
  title: string;
  description: string;
  tags: string[];
  moodTones: string[];
}

const moodOptions: Option[] = [
  { value: 'joyful', label: 'Joyful' },
  { value: 'nostalgic', label: 'Nostalgic' },
  { value: 'calm', label: 'Calm' },
  { value: 'energetic', label: 'Energetic' },
  { value: 'melancholic', label: 'Melancholic' },
  { value: 'hopeful', label: 'Hopeful' },
  { value: 'reflective', label: 'Reflective' },
  { value: 'anxious', label: 'Anxious' }
];

const tagOptions: Option[] = [
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal' },
  { value: 'creative', label: 'Creative' },
  { value: 'project', label: 'Project' },
  { value: 'idea', label: 'Idea' },
  { value: 'inspiration', label: 'Inspiration' },
  { value: 'goal', label: 'Goal' }
];

const MoodCapsuleForm: React.FC<MoodCapsuleFormProps> = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState<MoodCapsuleData>({
    title: initialData.title || '',
    description: initialData.description || '',
    tags: initialData.tags || [],
    moodTones: initialData.moodTones || []
  });

  const [selectedMoodTones, setSelectedMoodTones] = useState<MultiValue<Option>>(
    moodOptions.filter(option => formData.moodTones.includes(option.value))
  );

  const [selectedTags, setSelectedTags] = useState<MultiValue<Option>>(
    tagOptions.filter(option => formData.tags.includes(option.value))
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMoodChange = (selected: MultiValue<Option>) => {
    setSelectedMoodTones(selected);
    setFormData(prev => ({
      ...prev,
      moodTones: selected.map(option => option.value)
    }));
  };

  const handleTagChange = (selected: MultiValue<Option>) => {
    setSelectedTags(selected);
    setFormData(prev => ({
      ...prev,
      tags: selected.map(option => option.value)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const selectStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: 'var(--background)',
      borderColor: 'var(--border)',
      '&:hover': {
        borderColor: 'var(--ring)'
      }
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: 'var(--background)',
      zIndex: 100
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? 'var(--accent)' : 'var(--background)',
      color: state.isFocused ? 'var(--accent-foreground)' : 'var(--foreground)'
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: 'var(--accent)',
      color: 'var(--accent-foreground)'
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: 'var(--accent-foreground)'
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: 'var(--accent-foreground)',
      '&:hover': {
        backgroundColor: 'var(--destructive)',
        color: 'var(--destructive-foreground)'
      }
    })
  };

  return (
    <Card className="p-6 w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Give your mood capsule a name"
            required
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe what this mood capsule is about..."
            rows={4}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="moodTones">Mood Tones</Label>
          <Select
            inputId="moodTones"
            options={moodOptions}
            isMulti
            value={selectedMoodTones}
            onChange={handleMoodChange}
            placeholder="Select mood tones..."
            aria-label="Select mood tones"
            styles={selectStyles}
            className="w-full"
          />
          <span className="text-xs text-muted-foreground">Select one or more moods that represent this capsule</span>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Select
            inputId="tags"
            options={tagOptions}
            isMulti
            value={selectedTags}
            onChange={handleTagChange}
            placeholder="Select tags..."
            aria-label="Select tags"
            styles={selectStyles}
            className="w-full"
          />
          <span className="text-xs text-muted-foreground">Categorize your capsule with relevant tags</span>
        </div>

        <Button type="submit" className="w-full">
          Save Mood Capsule
        </Button>
      </form>
    </Card>
  );
};

export default MoodCapsuleForm;
