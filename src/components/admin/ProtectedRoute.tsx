import { useAuth } from '@/context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const ProtectedRoute = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen bg-background">
            <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center space-x-2">
                    <img src="/logo.png" alt="Logo" className="h-12 w-auto block dark:hidden" />
                    <img src="/logo_darkmode.png" alt="Logo" className="h-12 w-auto hidden dark:block" />
                </div>
                <p className="text-muted-foreground">Vérification de la session...</p>
            </div>
        </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;