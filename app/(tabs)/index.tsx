import { useAuth } from '@/contexts/AuthContext';
import { AuxiliarDashboard } from '@/features/dashboard/AuxiliarDashboard';
import { ParentDashboard } from '@/features/dashboard/ParentDashboard';

export default function DashboardScreen() {
  const { user } = useAuth();
  if (!user) return null;
  return user.role === 'auxiliar' ? <AuxiliarDashboard /> : <ParentDashboard />;
}
