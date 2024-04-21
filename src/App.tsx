import './App.css'
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Header from "./components/common/Header/Header.tsx";
import HeroSection from "./components/layout/HeroSection/HeroSection.tsx";

function App() {
  return (
    <Router>
        <Header />
        <Routes>
            <Route path="/" element={<HeroSection />} />
            {/*<Route path="/about" element={<About />} />*/}
            {/*<Route path="/login" element={<Login />} />*/}
            {/*<Route path="/register" element={<Register />} />*/}
        </Routes>
    </Router>
  )
}

export default App
