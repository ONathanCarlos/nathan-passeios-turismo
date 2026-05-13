import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Admin from "./pages/Admin.tsx";
import NotFound from "./pages/NotFound.tsx";
import { bootCmsCache, subscribeCmsCache } from "@/lib/cmsCache";

const queryClient = new QueryClient();

const CmsCacheBoot = ({ children }: { children: React.ReactNode }) => {
  const [, force] = useState(0);
  useEffect(() => {
    bootCmsCache();
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
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<Admin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CmsCacheBoot>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
