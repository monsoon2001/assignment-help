import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

const publicMenuItems = [
  { label: "Browse Helpers", href: "/browse-helpers" },
  { label: "Services", href: "/services" },
  { label: "Subjects", href: "/subjects" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header showSearch={false} menuItems={publicMenuItems} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
