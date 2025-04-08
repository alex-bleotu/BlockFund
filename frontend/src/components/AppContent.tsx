import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Navbar } from './Navbar';
import { Home } from '../pages/home/Home';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Settings } from '../pages/Settings';
import { NewFund } from '../pages/fund/New';
import { EditFund } from '../pages/fund/Edit';
import { Campaigns } from '../pages/Campaigns';
import { MyCampaigns } from '../pages/MyCampaigns';
import { CampaignDetails } from '../pages/CampaignDetails';
import { About } from '../pages/About';
import { Contact } from '../pages/Contact';
import { Footer } from "./Footer";

export function AppContent() {
  const { theme } = useTheme();
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isFundPage = ['/fund/new', '/fund/edit'].some(path => location.pathname.startsWith(path));

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      {!isAuthPage && !isFundPage && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/fund/new" element={<NewFund />} />
        <Route path="/fund/edit/:id" element={<EditFund />} />
        <Route path="/fundings" element={<Campaigns />} />
        <Route path="/my-campaigns" element={<MyCampaigns />} />
        <Route path="/campaign/:id" element={<CampaignDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      {!isAuthPage && !isFundPage && <Footer />}
    </div>
  );
}