import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import api, { errMsg, rs } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import useQuote from '../hooks/useQuote';
import Summary from '../components/Summary';
import Field from '../components/Field';
import { checkoutSchema } from '../utils/schemas';

const STEPS = ['Your details', 'Delivery', 'Review & pay'];
const STEP_FIELDS = [['name', 'phone', 'email'], ['area', 'city', 'street', 'landmark', 'instructions'], []];

export default function Checkout() {
  const { user } = useAuth();
  const { lines, apiItems, clear } = useCart();
  const { state } = useLocation();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [areas, setAreas] = useState([]);
  const { register, handleSubmit, trigger, watch, getValues, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(checkoutSchema), mode: 'onTouched',
    defaultValues: { name: user?.name || '', phone: user?.phone || '', email: user?.email || '', area: '', city: 'Sukkur', street: '', landmark: '', instructions: '' },
  });
  const area = watch('area');
  const { quote, error } = useQuote(apiItems, state?.coupon, area);
  document.title = 'Checkout';

  useEffect(() => { api.get('/settings').then((r) => setAreas((r.data.settings.deliveryAreas || []).filter((a) => a.active !== false))).catch(() => {}); }, []);

  if (!lines.length) return <Navigate to="/cart" replace />;

  const next = async () => { if (await trigger(STEP_FIELDS[step])) setStep(step + 1); };

  const place = async (v) => {
    try {
      const { data } = await api.post('/orders', {
        items: apiItems, couponCode: state?.coupon || undefined, paymentMethod: 'cod',
        customer: { name: v.name, phone: v.phone, email: v.email },
        shippingAddress: { area: v.area, city: v.city, street: v.street, landmark: v.landmark || undefined, instructions: v.instructions || undefined },
      });
      clear();
      nav(`/order-success/${data.order._id}`, { replace: true });
    } catch (e) { toast.error(errMsg(e)); }
  };

  const v = getValues();
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_340px]">
      <form onSubmit={handleSubmit(place)} noValidate className="card space-y-4 p-4 md:p-6">
        <div className="flex gap-2 text-xs font-semibold">
          {STEPS.map((s, i) => <div key={s} className={`flex-1 rounded-full py-1.5 text-center ${i <= step ? 'bg-brand text-white' : 'bg-slate-100 text-slate-500'}`}>{i + 1}. {s}</div>)}
        </div>

        <div className={step === 0 ? 'space-y-4' : 'hidden'}>
          <Field label="Full name" autoComplete="name" error={errors.name?.message} {...register('name')} />
          <Field label="Phone number" inputMode="tel" placeholder="03XXXXXXXXX" autoComplete="tel" error={errors.phone?.message} {...register('phone')} />
          <Field label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        </div>

        <div className={step === 1 ? 'space-y-4' : 'hidden'}>
          {areas.length ? (
            <label className="block"><span className="text-sm font-semibold">Area</span>
              <select className="input mt-1" {...register('area')}><option value="">Select your area</option>{areas.map((a) => <option key={a.name} value={a.name}>{a.name} (delivery {rs(a.fee)})</option>)}</select>
              {errors.area && <span className="text-xs text-red-600">{errors.area.message}</span>}
            </label>
          ) : <Field label="Area" error={errors.area?.message} {...register('area')} />}
          <Field label="City" error={errors.city?.message} {...register('city')} />
          <Field label="Street / address" error={errors.street?.message} {...register('street')} />
          <Field label="Landmark (optional)" {...register('landmark')} />
          <Field label="Delivery instructions (optional)" error={errors.instructions?.message} {...register('instructions')} />
        </div>

        {step === 2 && (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-3 text-sm"><b>{v.name}</b> · {v.phone}<br />{v.street}, {v.area}, {v.city}</div>
            <div className="space-y-1 text-sm">{quote?.items.map((i, idx) => <div key={idx} className="flex justify-between"><span>{i.name} × {i.quantity}{[...(i.variants || []).map((v) => v.label), ...(i.extras || []).map((e) => e.name)].length > 0 && <><br /><span className="text-xs text-slate-500">{[...(i.variants || []).map((v) => v.label), ...(i.extras || []).map((e) => e.name)].join(' · ')}</span></>}</span><span>{rs(i.lineTotal)}</span></div>)}</div>
            <div>
              <p className="mb-2 font-semibold">Payment method</p>
              <label className="flex items-center gap-2 rounded-xl border-2 border-brand p-3"><input type="radio" checked readOnly />Cash on Delivery <span className="text-xs text-slate-500">(pay when your order arrives)</span></label>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )}

        <div className="flex justify-between pt-2">
          <button type="button" disabled={step === 0} onClick={() => setStep(step - 1)} className="btn border border-slate-200">Back</button>
          {step < 2
            ? <button type="button" onClick={next} className="btn-blue">Continue</button>
            : <button disabled={isSubmitting || !quote} className="btn-gold">{isSubmitting ? 'Placing order...' : 'Place Order'}</button>}
        </div>
      </form>
      <aside className="card h-fit p-4 md:sticky md:top-20"><p className="mb-2 font-bold">Order summary</p><Summary quote={quote} /></aside>
    </div>
  );
}
