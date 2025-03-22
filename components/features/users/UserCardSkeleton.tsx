export function UserCardSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow animate-pulse">
      <div className="flex items-center space-x-4 min-w-0">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 animate-gradient" />
        <div className="min-w-0 space-y-2">
          <div className="h-4 w-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-gradient" />
          <div className="h-3 w-48 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-gradient" />
          <div className="flex gap-1">
            <div className="h-5 w-16 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-gradient" />
            <div className="h-5 w-16 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-gradient" />
          </div>
        </div>
      </div>
      <div className="h-8 w-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-gradient" />
    </div>
  );
}
