import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import PdfPage from "./pages/pdfPage";
import SearchPage from "./pages/searchPage";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "./analytics";
import RequestAPdf from "./pages/RequestAPdf";
import Categories from "./pages/categories";
import CategoryPage from "./pages/categoryPage";
import TrendingPdfs from "./pages/trendingPdfs";
import PopularPdfs from "./pages/popularPdfs";
import PrivacyPolicy from "./pages/privacyPolicy";
import NotFound from "./pages/notFound";

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
        <Route path="/trending-pdfs" element={<TrendingPdfs />} />
        <Route path="/popular-pdfs" element={<PopularPdfs />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/requestpdf" element={<RequestAPdf />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
