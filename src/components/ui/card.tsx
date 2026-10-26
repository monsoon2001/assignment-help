interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div className={`site-card bg-surface border border-line rounded-2xl shadow-sm ${hover ? "hover:border-primary-tint-line hover:shadow-md transition-all duration-200" : ""} ${className}`}>
      {children}
    </div>
  );
}
