import { Home, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <p className="text-6xl font-display font-bold text-primary mb-2">404</p>
        <h1 className="font-display text-2xl font-bold text-on-surface mb-2">Page not found</h1>
        <p className="text-base text-on-surface-variant leading-relaxed mb-6">
          The page you are looking for does not exist or has moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button href="/" variant="primary" size="md">
            <Home className="w-4 h-4" />
            Go home
          </Button>
          <Button href="/contact" variant="secondary" size="md">
            <ArrowLeft className="w-4 h-4" />
            Contact us
          </Button>
        </div>
      </div>
    </div>
  );
}
