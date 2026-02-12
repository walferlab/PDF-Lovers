import { useEffect, useMemo, useState } from "react";
import { MessageSquareWarning, MailCheck, CircleX, LoaderCircle } from "lucide-react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { supabase } from "../lib/supabaseClient";
import Seo from "../components/seo";

const REQUEST_COOLDOWN_MS = 3 * 60 * 60 * 1000;
const LAST_IP_KEY = "pdf_lovers_last_ip";
const COOLDOWN_KEY_PREFIX = "pdf_lovers_request_cooldown_until_";
const MAX_TITLE_LENGTH = 180;
const MAX_AUTHOR_LENGTH = 120;
const MAX_DESC_LENGTH = 1000;

function formatRemainingTime(ms) {
  const totalMinutes = Math.ceil(ms / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function sanitizeRequestText(value, maxLength) {
  const withoutControlChars = Array.from(String(value || ""))
    .map((char) => {
      const code = char.charCodeAt(0);
      return (code >= 0 && code <= 31) || code === 127 ? " " : char;
    })
    .join("");

  const cleaned = withoutControlChars
    .replace(/\s+/g, " ")
    .trim();

  return cleaned.slice(0, maxLength);
}

async function getClientIdentifier() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch("https://api.ipify.org?format=json", {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error("Unable to fetch IP.");
    const data = await res.json();
    if (!data?.ip) throw new Error("IP missing in response.");

    localStorage.setItem(LAST_IP_KEY, data.ip);
    return data.ip;
  } catch {
    return "";
  }
}

function getCooldownStorageKey(identifier) {
  return `${COOLDOWN_KEY_PREFIX}${identifier}`;
}

function RequestInput({
  title,
  author,
  desc,
  setTitle,
  setAuthor,
  setDesc,
  sendRequest,
  isSubmitting,
  isCoolingDown,
  cooldownText,
}) {
  const isButtonDisabled = isSubmitting || isCoolingDown;

  return (
    <div className="w-full max-w-md bg-white border border-black/50 rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="text-center space-y-2">
        <p className="text-2xl font-display font-black text-black flex justify-center items-center gap-2">
          <MessageSquareWarning strokeWidth={2.5} className="text-[#fa003f]" />
          Request a PDF
        </p>

        <p className="text-sm text-black/50 font-display font-medium leading-relaxed">
          Tell us the name of the PDF you need, and we'll try to add it soon.
        </p>
      </div>

      <input
        type="text"
        placeholder="Title of Book or PDF"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={MAX_TITLE_LENGTH}
        className="w-full rounded-lg border border-black/30 bg-zinc-100 px-4 py-3 text-sm font-medium text-black focus:outline-none focus:ring-1 focus:ring-[#fa003f]/50 transition"
      />

      <input
        type="text"
        placeholder="Author of Book or PDF (Optional)"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        maxLength={MAX_AUTHOR_LENGTH}
        className="w-full rounded-lg border border-black/30 bg-zinc-100 px-4 py-3 text-sm font-medium text-black focus:outline-none focus:ring-1 focus:ring-[#fa003f]/50 transition"
      />

      <textarea
        placeholder="Description about Book or PDF (Optional)"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        maxLength={MAX_DESC_LENGTH}
        rows={4}
        className="w-full rounded-lg border border-black/30 bg-zinc-100 px-4 py-3 text-sm font-medium text-black focus:outline-none focus:ring-1 focus:ring-[#fa003f]/50 transition resize-none"
      />

      <div className="flex flex-col gap-2">
        <button
          onClick={sendRequest}
          disabled={isButtonDisabled}
          className={`w-full rounded-lg py-3 text-sm font-display font-semibold text-white shadow-md transition-all ${
            isButtonDisabled
              ? "bg-[#fa003f]/65 cursor-not-allowed"
              : "bg-[#fa003f] hover:bg-[#d90036] active:scale-[0.98]"
          }`}
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Sending...
            </span>
          ) : (
            "Send Request"
          )}
        </button>

        <p className="text-xs text-center text-black/45 font-medium">
          {isCoolingDown
            ? `You can send your next request in ${cooldownText}.`
            : "You can send only 1 request every 3 hours."}
        </p>
      </div>
    </div>
  );
}

function RequestSucceed() {
  return (
    <div className="w-full max-w-md bg-white border border-black/30 rounded-2xl p-6 sm:p-8 flex flex-col items-center gap-3">
      <MailCheck strokeWidth={3} className="w-10 h-10 text-green-600" />
      <p className="text-md text-black font-display font-bold text-center">
        Your request was sent successfully.
      </p>
    </div>
  );
}

function RequestFailed({ message }) {
  return (
    <div className="w-full max-w-md bg-white border border-black/30 rounded-2xl p-6 sm:p-8 flex flex-col items-center gap-3">
      <CircleX strokeWidth={3} className="w-10 h-10 text-red-500" />

      <p className="text-md text-red-500 font-display font-bold text-center">
        Request failed to send.
      </p>

      <p className="text-xs text-black/50 font-display font-medium text-center">
        {message || "Remember: You can only send 1 request every 3 hours."}
      </p>
    </div>
  );
}

