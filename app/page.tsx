import { UserList } from './components/UserList';
import { ThemeExample } from './components/ThemeExample';
import { CreateUserDialog } from './components/CreateUserDialog';
import { Users } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-3 mb-4">
          <Users className="h-8 w-8" />
          <h1 className="text-4xl font-bold tracking-tight">User Management</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          A modern user management system built with Next.js, Apollo, and shadcn/ui
        </p>
      </div>
      <div className="max-w-4xl mx-auto space-y-8">
        <ThemeExample />
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Users</h2>
          <CreateUserDialog />
        </div>
        <UserList />
      </div>
    </main>
  );
}
