import { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';

type Props = PropsWithChildren<{ role?: 'admin' }>

export default function Guard({ children, role }: Props) {
  const token = localStorage.getItem('token');
  const raw = localStorage.getItem('user');
  const user = raw ? JSON.parse(raw) : null;

  if (!token) return <Navigate to="/login" replace />;
  if (role === 'admin' && user?.role !== 'admin') return <Navigate to="/" replace />;

  return <>{children}</>;
}
