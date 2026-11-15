import { WHATSAPP_NUMBER, WHATSAPP_DEFAULT_MESSAGE } from "@/lib/constants";

export default function WhatsAppButton() {
  const number = WHATSAPP_NUMBER;
  const message = encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE);
  const href = `https://wa.me/${number}?text=${message}`;

  return (
    <div className="acadivo-wa-container group fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 flex items-center">
      <style>{`
        @keyframes acadivo-wa-gentle-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .acadivo-wa-container {
          animation: acadivo-wa-gentle-bounce 3.2s ease-in-out infinite;
        }
        .acadivo-wa-container:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .acadivo-wa-container { animation: none; }
        }
      `}</style>

      {/* Pill label on desktop/tablet, hidden on mobile */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-md px-4 py-2 text-xs sm:text-sm font-semibold text-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-slate-200/80 mr-3 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_6px_24px_rgba(0,0,0,0.14)] group-hover:border-emerald-300/80 group-hover:text-emerald-700 cursor-pointer select-none"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        Send task in WhatsApp directly
      </a>

      {/* WhatsApp Action Button */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Acadivo on WhatsApp"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white shadow-[0_8px_28px_rgba(37,211,102,0.45)] ring-4 ring-[#25D366]/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_12px_36px_rgba(37,211,102,0.65)] focus:outline-none focus-visible:ring-[#25D366]/60"
      >
        <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-[#25D366]/30 [animation-duration:2.5s]" />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-7 w-7 transition-transform duration-300 group-hover:scale-105"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
        </svg>
      </a>
    </div>
  );
}
