import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-white/85">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-3 text-sm sm:flex-row">
        <p className="font-display">
          &copy; 2026{" "}
          <span className="font-brand text-base font-medium text-white">
            PDF Lovers
          </span>
          . All Rights Reserved.
        </p>
        <Link
          to="/privacy-policy"
          className="font-display text-white/70 transition hover:text-white"
        >
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
