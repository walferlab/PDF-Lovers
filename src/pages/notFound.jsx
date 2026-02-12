import { Link } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import Seo from "../components/seo";

export default function NotFound() {
  return (
    <>
      <Seo
        title="Page Not Found - PDF Lovers"
        description="The page you are looking for does not exist."
        pathname="/404"
        robots="noindex, follow"
      />
      <Navbar />
      <main className="min-h-screen pt-24 px-4 flex items-center justify-center bg-white">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-display font-bold text-black">404</h1>
          <p className="mt-2 text-sm font-display text-black/65">
            The page you requested was not found.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex rounded-lg bg-black px-4 py-2 text-sm font-display text-white hover:bg-black/85 transition"
          >
            Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
