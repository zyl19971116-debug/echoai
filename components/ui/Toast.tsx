'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type ToastVariant = 'default' | 'success' | 'error';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  push: (toast: { title: string; description?: string; variant?: ToastVariant }) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let counter = 0;

const ICONS: Record<ToastVariant, ReactNode> = {
  default: <Info className="h-4 w-4 text-echo-blue" />,
  success: <CheckCircle2 className="h-4 w-4 text-echo-cyan" />,
  error: <AlertTriangle className="h-4 w-4 text-[#FF8A7A]" />,
};

const BORDERS: Record<ToastVariant, string> = {
  default: 'border-echo-blue/30',
  success: 'border-echo-cyan/30',
  error: 'border-[#FF8A7A]/35',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const push = useCallback<ToastContextValue['push']>(
    ({ title, description, variant = 'default' }) => {
      counter += 1;
      const id = `toast-${counter}`;
      setItems((prev) => [...prev.slice(-2), { id, title, description, variant }]);
      setTimeout(() => dismiss(id), 4600);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-4 z-[120] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2.5 md:right-8">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={`glass pointer-events-auto flex items-start gap-3 rounded-sm border px-4 py-3 shadow-glow ${BORDERS[item.variant]}`}
              role="status"
            >
              <span className="mt-0.5">{ICONS[item.variant]}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-white">
                  {item.title}
                </p>
                {item.description && (
                  <p className="mt-1 text-[0.74rem] leading-relaxed text-echo-muted">{item.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Dismiss notification"
                className="text-echo-faint transition-colors hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside <ToastProvider>');
  }
  return ctx;
}
