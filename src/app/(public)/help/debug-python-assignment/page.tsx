import Link from "next/link";
import { PageHeader } from "@/components/marketing/page-shell";

export const metadata = {
  title: "How to Debug a Python Assignment | Acadivo",
  description:
    "A practical guide to debugging Python assignments: read the traceback, isolate the bug, use breakpoints and tests, and fix common errors step by step.",
  alternates: { canonical: "https://acadivo.com/help/debug-python-assignment" },
};

const COMMON_ERRORS = [
  {
    error: "SyntaxError",
    cause:
      "Python can't parse the line — a missing colon, an unclosed bracket, or a stray indentation.",
    fix: "Check the line the traceback points to and the line just above it; indentation and brackets are the usual culprits.",
  },
  {
    error: "NameError",
    cause:
      "You used a variable or function that hasn't been defined yet (often a typo or an out-of-scope name).",
    fix: "Confirm the spelling and that the name is defined before it's used, in the same scope.",
  },
  {
    error: "TypeError",
    cause:
      "An operation got the wrong type — e.g. adding a str to an int, or calling something that isn't a function.",
    fix: "Print the value and type() of each operand right before the failing line.",
  },
  {
    error: "IndexError",
    cause: "You indexed past the end of a list or string.",
    fix: "Check the length with len() and remember indexes run 0..len-1.",
  },
  {
    error: "KeyError",
    cause: "A dictionary key you asked for doesn't exist.",
    fix: "Use .get() with a default, or check `key in my_dict` before accessing.",
  },
  {
    error: "AttributeError",
    cause: "You called a method or attribute that the object doesn't have.",
    fix: "Inspect the object with dir() and confirm you're using the right type.",
  },
];

export default function DebugPythonPage() {
  return (
    <>
      <PageHeader
        title="How to Debug a Python Assignment"
        subtitle="Practical, beginner-friendly steps to find and fix bugs in your Python code."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Help" },
          { label: "Debug a Python Assignment" },
        ]}
      />
      <div className="band-soft">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <p className="text-lg text-on-surface-variant leading-relaxed mb-10">
            Debugging isn&apos;t guesswork — it&apos;s a repeatable process. Start from the error
            Python already gave you, narrow it down to the smallest failing piece, then fix one
            thing at a time. Here&apos;s how to work through it without losing an evening.
          </p>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-on-surface mb-4">
              1. Read the traceback first
            </h2>
            <p className="text-on-surface-variant leading-relaxed mb-4">
              Python tells you where it broke. Read the traceback{" "}
              <strong>from the bottom up</strong>: the last line is the error type and message, and
              the line just above it is the exact file and line number where the failure happened.
              In your own code, that&apos;s almost always the place to look.
            </p>
            <p className="text-on-surface-variant leading-relaxed">
              If the traceback only points into library code, scan upward for the first line
              that&apos;s yours — that&apos;s where the bad input came from.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-on-surface mb-4">
              2. Reproduce it in isolation
            </h2>
            <p className="text-on-surface-variant leading-relaxed mb-4">
              Copy the smallest slice of code that still fails into a fresh file and run it. A bug
              you can reproduce in ten lines is far easier to fix than one buried in a 300-line
              script. If the small version works, add the surrounding code back until it breaks —
              the last thing you added is usually the cause.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-on-surface mb-4">
              3. What the common errors mean
            </h2>
            <p className="text-on-surface-variant leading-relaxed mb-4">
              The error type is a strong hint. These are the ones you&apos;ll hit most often in
              coursework:
            </p>
            <div className="space-y-3">
              {COMMON_ERRORS.map((item) => (
                <div
                  key={item.error}
                  className="bg-white rounded-xl border border-outline-variant/30 p-5"
                >
                  <p className="font-mono text-sm font-semibold text-primary mb-1.5">
                    {item.error}
                  </p>
                  <p className="text-on-surface-variant leading-relaxed mb-1.5">{item.cause}</p>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    <span className="font-semibold text-on-surface">Fix: </span>
                    {item.fix}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-on-surface mb-4">
              4. Print, then use a debugger
            </h2>
            <p className="text-on-surface-variant leading-relaxed mb-4">
              Printing values is the fastest way to see what your code actually does versus what you
              assumed. Print the inputs and the result right before the line that fails:
            </p>
            <pre className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-4 overflow-x-auto text-sm mb-4">
              <code>{`print(type(data), data)   # confirm what you're actually working with`}</code>
            </pre>
            <p className="text-on-surface-variant leading-relaxed mb-4">
              When that isn&apos;t enough, drop into an interactive debugger. Add{" "}
              <code className="font-mono text-sm bg-primary-fixed/60 rounded px-1.5 py-0.5">
                breakpoint()
              </code>{" "}
              on the line before the problem and run the script — Python pauses there so you can
              inspect variables, step line by line, and watch values change at runtime.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-on-surface mb-4">
              5. Test small pieces
            </h2>
            <p className="text-on-surface-variant leading-relaxed mb-4">
              Break the assignment into functions and check each one in isolation. A quick assertion
              catches most off-by-one and logic errors before they spread:
            </p>
            <pre className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-4 overflow-x-auto text-sm mb-4">
              <code>{`assert average([2, 4, 6]) == 4, "expected 4"`}</code>
            </pre>
            <p className="text-on-surface-variant leading-relaxed">
              For anything larger, write a couple of test cases with{" "}
              <code className="font-mono text-sm bg-primary-fixed/60 rounded px-1.5 py-0.5">
                pytest
              </code>{" "}
              and run them after each change. A passing test is proof the fix worked — and the bug
              stayed fixed.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-on-surface mb-4">
              6. A worked example
            </h2>
            <p className="text-on-surface-variant leading-relaxed mb-4">
              A classic: removing items while looping.
            </p>
            <pre className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-4 overflow-x-auto text-sm mb-4">
              <code>{`nums = [1, 2, 3, 4]
for n in nums:
    if n % 2 == 0:
        nums.remove(n)   # skips elements as the list shrinks

print(nums)  # [1, 3] — but 4 was never checked`}</code>
            </pre>
            <p className="text-on-surface-variant leading-relaxed">
              Mutating a list while iterating over it changes the indexes underneath the loop. Build
              a new list instead (
              <code className="font-mono text-sm bg-primary-fixed/60 rounded px-1.5 py-0.5">
                [n for n in nums if n % 2 != 0]
              </code>
              ) or iterate over a copy with{" "}
              <code className="font-mono text-sm bg-primary-fixed/60 rounded px-1.5 py-0.5">
                for n in list(nums):
              </code>
              .
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-on-surface mb-4">
              7. Still stuck?
            </h2>
            <p className="text-on-surface-variant leading-relaxed mb-4">
              If you&apos;ve read the traceback, isolated the failing piece, and it still won&apos;t
              budge, it helps to talk it through. Share your code and the exact error in a request,
              and a Python tutor can walk you through the reasoning instead of just handing you an
              answer.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/requests/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold text-sm hover:opacity-95 transition-opacity no-underline"
              >
                Get Python help
              </Link>
              <Link
                href="/resources/writing/how-to-approach-a-programming-assignment"
                className="inline-flex items-center gap-2 px-6 py-3 border border-outline-variant bg-white rounded-xl font-semibold text-sm text-on-surface hover:bg-surface-container-low transition-colors no-underline"
              >
                Read the programming guide
              </Link>
              <Link
                href="/subjects/computer-science"
                className="inline-flex items-center gap-2 px-6 py-3 border border-outline-variant bg-white rounded-xl font-semibold text-sm text-on-surface hover:bg-surface-container-low transition-colors no-underline"
              >
                Computer Science help
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
