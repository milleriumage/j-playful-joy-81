import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAccessVerification } from "@/hooks/useAccessVerification";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingFallback } from "@/components/LoadingFallback";
import { LanguageProvider } from "@/hooks/useLanguage";
import { useGlobalEventManager } from "@/hooks/useGlobalEventManager";
import Index from "./pages/Index";
import UserView from "./pages/UserView";
import GeneratedPage from "./pages/GeneratedPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCanceled from "./pages/PaymentCanceled";
import SecretAccess from "./pages/SecretAccess";
import NotFound from "./pages/NotFound";

import VisitorTest from "./pages/VisitorTest";
import VisitanteLivre from "./pages/VisitanteLivre";
import TestVisitanteLivre from "./pages/TestVisitanteLivre";
import MyPageTest from "./pages/MyPageTest";
import MyLay from "./pages/MyLay";
import MyListPage from "./pages/MyListPage";
import IPage from "./pages/IPage";
import UPage from "./pages/UPage";
import Signup from "./pages/Signup";

const queryClient = new QueryClient();

const App = () => {
  // Inicializar gerenciador de eventos global para evitar recarregamentos
  useGlobalEventManager();
  
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<ErrorBoundary><IPage /></ErrorBoundary>} />
                <Route path="/dashboard" element={<ErrorBoundary><Index /></ErrorBoundary>} />
                <Route path="/login" element={<ErrorBoundary><IPage /></ErrorBoundary>} />
                <Route path="/auth" element={<ErrorBoundary><IPage /></ErrorBoundary>} />
                <Route path="/signup" element={<ErrorBoundary><Signup /></ErrorBoundary>} />
                <Route path="/user/:creatorId" element={<ErrorBoundary><UserView /></ErrorBoundary>} />
                <Route path="/generated/:pageId" element={<ErrorBoundary><GeneratedPage /></ErrorBoundary>} />
                <Route path="/visitor-test" element={<ErrorBoundary><VisitorTest /></ErrorBoundary>} />
                <Route path="/visitante-livre/:userId?" element={<ErrorBoundary><VisitanteLivre /></ErrorBoundary>} />
                <Route path="/test-visitante-livre" element={<ErrorBoundary><TestVisitanteLivre /></ErrorBoundary>} />
                <Route path="/mypagetest" element={<ErrorBoundary><MyPageTest /></ErrorBoundary>} />
                <Route path="/streampanel" element={<ErrorBoundary><MyPageTest /></ErrorBoundary>} />
                <Route path="/mylay" element={<ErrorBoundary><MyLay /></ErrorBoundary>} />
                <Route path="/cleanpanel" element={<ErrorBoundary><MyLay /></ErrorBoundary>} />
                <Route path="/mylistpage" element={<ErrorBoundary><MyListPage /></ErrorBoundary>} />
                <Route path="/upage" element={<ErrorBoundary><UPage /></ErrorBoundary>} />
                <Route path="/payment-success" element={<ErrorBoundary><PaymentSuccess /></ErrorBoundary>} />
                <Route path="/payment-canceled" element={<ErrorBoundary><PaymentCanceled /></ErrorBoundary>} />
                <Route path="/secret" element={<ErrorBoundary><SecretAccess /></ErrorBoundary>} />
                <Route path="*" element={<ErrorBoundary><NotFound /></ErrorBoundary>} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </LanguageProvider>
      
    </ErrorBoundary>
  );
};

export default App;
