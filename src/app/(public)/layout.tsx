import Header, { type MenuGroup, type MenuItem } from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { SUBJECT_CONTENT } from "@/lib/subject-content";
import { SERVICE_GROUPS } from "@/lib/services";
import {
  ALL_RESOURCES,
  RESOURCE_CATEGORIES,
  guidesByCategory,
  resourcePath,
} from "@/lib/resources";

// Splits a flat list into `columns` balanced chunks so a mega-menu column is
// never far longer than its neighbour.
function chunk<T>(items: T[], columns: number): T[][] {
  const size = Math.ceil(items.length / columns);
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
  return result;
}

const servicesGroups: MenuGroup[] = SERVICE_GROUPS.map((group) => ({
  title: group.title,
  href: `/services#${group.id}`,
  items: group.services.map((service) => ({
    label: service.name,
    href: `/services/${service.slug}`,
  })),
}));

const subjectGroups: MenuGroup[] = chunk(SUBJECT_CONTENT, 3).map((subjects) => ({
  items: subjects.map((subject) => ({
    label: subject.name,
    href: `/subjects/${subject.slug}`,
  })),
}));

const resourcesGroups: MenuGroup[] = [
  {
    title: "Categories",
    href: "/resources",
    items: RESOURCE_CATEGORIES.map((category) => ({
      label: category.name,
      href: `/resources/${category.slug}`,
      meta: `${guidesByCategory(category.slug).length}`,
    })),
  },
  {
    title: "All guides",
    href: "/resources",
    items: ALL_RESOURCES.map((guide) => ({
      label: guide.title,
      href: resourcePath(guide),
    })),
  },
];

const publicMenuItems: MenuItem[] = [
  { label: "Browse Helpers", href: "/browse-helpers" },
  { label: "Services", href: "/services", groups: servicesGroups },
  { label: "Subjects", href: "/subjects", groups: subjectGroups },
  { label: "Resources", href: "/resources", groups: resourcesGroups },
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