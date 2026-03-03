import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import logo from '@/assets/logo.svg';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect based on auth status
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <div className="container max-w-4xl mx-auto text-center">
        <div className="flex justify-center mb-8">
          <img src={logo} alt="Meal Planner" className="h-20 w-auto" />
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
          Meal Plan Generator
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          AI-powered meal planning system for nutrition professionals
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Flexible Plans</CardTitle>
              <CardDescription>
                Programs with multiple options per meal category
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Structured Plans</CardTitle>
              <CardDescription>
                Daily meal programs with specific meals per day
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => navigate('/auth')}
            className="text-lg px-8 py-6"
          >
            Admin Login
          </Button>
        </div>

        <div className="mt-12 text-sm text-muted-foreground">
          <p>Demo application for nutrition professionals</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
