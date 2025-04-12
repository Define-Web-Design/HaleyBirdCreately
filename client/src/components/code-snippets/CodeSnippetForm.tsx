import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { ProgrammingLanguage } from '../../../shared/schema';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

// Form schema
const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }).max(100, { message: 'Title cannot exceed 100 characters' }),
  description: z.string().max(500, { message: 'Description cannot exceed 500 characters' }).optional(),
  code: z.string().min(1, { message: 'Code snippet cannot be empty' }).max(10000, { message: 'Code snippet is too large (max 10000 characters)' }),
  language: z.nativeEnum(ProgrammingLanguage),
  tags: z.string().optional(),
  isPublic: z.boolean().default(true),
});

export type CodeSnippetFormValues = z.infer<typeof formSchema>;

interface CodeSnippetFormProps {
  defaultValues?: Partial<CodeSnippetFormValues>;
  onSubmit: (data: CodeSnippetFormValues) => void;
  isSubmitting?: boolean;
  isEditMode?: boolean;
}

const CodeSnippetForm: React.FC<CodeSnippetFormProps> = ({
  defaultValues = {
    title: '',
    description: '',
    code: '',
    language: ProgrammingLanguage.JAVASCRIPT,
    tags: '',
    isPublic: true,
  },
  onSubmit,
  isSubmitting = false,
  isEditMode = false,
}) => {
  const form = useForm<CodeSnippetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleSubmit = (data: CodeSnippetFormValues) => {
    // Convert tags string to array
    const formattedData = {
      ...data,
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
    };
    onSubmit(formattedData as CodeSnippetFormValues);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter a title for your snippet" {...field} />
              </FormControl>
              <FormDescription>
                Give your code snippet a descriptive title
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe what this code snippet does" 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Explain the purpose or functionality of this code snippet
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Paste your code here" 
                  className="font-mono min-h-[200px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Language</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(ProgrammingLanguage).map((language) => (
                    <SelectItem key={language} value={language}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the programming language of your code snippet
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="react, hooks, state" 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Add comma-separated tags to help others find your snippet
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Make this snippet public</FormLabel>
                <FormDescription>
                  Public snippets can be viewed and shared by anyone
                </FormDescription>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEditMode ? 'Update Snippet' : 'Create Snippet'}
        </Button>
      </form>
    </Form>
  );
};

export default CodeSnippetForm;