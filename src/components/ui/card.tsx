interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div className={`bg-surface-container-lowest rounded-xl shadow-sm ${hover ? "hover:shadow-md transition-shadow" : ""} ${className}`}>
      {children}
    </div>
  );
}
