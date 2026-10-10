import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import Field from '../components/Field';
import { contactSchema } from '../utils/schemas';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import api, { errMsg } from '../services/api';
import useSeo from '../hooks/useSeo';

export default function Contact() {
  const [s, setS] = useState(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(contactSchema) });
  useSeo({ title: 'Contact us', description: 'Call, WhatsApp or message us. We are happy to help with your order.' });
  useEffect(() => { api.get('/settings').then((r) => setS(r.data.settings)).catch(() => {}); }, []);

  const send = async (v) => {
    try { const r = await api.post('/contact', { ...v, phone: v.phone || undefined }); toast.success(r.data.message); reset(); }
    catch (ex) { toast.error(errMsg(ex)); }
  };
  const Row = ({ Icon, children }) => children ? <p className="flex items-start gap-3"><Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand" /><span>{children}</span></p> : null;
  const map = s?.googleMapsEmbedUrl?.startsWith('https://www.google.com/maps/embed') ? s.googleMapsEmbedUrl : null;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="card space-y-3 p-5 text-sm">
        <h1 className="text-2xl font-extrabold">Contact us</h1>
        <Row Icon={Phone}>{s?.phone && <a href={`tel:${s.phone}`}>{s.phone}</a>}</Row>
        <Row Icon={MessageCircle}>{s?.whatsapp && <a href={`https://wa.me/${s.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">WhatsApp {s.whatsapp}</a>}</Row>
        <Row Icon={Mail}>{s?.email}</Row>
        <Row Icon={MapPin}>{s?.address}</Row>
        <Row Icon={Clock}>{s && `Open ${s.openingTime} – ${s.closingTime}`}</Row>
        {map && <iframe title="Map" src={map} loading="lazy" className="h-56 w-full rounded-xl border-0" />}
      </div>
      <form onSubmit={handleSubmit(send)} noValidate className="card space-y-3 p-5">
        <p className="font-bold">Send us a message</p>
        <Field placeholder="Your name" error={errors.name?.message} {...register('name')} />
        <Field type="email" placeholder="Email" error={errors.email?.message} {...register('email')} />
        <Field placeholder="Phone (optional)" error={errors.phone?.message} {...register('phone')} />
        <Field as="textarea" rows={4} placeholder="How can we help?" error={errors.message?.message} {...register('message')} />
        <button disabled={isSubmitting} className="btn-gold w-full">{isSubmitting ? 'Sending...' : 'Send message'}</button>
      </form>
    </div>
  );
}
