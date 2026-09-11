import Link from "next/link";

const footerLinks = {
  Platform: [
    { label: "Browse Helpers", href: "/browse-helpers" },
    { label: "Services", href: "/services" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Subjects", href: "/subjects" },
    { label: "Pricing", href: "/#pricing" },
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
    <footer className="bg-surface-container-high border-t border-outline-variant/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-10 items-start">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-container rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-lg">school</span>
              </div>
              <span className="font-display font-bold text-xl text-on-surface">PeerCraft</span>
            </Link>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Connect with verified peer helpers for academic guidance and support across all subjects.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className={category === "Legal" ? "sm:col-span-2 lg:col-span-1" : ""}>
              <h3 className="font-semibold text-on-surface text-sm mb-3">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-on-surface-variant hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-outline-variant/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-on-surface-variant">
              &copy; {new Date().getFullYear()} PeerCraft. All rights reserved.
            </p>
            <p className="text-xs text-on-surface-variant text-center md:text-right max-w-md">
              PeerCraft is an academic peer guidance platform. All helpers provide guidance and tutoring
              — they do not complete assignments on behalf of students.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