export default function RequestAPdf() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [desc, setDesc] = useState("");
  const [reqStatus, setReqStatus] = useState("none");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientId, setClientId] = useState("");
  const [identityLoading, setIdentityLoading] = useState(true);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(Date.now());

  const remainingMs = Math.max(0, cooldownUntil - now);
  const isCoolingDown = remainingMs > 0;
  const cooldownText = useMemo(() => formatRemainingTime(remainingMs), [remainingMs]);

  useEffect(() => {
    if (!isCoolingDown) return;

    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [isCoolingDown]);

  useEffect(() => {
    const initIdentityAndCooldown = async () => {
      try {
        const identifier = await getClientIdentifier();
        setClientId(identifier);

        const localCooldownRaw = localStorage.getItem(getCooldownStorageKey(identifier));
        const localCooldownUntil = Number(localCooldownRaw || 0);
        if (Number.isFinite(localCooldownUntil) && localCooldownUntil > 0) {
          setCooldownUntil((prev) => Math.max(prev, localCooldownUntil));
        }

        const { data, error } = await supabase
          .from("requests")
          .select("created_at")
          .eq("user_ip", identifier)
          .order("created_at", { ascending: false })
          .limit(1);

        if (!error && data?.length) {
          const lastRequestAt = new Date(data[0].created_at).getTime();
          if (Number.isFinite(lastRequestAt)) {
            setCooldownUntil((prev) =>
              Math.max(prev, lastRequestAt + REQUEST_COOLDOWN_MS)
            );
          }
        }
      } finally {
        setIdentityLoading(false);
      }
    };

    initIdentityAndCooldown();
  }, []);

  async function sendRequest() {
    if (isSubmitting || identityLoading) return;

    const cleanTitle = sanitizeRequestText(title, MAX_TITLE_LENGTH);
    const cleanAuthor = sanitizeRequestText(author, MAX_AUTHOR_LENGTH);
    const cleanDesc = sanitizeRequestText(desc, MAX_DESC_LENGTH);

    if (cleanTitle.length < 2) {
      alert("Please enter a valid title (at least 2 characters).");
      return;
    }

    if (isCoolingDown) {
      setReqStatus("failed");
      setErrorMessage(`Please wait ${cooldownText} before sending a new request.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const identifier = clientId;
      if (!identifier) {
        setReqStatus("failed");
        setErrorMessage("Unable to identify this device right now. Please try again.");
        return;
      }

      // Re-check on submit to avoid bypass through stale UI.
      const { data: lastReq, error: lastReqError } = await supabase
        .from("requests")
        .select("created_at")
        .eq("user_ip", identifier)
        .order("created_at", { ascending: false })
        .limit(1);

      if (lastReqError) {
        setReqStatus("failed");
        setErrorMessage("Could not verify request cooldown. Please try again.");
        return;
      }

      if (lastReq?.length > 0) {
        const lastTime = new Date(lastReq[0].created_at).getTime();
        const nextAllowedAt = lastTime + REQUEST_COOLDOWN_MS;

        if (Date.now() < nextAllowedAt) {
          setCooldownUntil(nextAllowedAt);
          localStorage.setItem(getCooldownStorageKey(identifier), String(nextAllowedAt));
          setReqStatus("failed");
          setErrorMessage(
            `Please wait ${formatRemainingTime(nextAllowedAt - Date.now())} before your next request.`
          );
          return;
        }
      }

      const { error: insertError } = await supabase.from("requests").insert([
        {
          title: cleanTitle,
          author: cleanAuthor,
          description: cleanDesc,
          user_ip: identifier,
        },
      ]);

      if (insertError) {
        setReqStatus("failed");
        const msg = String(insertError.message || "");
        if (msg.toLowerCase().includes("3 hours")) {
          setErrorMessage("You can send only one request every 3 hours.");
        } else {
          setErrorMessage("Unable to submit your request right now.");
        }
        return;
      }

      setCooldownUntil(Date.now() + REQUEST_COOLDOWN_MS);
      localStorage.setItem(
        getCooldownStorageKey(identifier),
        String(Date.now() + REQUEST_COOLDOWN_MS)
      );
      setReqStatus("success");
      setTitle("");
      setAuthor("");
      setDesc("");
    } catch {
      setReqStatus("failed");
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Seo
        title="Request a PDF - PDF Lovers"
        description="Request a missing PDF title and we will review it for addition."
        pathname="/requestpdf"
        robots="noindex, follow"
      />
      <Navbar />

      <div className="w-full min-h-screen flex items-center justify-center px-4">
        {reqStatus === "none" && (
          <RequestInput
            title={title}
            desc={desc}
            author={author}
            setTitle={setTitle}
            setAuthor={setAuthor}
            setDesc={setDesc}
            sendRequest={sendRequest}
            isSubmitting={isSubmitting || identityLoading}
            isCoolingDown={isCoolingDown}
            cooldownText={cooldownText}
          />
        )}

        {reqStatus === "failed" && <RequestFailed message={errorMessage} />}

        {reqStatus === "success" && <RequestSucceed />}
      </div>
      <Footer />
    </>
  );
}
