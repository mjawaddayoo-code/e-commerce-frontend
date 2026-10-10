import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../services/api';
import Field from '../components/Field';
import { loginSchema, registerSchema } from '../utils/schemas';

export default function Auth({ mode }) {
  const isReg = mode === 'register';
  const { login, register: signUp } = useAuth();
  const nav = useNavigate();
  const { state } = useLocation();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(isReg ? registerSchema : loginSchema) });
  document.title = isReg ? 'Create account' : 'Login';

  const onSubmit = async (v) => {
    try {
      if (isReg) await signUp({ name: v.name, email: v.email, password: v.password, ...(v.phone && { phone: v.phone }) });
      else await login(v.email, v.password);
      nav(state?.from || '/', { replace: true });
    } catch (err) { toast.error(errMsg(err)); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="card mx-auto max-w-sm space-y-3 p-6">
      <h1 className="text-2xl font-extrabold">{isReg ? 'Create account' : 'Welcome back'}</h1>
      {isReg && <Field placeholder="Full name" autoComplete="name" error={errors.name?.message} {...register('name')} />}
      <Field type="email" placeholder="Email" autoComplete="email" error={errors.email?.message} {...register('email')} />
      {isReg && <Field placeholder="Phone (03XXXXXXXXX, optional)" inputMode="tel" error={errors.phone?.message} {...register('phone')} />}
      <Field type="password" placeholder="Password" autoComplete={isReg ? 'new-password' : 'current-password'} error={errors.password?.message} {...register('password')} />
      {!isReg && <Link to="/forgot-password" className="block text-right text-sm text-brand">Forgot password?</Link>}
      <button disabled={isSubmitting} className="btn-gold w-full">{isSubmitting ? 'Please wait...' : isReg ? 'Sign up' : 'Login'}</button>
      <p className="text-center text-sm text-slate-500">{isReg ? 'Have an account?' : 'New here?'} <Link className="font-semibold text-brand" to={isReg ? '/login' : '/register'} state={state}>{isReg ? 'Login' : 'Create one'}</Link></p>
    </form>
  );
}
