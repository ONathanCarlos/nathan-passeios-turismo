import { lazy, Suspense, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "./pages/Home.tsx";
import Index from "./pages/Index.tsx";
const Admin = lazy(() => import("./pages/Admin.tsx"));
const Pacotes = lazy(() => import("./pages/Pacotes.tsx"));
const PacoteDetalhes = lazy(() => import("./pages/PacoteDetalhes.tsx"));
const Avaliacao = lazy(() => import("./pages/Avaliacao.tsx"));
import NotFound from "./pages/NotFound.tsx";
import { ScrollToTopFab } from "@/components/ScrollToTopFab";
import { bootCmsCache, subscribeCmsCache } from "@/lib/cmsCache";
import { initAdminAuth } from "@/lib/adminAuth";

const queryClient = new QueryClient();

const CmsCacheBoot = ({ children }: { children: React.ReactNode }) => {
  const [, force] = useState(0);
  useEffect(() => {
    bootCmsCache();
    initAdminAuth();
    const unsub = subscribeCmsCache(() => force((x) => x + 1));
    return () => { unsub(); };
  }, []);
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <CmsCacheBoot>
        <BrowserRouter>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/passeios" element={<Index />} />
              <Route path="/pacotes" element={<Pacotes />} />
              <Route path="/pacotes/:key" element={<PacoteDetalhes />} />
              <Route path="/avaliar/:token" element={<Avaliacao />} />
              <Route path="/admin" element={<Admin />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <ScrollToTopFab />
        </BrowserRouter>
      </CmsCacheBoot>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
