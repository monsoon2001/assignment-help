"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Star, ArrowRight } from "lucide-react";
import Button from "@/components/ui/button";
import Textarea from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

export default function ReviewForm({
  orderId,
  helperName,
}: {
  orderId: string;
  helperName: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const labels = ["Poor", "Fair", "Good", "Great", "Exceptional"];

  async function handleSubmit() {
    if (rating === 0) {
      setError("Select a star rating to continue.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase.from("reviews").insert({
      order_id: orderId,
      rating,
      comment: comment.trim() || null,
    });

    setSubmitting(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    router.push(`/orders/${orderId}`);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-medium text-on-surface mb-2">
          Overall rating for {helperName}
        </p>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              className="cursor-pointer transition-transform hover:scale-110"
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
            >
              <Star
                size={32}
                className={
                  n <= (hover || rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-outline-variant"
                }
              />
            </button>
          ))}
          <span className="ml-2 text-sm font-semibold text-on-surface">
            {rating > 0 ? `${rating}.0 — ${labels[rating - 1]}` : "Select a rating"}
          </span>
        </div>
      </div>

      <Textarea
        label={`Share your feedback (optional) — ${comment.length}/500`}
        rows={4}
        maxLength={500}
        placeholder="What stood out about the helper's work?"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <label className="flex items-start gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-primary cursor-pointer"
        />
        <span className="text-xs text-on-surface-variant leading-relaxed">
          Display my review publicly as an anonymous verified student. Your name stays protected
          while authenticating the work.
        </span>
      </label>

      {error && <p className="text-sm text-error">{error}</p>}

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => router.push(`/orders/${orderId}`)}
          disabled={submitting}
        >
          Skip for Now
        </Button>
        <Button
          className="flex-1 sm:flex-none"
          disabled={submitting || rating === 0}
          onClick={handleSubmit}
        >
          {submitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              Submit Review <ArrowRight size={15} />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}