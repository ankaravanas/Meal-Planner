import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react';
import logo from '@/assets/logo.svg';

const Auth: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleEnter = () => {
    signIn();
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={logo} alt="Meal Planner" className="h-16 w-auto" />
          </div>
          <div>
            <CardTitle className="text-2xl">Meal Planner</CardTitle>
            <CardDescription className="mt-2">
              AI-powered meal planning for nutrition professionals
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleEnter}
            className="w-full"
            size="lg"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Enter Dashboard
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-4">
            Demo mode - No login required
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
