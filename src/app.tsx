import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Scan from "./pages/Scan";
import Wallet from "./pages/Wallet";
import Leaderboard from "./pages/Leaderboard";
import Impact from "./pages/Impact";
import Admin from "./pages/Admin";
import Guard from "./auth/Guard";
import Nav from "./components/Nav";
import Redeem from "./pages/Redeem";
import QRGenerator from "./pages/QRGenerator";
import { DEVQR_ENABLED } from "./utils/flags";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}

function Shell() {
  const loc = useLocation();
  const hideNav = ["/login","/signup"].includes(loc.pathname);
  return (
    <div className="min-h-screen">
      {!hideNav && <Nav />}
      <main className="container py-6">
        <ErrorBoundary>
          <Routes>
            {DEVQR_ENABLED && <Route path="/dev/qr" element={<QRGenerator />}/>}
            <Route path="/" element={<Wallet />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/scan" element={<Guard><Scan /></Guard>} />
            <Route path="/leaderboard" element={<Guard><Leaderboard /></Guard>} />
            <Route path="/impact" element={<Guard><Impact /></Guard>} />
            <Route path="/admin" element={<Guard role="admin"><Admin /></Guard>} />
            <Route path="*" element={<div>Not Found. <Link className='link' to='/'>Go Home</Link></div>} />
            <Route path="/redeem" element={<Redeem />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  );
}
