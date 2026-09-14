import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useState } from 'react';

const VARIANTS = {
  success: { cls: 'alert-success', Icon: CheckCircle },
  error:   { cls: 'alert-danger',  Icon: AlertCircle },
  warning: { cls: 'alert-warning', Icon: AlertTriangle },
  info:    { cls: 'alert-info',    Icon: Info },
};

export function Toast({ message, variant = 'info', onDismiss }) {
  const { cls, Icon } = VARIANTS[variant] ?? VARIANTS.info;
  return (
    <div className={`${cls} flex items-start gap-2 shadow-card-md`}>
      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span className="flex-1 text-sm">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="ml-1 hover:opacity-70">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState([]);

  function show(message, variant = 'info') {
    const id = Date.now();
    setToasts(t => [...t, { id, message, variant }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }

  function dismiss(id) {
    setToasts(t => t.filter(x => x.id !== id));
  }

  const ToastContainer = () => (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
      {toasts.map(t => (
        <Toast key={t.id} message={t.message} variant={t.variant} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  );

  return { show, ToastContainer };
}
