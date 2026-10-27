import Link from "next/link";
import { MaterialIcon } from "@/lib/icons-map";

const footerLinks = {
  Platform: [
    { label: "Request Help", href: "/requests/new" },
    { label: "Services", href: "/services" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Subjects", href: "/subjects" },
    { label: "Resources", href: "/resources" },
    { label: "Pricing", href: "/#estimate" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/faq" },
  ],
  Legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Refund Policy", href: "/refund-policy" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-ink-900 border-t border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 sm:gap-x-10 gap-y-8 items-start">
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                <MaterialIcon name="school" size={18} className="text-on-primary" />
              </div>
              <span className="font-display font-bold text-xl text-white">Acadivo</span>
            </Link>
            <p className="text-sm on-band-muted leading-relaxed max-w-md">
              Connect with verified peer helpers for academic guidance and support across all
              subjects.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div
              key={category}
              className={category === "Legal" ? "col-span-2 sm:col-span-2 lg:col-span-1" : ""}
            >
              <h3 className="font-semibold text-white text-sm mb-3">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm on-band-muted">
              &copy; {new Date().getFullYear()} Acadivo. All rights reserved.
            </p>
            <p className="text-xs on-band-muted text-center md:text-right max-w-md">
              Acadivo is an academic peer guidance platform. All helpers provide guidance and
              tutoring — they do not complete assignments on behalf of students.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
