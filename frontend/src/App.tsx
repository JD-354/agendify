import './App.css'
import { BrowserRouter as Router, Routes, Route,} from 'react-router-dom';
import Principal from './pages/Principal';
import Navbar from './components/NavBar'
import Auth from './pages/Auth'
function App() {


  return (
    <Router>
      <Navbar />
      <Routes>
        
        <Route path="/" element={<Auth />} />
        <Route path="/events" element={<Principal />} />
      
      </Routes>
    </Router>
  );
}

export default App
