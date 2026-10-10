import { Check } from 'lucide-react';
import { TIMELINE, TIMELINE_LABELS } from '../utils/constants';

export default function OrderTracker({ status }) {
  if (status === 'cancelled') return <p className="rounded-xl bg-red-50 p-3 text-center font-semibold text-red-600">This order was cancelled</p>;
  const current = TIMELINE.indexOf(status);
  return (
    <ol className="space-y-0">
      {TIMELINE.map((s, i) => (
        <li key={s} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i < current ? 'bg-green-500 text-white' : i === current ? 'bg-gold text-brand-dark ring-4 ring-gold/30' : 'bg-slate-200 text-slate-400'}`}>{i < current ? <Check className="h-4 w-4" /> : i + 1}</span>
            {i < TIMELINE.length - 1 && <span className={`h-6 w-0.5 ${i < current ? 'bg-green-500' : 'bg-slate-200'}`} />}
          </div>
          <p className={`pt-0.5 text-sm ${i === current ? 'font-bold' : i < current ? 'text-slate-700' : 'text-slate-400'}`}>{TIMELINE_LABELS[s]}</p>
        </li>
      ))}
    </ol>
  );
}
