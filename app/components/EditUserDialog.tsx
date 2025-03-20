'use client';

import { gql, useMutation } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { toast } from 'sonner';
import { useEffect } from 'react';

const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      email
    }
  }
`;

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

interface EditUserDialogProps {
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUserDialog({ user, open, onOpenChange }: EditUserDialogProps) {
  const [updateUser] = useMutation(UPDATE_USER, {
    refetchQueries: [{ query: GET_USERS }],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  // Reset form with user data when user changes or dialog opens
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
      });
    }
  }, [form, user]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;

    try {
      await updateUser({
        variables: {
          id: user.id,
          input: values,
        },
      });
      toast.success('User updated successfully', {
        description: `${values.name}'s information has been updated`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
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
                    <Input {...field} />
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
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Save Changes</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
