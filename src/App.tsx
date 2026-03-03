import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientFormEnhanced from "./pages/ClientFormEnhanced";
import ClientProfile from "./pages/ClientProfile";
import AIPromptManagement from "./pages/AIPromptManagement";
import MealPlans from "./pages/MealPlans";
import MealPlanWizard from "./pages/MealPlanWizard";
import PublicMealPlan from "./pages/PublicMealPlan";
import Settings from "./pages/Settings";
import Recipes from "./pages/Recipes";
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/plan/:shareToken" element={<PublicMealPlan />} />
            
            {/* Protected routes - require admin authentication */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/clients" element={
              <ProtectedRoute>
                <Clients />
              </ProtectedRoute>
            } />
            <Route path="/clients/new" element={
              <ProtectedRoute>
                <ClientFormEnhanced />
              </ProtectedRoute>
            } />
            <Route path="/clients/:id" element={
              <ProtectedRoute>
                <ClientProfile />
              </ProtectedRoute>
            } />
            <Route path="/clients/:id/edit" element={
              <ProtectedRoute>
                <ClientFormEnhanced />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/settings/ai-prompts" element={
              <ProtectedRoute>
                <AIPromptManagement />
              </ProtectedRoute>
            } />
            <Route path="/meal-plans" element={
              <ProtectedRoute>
                <MealPlans />
              </ProtectedRoute>
            } />
            <Route path="/meal-plans/new" element={
              <ProtectedRoute>
                <MealPlanWizard />
              </ProtectedRoute>
            } />
            <Route path="/meal-plans/edit/:id" element={
              <ProtectedRoute>
                <MealPlanWizard />
              </ProtectedRoute>
            } />
            <Route path="/recipes" element={
              <ProtectedRoute>
                <Recipes />
              </ProtectedRoute>
            } />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
