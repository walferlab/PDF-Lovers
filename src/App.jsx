import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import PdfPage from "./pages/pdfPage";
import SearchPage from "./pages/searchPage";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "./analytics";

function App() {

  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pdf/:id" element={<PdfPage />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </>
  );
}

export default App;
