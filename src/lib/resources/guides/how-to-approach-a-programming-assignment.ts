import type { Resource } from "../types";

const guide: Resource = {
  slug: "how-to-approach-a-programming-assignment",
  category: "technical",
  title: "How to Approach a Programming Assignment",
  h1: "How to Approach a Programming Assignment",
  seoTitle: "How to Approach a Programming Assignment | Acadibo",
  description:
    "A process for tackling a programming assignment: reading the brief, decomposing the problem, choosing data structures, testing, and documenting your work.",
  ogDescription:
    "How to approach a programming assignment: decoding the spec, decomposing it, choosing data structures, writing tests, and documenting.",
  readingMinutes: 4,
  intro: [
    "Most programming assignments are failed for process reasons rather than ability: starting to code before reading the spec, solving the wrong problem, or writing a large amount of untested code.",
    "This guide gives a repeatable process that works for coursework, projects, and assessments across most languages.",
  ],
  sections: [
    {
      heading: "Read the Brief Twice",
      blocks: [
        {
          t: "p",
          v: "The first read answers \"what am I building\". The second answers the questions that determine whether it is correct:",
        },
        {
          t: "ul",
          v: [
            "What exactly are the inputs, their types, and their constraints?",
            "What exactly are the outputs, and in what format?",
            "What is explicitly required, and what is forbidden?",
            "Which language version, libraries, or frameworks are permitted?",
            "How will it be marked — autograder, tests, style rubric, demonstration?",
            "What are the size and time limits? This determines your algorithm choice.",
            "Is there a required submission structure, naming convention, or template?",
          ],
        },
        {
          t: "p",
          v: "Copy the input and output specification into your notes. Nearly every wrong answer comes from misreading one of these.",
        },
      ],
    },
    {
      heading: "Work Examples Through by Hand",
      blocks: [
        {
          t: "p",
          v: "Take the smallest example from the brief and trace it by hand on paper. Then take one edge case. This is the fastest way to find that you have misunderstood the problem, and it costs five minutes.",
        },
        {
          t: "p",
          v: "Write down the expected output before you write the code. When your program disagrees, you now know whether the code is wrong or your understanding is wrong.",
        },
      ],
    },
    {
      heading: "Decompose the Problem",
      blocks: [
        {
          t: "ol",
          v: [
            "List the functions or classes the assignment needs.",
            "Write the signature of each — name, parameters, return type — before implementing anything.",
            "Identify which parts are independent and can be written and tested separately.",
            "Find the one or two parts that are genuinely difficult and start there, using a stub for the rest.",
            "Identify the parts you have done before. Reuse is not cheating; it is engineering.",
          ],
        },
        {
          t: "p",
          v: "Do not write one 300-line file. Small functions with clear contracts can each be tested and reasoned about in isolation.",
        },
      ],
    },
    {
      heading: "Choose Data Structures Before Algorithms",
      blocks: [
        {
          t: "p",
          v: "The structure determines the cost. Check the constraints: if n can reach 10⁵ or 10⁶, a nested loop over pairs is likely too slow.",
        },
        {
          t: "table",
          head: ["Need", "Consider", "Cost"],
          rows: [
            ["Fast lookup by key", "Dictionary / hash map", "O(1) average"],
            ["Ordered, unique elements", "Set / sorted collection", "O(1) lookup, O(log n) ordered ops"],
            ["Repeated access by index, frequent updates", "List / array", "O(1) index"],
            ["Priority ordering", "Heap / priority queue", "O(log n) per operation"],
            ["Prefix range queries", "Prefix sums, Fenwick tree", "O(1) or O(log n) queries"],
          ],
        },
        {
          t: "p",
          v: "Use built-in library collections rather than implementing your own hash table. If the assignment explicitly asks for a data structure to be implemented, read that instruction carefully — it usually says so.",
        },
      ],
    },
    {
      heading: "Test as You Go",
      blocks: [
        {
          t: "checklist",
          v: [
            "Run the example from the brief after every change.",
            "Test the smallest valid input.",
            "Test the largest valid input — off-by-one and time limit errors live here.",
            "Test the edge cases: empty, zero, negative, single element, all identical.",
            "Test invalid input if the spec says what should happen.",
            "Commit or save a working version before each risky change.",
          ],
        },
        {
          t: "p",
          v: "If the assignment is graded by tests, write your own tests from the spec before writing code that tries to pass hidden tests. The spec is the source of truth; guessing at the autograder is not.",
        },
      ],
    },
    {
      heading: "Debugging Efficiently",
      blocks: [
        {
          t: "ol",
          v: [
            "Reproduce the failure with the smallest input that triggers it.",
            "Divide and conquer — binary search the input space or the code path to locate where behaviour diverges from expectations.",
            "Print or inspect intermediate values rather than guessing. Guesswork is slow and often wrong.",
            "Read the error message and traceback fully before changing anything.",
            "Check the usual suspects: off-by-one, mutable default arguments, wrong comparison operator, aliasing, float equality, uninitialised values.",
            "Change one thing at a time.",
          ],
        },
      ],
    },
    {
      heading: "Documentation and Code Quality",
      blocks: [
        {
          t: "ul",
          v: [
            "Explain what the program does and how to run it — many marks come from a README alone.",
            "Note any design decisions, assumptions, and limitations.",
            "Use meaningful names, and keep functions short.",
            "Remove debugging prints and dead code before submitting.",
            "Match the required submission structure exactly; this is a common silent mark loss.",
            "Check whether the rubric assesses testing, documentation, or style, and allocate effort accordingly.",
          ],
        },
        {
          t: "note",
          title: "Academic integrity",
          v: "Follow your institution's rules on collaboration and generative tools. Many assignments permit discussing approaches but prohibit sharing code, and the boundary is usually the code itself. If you are unsure, ask before submitting.",
        },
      ],
    },
  ],
  takeaways: [
    "Read the brief twice and copy the input/output spec into your notes.",
    "Trace examples by hand before writing code.",
    "Decompose into small testable functions, and choose data structures from the constraints.",
    "Test edge cases and the largest valid input — that is where errors live.",
  ],
  checklist: [
    "I extracted the input, output, and constraints from the brief",
    "I traced a small example and an edge case by hand",
    "I wrote down function signatures before implementing",
    "My data structure suits the input size",
    "I tested empty, minimal, maximal, and invalid inputs",
    "I removed debug prints and dead code",
    "I included a README with run instructions",
    "My submission structure matches the requirement",
    "I am confident my work complies with my institution's rules",
  ],
  mistakes: [
    "Coding before reading the whole brief.",
    "Ignoring the size constraints and producing an O(n²) solution.",
    "Writing one large function that cannot be tested in pieces.",
    "Implementing a data structure you could have imported.",
    "Testing only the example from the brief.",
    "Submitting with debug output and missing a README.",
  ],
  related: [
    { slug: "how-to-analyze-data", label: "How to Approach a Data Analysis Assignment" },
    { slug: "how-to-write-a-report", label: "How to Write a Report: Structure, Format & Examples" },
  ],
  subjects: [
    { slug: "computer-science", label: "Computer Science" },
    { slug: "engineering", label: "Engineering" },
    { slug: "mathematics", label: "Mathematics" },
  ],
  service: {
    title: "Stuck on an assignment?",
    body: "Find a helper to work through the problem, your approach, and your testing strategy.",
    cta: "Find a Programming Helper",
    href: "/services/programming-help",
  },
};

export default guide;