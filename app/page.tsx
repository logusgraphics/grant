import { UserList } from './components/UserList';
import { ThemeExample } from './components/ThemeExample';
import { CreateUserDialog } from './components/CreateUserDialog';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Welcome to Our Next.js + Apollo App</h1>
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
