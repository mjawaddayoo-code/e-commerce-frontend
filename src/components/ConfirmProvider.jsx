import { createContext, useCallback, useContext, useRef, useState } from 'react';

const Ctx = createContext(() => Promise.resolve(window.confirm('Are you sure?')));
export const useConfirm = () => useContext(Ctx);

// const confirm = useConfirm();  if (!(await confirm('Delete this item?'))) return;
export function ConfirmProvider({ children }) {
  const [message, setMessage] = useState(null);
  const resolver = useRef(null);
  const confirm = useCallback((msg) => new Promise((resolve) => { resolver.current = resolve; setMessage(msg); }), []);
  const close = (answer) => { resolver.current?.(answer); setMessage(null); };

  return (
    <Ctx.Provider value={confirm}>
      {children}
      {message && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={() => close(false)} role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <p className="font-semibold">{message}</p>
            <div className="mt-4 flex justify-end gap-2">
              <button autoFocus onClick={() => close(false)} className="btn border border-slate-200 !py-2">Cancel</button>
              <button onClick={() => close(true)} className="btn bg-red-600 !py-2 text-white hover:bg-red-700">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}
