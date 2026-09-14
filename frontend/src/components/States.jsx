import { AlertCircle, InboxIcon } from 'lucide-react';

export function EmptyState({ title = 'No data', message = 'Nothing to show here yet.', icon: Icon = InboxIcon }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="w-10 h-10 text-surface-300 mb-3" />
      <p className="text-sm font-medium text-surface-600">{title}</p>
      {message && <p className="text-xs text-surface-400 mt-1 max-w-xs">{message}</p>}
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertCircle className="w-10 h-10 text-danger mb-3" />
      <p className="text-sm font-medium text-surface-700">Error</p>
      <p className="text-xs text-surface-500 mt-1">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary btn-sm mt-4">Try again</button>
      )}
    </div>
  );
}
