import './App.css'
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Header from "./components/common/Header/Header.tsx";
import {HomePage} from "./pages/HomePage.tsx";

function App() {
  return (
    <Router>
        <Header />
        <Routes>
            <Route path="/" element={<HomePage />} />
            {/*<Route path="/about" element={<About />} />*/}
            {/*<Route path="/login" element={<Login />} />*/}
            {/*<Route path="/register" element={<Register />} />*/}
        </Routes>
    </Router>
  )
}

export default App
