'use client';

import { gql, useMutation } from '@apollo/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { GET_USERS } from './UserList';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
    }
  }
`;

const formSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .regex(/^[a-zA-Z\s]*$/, 'Name can only contain letters and spaces'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const [createUser] = useMutation(CREATE_USER, {
    refetchQueries: [{ query: GET_USERS }],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
    },
    mode: 'onSubmit', // Only validate on submit
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createUser({
        variables: {
          input: values,
        },
      });
      form.reset();
      setOpen(false);
      toast.success('User created successfully', {
        description: `${values.name} has been added to the system`,
      });
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add User</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      {...field}
                      className={cn(
                        form.formState.errors.name &&
                          'border-destructive focus-visible:ring-destructive'
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="john@example.com"
                      type="email"
                      {...field}
                      className={cn(
                        form.formState.errors.email &&
                          'border-destructive focus-visible:ring-destructive'
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Create User</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
