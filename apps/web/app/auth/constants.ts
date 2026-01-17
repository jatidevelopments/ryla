import { Variants } from 'framer-motion';

export type AuthMode = 'email' | 'login' | 'register';

export interface LoginFormData {
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  name: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}

// Animation variants
export const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
};

export const slideIn: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.3, ease: [0.4, 0, 1, 1] },
  },
};

