'use client';

import { gql, useQuery, useMutation } from '@apollo/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { toast } from 'sonner';
import { EditUserDialog } from './EditUserDialog';

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      id
      name
      email
    }
  }
`;

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function UserList() {
  const { loading, error, data } = useQuery(GET_USERS);
  const [deleteUser] = useMutation(DELETE_USER, {
    refetchQueries: [{ query: GET_USERS }],
  });
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
  const [userToEdit, setUserToEdit] = useState<{ id: string; name: string; email: string } | null>(
    null
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser({
        variables: { id: userToDelete.id },
      });
      toast.success('User deleted successfully', {
        description: `${userToDelete.name} has been removed from the system`,
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    } finally {
      setUserToDelete(null);
    }
  };

  return (
    <>
      <div className="max-w-2xl mx-auto p-4">
        <div className="space-y-4">
          {data.users.map((user: { id: string; name: string; email: string }) => (
            <div
              key={user.id}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative"
            >
              <div className="absolute right-2 top-2 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setUserToEdit(user)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setUserToDelete({ id: user.id, name: user.name })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {userToDelete?.name}&apos;s account and remove all their
              data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete Account</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditUserDialog
        user={userToEdit}
        open={!!userToEdit}
        onOpenChange={(open) => !open && setUserToEdit(null)}
      />
    </>
  );
}
