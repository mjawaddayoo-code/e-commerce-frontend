import { z } from 'zod';

export const phone = z.string().regex(/^(\+92|0)?3\d{9}$/, 'Enter a valid mobile number (03XXXXXXXXX)');
export const email = z.string().min(1, 'Email is required').email('Enter a valid email');

export const loginSchema = z.object({ email, password: z.string().min(1, 'Password is required') });
export const registerSchema = z.object({
  name: z.string().min(2, 'Enter your full name'), email,
  phone: phone.or(z.literal('')).optional(), password: z.string().min(8, 'Password must be at least 8 characters'),
});
export const contactSchema = z.object({
  name: z.string().min(2, 'Enter your name'), email, phone: z.string().max(20).optional(),
  message: z.string().min(10, 'Message is too short (10+ characters)').max(2000),
});
export const checkoutSchema = z.object({
  name: z.string().min(2, 'Enter your full name'), phone, email,
  area: z.string().min(2, 'Area is required'), city: z.string().min(2, 'City is required'),
  street: z.string().min(5, 'Enter your full street address'),
  landmark: z.string().optional(), instructions: z.string().max(300, 'Keep it under 300 characters').optional(),
});
