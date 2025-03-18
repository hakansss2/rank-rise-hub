
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { OrderProvider } from "@/context/OrderContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BoosterPanel from "./pages/BoosterPanel";
import AdminPanel from "./pages/AdminPanel";
import OrderDetails from "./pages/OrderDetails";
import NotFound from "./pages/NotFound";
import Balance from "./pages/Balance";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <OrderProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/booster" element={<BoosterPanel />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/order/:id" element={<OrderDetails />} />
              <Route path="/ranks" element={<Index />} />
              <Route path="/balance" element={<Balance />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </OrderProvider>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
