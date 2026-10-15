interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div className={`bg-surface border border-line rounded-xl shadow-sm ${hover ? "hover:border-primary-tint-line hover:bg-primary-tint transition-colors" : ""} ${className}`}>
      {children}
    </div>
  );
}
