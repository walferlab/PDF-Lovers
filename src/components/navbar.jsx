import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Flame, FolderOpen, Menu, Trophy, X } from "lucide-react";
import Logo from "../assets/logo.svg";

const MAIN_LINKS = [
  { label: "Home", to: "/" },
  { label: "Trending PDFs", to: "/trending-pdfs", icon: Flame },
  { label: "Popular PDFs", to: "/popular-pdfs", icon: Trophy },
  { label: "Categories", to: "/categories", icon: FolderOpen },
];
const ADS_NOTICE =
  "We are sorry for any inappropriate ads. They help us keep this website running and resources free.";
const ADS_NOTICE_DISMISSED_KEY = "pdf_lovers_ads_notice_dismissed";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpenPath, setMenuOpenPath] = useState(null);
  const menuOpen = menuOpenPath === location.pathname;
  const [showAdsNotice, setShowAdsNotice] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(ADS_NOTICE_DISMISSED_KEY) !== "1";
  });

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const linkClass = ({ isActive }) =>
    `px-2 py-1.5 rounded-md transition ${
      isActive ? "text-black" : "text-black/65 hover:text-black"
    }`;

  const navigateTo = (to) => {
    setMenuOpenPath(null);
    navigate(to);
  };

  const dismissAdsNotice = () => {
    setShowAdsNotice(false);
    localStorage.setItem(ADS_NOTICE_DISMISSED_KEY, "1");
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-black/5 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-3 sm:px-4 md:px-6">
          <button
            type="button"
            className="flex items-center gap-1.5"
            onClick={() => navigateTo("/")}
            aria-label="Go to home"
          >
            <img src={Logo} alt="PDF Lovers Logo" className="h-8 w-8" />
            <span className="text-2xl font-brand font-black text-black">
              PDF <span className="font-medium text-red-500">Lovers</span>
            </span>
          </button>

          <nav className="hidden items-center gap-1 text-sm font-display font-medium md:flex">
            {MAIN_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={(state) =>
                  `${linkClass(state)} inline-flex items-center gap-1.5`
                }
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                <span>{item.label}</span>
              </NavLink>
            ))}
            <button
              type="button"
              className="ml-1 rounded-lg bg-black px-3 py-2 text-white transition hover:bg-black/90"
              onClick={() => navigateTo("/requestpdf")}
            >
              Request a PDF?
            </button>
          </nav>

          <button
            type="button"
            className="rounded-md p-2 text-black/75 transition hover:bg-black/5 md:hidden"
            onClick={() =>
              setMenuOpenPath((prev) => (prev === location.pathname ? null : location.pathname))
            }
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X strokeWidth={2.5} /> : <Menu strokeWidth={2.5} />}
          </button>
        </div>
      </header>

      {showAdsNotice && (
        <div className="fixed inset-x-0 top-16 z-45 border-b border-black/10 bg-amber-50/95 px-3 py-1 text-[11px] leading-tight text-black/70 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-2">
            <p className="font-display text-xs sm:text-sm font-semibold text-amber-900">
              {ADS_NOTICE}
            </p>
            <button
              type="button"
              onClick={dismissAdsNotice}
              aria-label="Dismiss notice"
              className="shrink-0 rounded p-0.5 text-amber-900/80 transition hover:bg-amber-100 hover:text-amber-950"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-16 md:hidden">
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-2 px-4 py-6">
            {MAIN_LINKS.map((item) => (
              <button
                key={item.to}
                type="button"
                className="w-full rounded-lg px-3 py-3 text-left text-lg font-display font-medium text-black/75 hover:bg-black/5 hover:text-black inline-flex items-center gap-2"
                onClick={() => navigateTo(item.to)}
              >
                {item.icon && <item.icon className="h-5 w-5" />}
                <span>{item.label}</span>
              </button>
            ))}
            <button
              type="button"
              className="mt-2 w-max rounded-lg bg-black px-5 py-2.5 text-lg font-display font-medium text-white hover:bg-black/90"
              onClick={() => navigateTo("/requestpdf")}
            >
              Request a PDF?
            </button>
          </div>
        </div>
      )}
    </>
  );
}
