import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./components/auth/LoginPage";
import NewStudentDashboard from "./components/dashboard/NewStudentDashboard";
import NewTeacherDashboard from "./components/dashboard/NewTeacherDashboard";
import AssessmentInterface from "./components/assessment/AssessmentInterface";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/student/dashboard" element={<NewStudentDashboard />} />
            <Route path="/teacher/dashboard" element={<NewTeacherDashboard />} />
            <Route path="/assessment" element={<AssessmentInterface />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
