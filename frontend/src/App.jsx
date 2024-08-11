import React, { useEffect, useState, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useAuth } from './contexts/AuthContext';
import CustomNavbar from "./components/Navbar";
import Home from "./pages/Home";
import GroupDetail from "./pages/GroupDetail";
import BoyGroups from "./pages/BoyGroups";
import GirlGroups from "./pages/GirlGroups";
import MaleSoloists from "./pages/MaleSoloists";
import FemaleSoloists from "./pages/FemaleSoloists";
import SearchResults from "./pages/SearchResults";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import AddGroupForm from "./pages/AddGroupForm";
import AddSoloistForm from "./pages/AddSoloistForm";
import AddMemberForm from "./pages/AddMemberForm";
import EditGroupForm from "./pages/EditGroupForm";
import EditSoloistForm from "./pages/EditSoloistForm";
import AdminRoute from './components/AdminRoute';
import SoloistDetail from './pages/SoloistDetail';
import EditMembersPage from './pages/EditMembersPage';
import EditMemberForm from "./pages/EditMemberForm";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import NotFound from './pages/NotFound';
import Footer from "./components/Footer";
import Spinner from "./components/Spinner";
import { getGroupById, getSoloistById } from './services/api';

function AppContent() {
  const { loading } = useAuth();
  
  const PageTitle = () => {
    const location = useLocation();
    const params = useParams();
    const [specificTitle, setSpecificTitle] = useState("");

    useEffect(() => {
      const fetchSpecificTitle = async () => {
        if (location.pathname.startsWith('/group/') || location.pathname.startsWith('/soloist/')) {
          try {
            let response;
            if (location.pathname.startsWith('/group/')) {
              response = await getGroupById(params.id);
              setSpecificTitle(response.data.name);
            } else {
              response = await getSoloistById(params.id);
              setSpecificTitle(response.data.stageName || response.data.name);
            }
            console.log('Dati ricevuti:', response.data);
          } catch (error) {
            console.error('Errore nel recupero del nome:', error);
            setSpecificTitle(''); // Imposta un titolo predefinito o vuoto in caso di errore
          }
        } else {
          setSpecificTitle('');
        }
      };

      if (params.id) {
        fetchSpecificTitle();
      } else {
        setSpecificTitle('');
      }
    }, [location, params]);

    const getTitle = () => {
      switch(location.pathname) {
        case '/':
          return 'Home - KSpot';
        case '/boy-groups':
          return 'Boy Groups - KSpot';
        case '/girl-groups':
          return 'Girl Groups - KSpot';
        case '/male-soloists':
          return 'Male Soloists - KSpot';
        case '/female-soloists':
          return 'Female Soloists - KSpot';
        case '/search':
          return 'Risultati Ricerca - KSpot';
        case '/register':
          return 'Registrazione - KSpot';
        case '/login':
          return 'Accesso - KSpot';
        case '/profile':
          return 'Profilo - KSpot';
        case '/admin':
          return 'Dashboard Admin - KSpot';
        default:
          if ((location.pathname.startsWith('/group/') || location.pathname.startsWith('/soloist/')) && specificTitle) {
            return `${specificTitle} - KSpot`;
          }
          return 'KSpot';
      }
    };

    return (
      <Helmet>
        <title>{getTitle()}</title>
      </Helmet>
    );
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="app-container">
      <PageTitle />
      <div className="background"></div>
      <div className="content">
        <CustomNavbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/group/:id" element={<GroupDetail />} />
          <Route path="/soloist/:id" element={<SoloistDetail />} />
          <Route path="/boy-groups" element={<BoyGroups />} />
          <Route path="/girl-groups" element={<GirlGroups />} />
          <Route path="/male-soloists" element={<MaleSoloists />} />
          <Route path="/female-soloists" element={<FemaleSoloists />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/add-group/:type" element={<AddGroupForm />} />
            <Route path="/admin/add-soloist/:gender" element={<AddSoloistForm />} />
            <Route path="/admin/add-member/:groupId" element={<AddMemberForm />} />
            <Route path="/admin/edit-group/:id" element={<EditGroupForm />} />
            <Route path="/admin/edit-soloist/:id" element={<EditSoloistForm />} />
            <Route path="/admin/edit-members/:groupId" element={<EditMembersPage />} />
            <Route path="/admin/edit-member/:groupId/:memberId" element={<EditMemberForm />} />
          </Route>
          <Route path="/notfound" element={<NotFound />} />
          <Route path="*" element={<div style={{color:'white'}}>404 Non Trovato</div>} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Suspense fallback={<Spinner />}>
        <AppContent />
      </Suspense>
    </Router>
  );
}

export default App;