import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/public/Home";

function Events() {
  return (
    <main className="min-h-[70vh] p-10">
      <h1 className="text-3xl font-bold text-gray-900">
        Events
      </h1>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;