import { createContext, useContext, useState, PropsWithChildren } from 'react';

type Toast = { id: number; text: string }
const ToastCtx = createContext<{ push: (text: string)=>void } | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = (text: string) => {
    const id = Date.now();
    setToasts(ts => [...ts, { id, text }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 2500);
  };
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 space-y-2 z-50">
        {toasts.map(t => (
          <div key={t.id} className="px-4 py-2 rounded-xl bg-green-600 text-white shadow">
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx)!;
