import type { Resource } from "../types";

const howToWriteAnEssay: Resource = {
  slug: "how-to-write-an-essay",
  category: "writing",
  title: "How to Write an Essay: A Step-by-Step Guide",
  h1: "How to Write an Essay: A Step-by-Step Guide",
  seoTitle: "How to Write an Essay: Step-by-Step Guide | Acadibo",
  description:
    "Learn how to write an academic essay: understanding the question, researching your topic, developing an argument, outlining, writing paragraphs, citing sources, and proofreading.",
  ogDescription:
    "A practical walkthrough of the essay-writing process, from decoding the question to a final proofreading checklist.",
  readingMinutes: 7,
  featured: true,
  intro: [
    "An academic essay is a structured argument written in prose. Every section has a job, and the whole piece only works if those jobs line up with the question you were set.",
    "This guide walks through that process in order: what an essay is, how to read the brief, how to research, how to build an argument and outline, how to write each section, and how to proofread before you submit. It suits high school and undergraduate coursework across most subjects.",
    "Where your instructor gives specific requirements, those always come first. Everything below is general guidance you can adapt.",
  ],
  sections: [
    {
      heading: "What Is an Academic Essay?",
      blocks: [
        {
          t: "p",
          v: "An academic essay is a short piece of non-fiction writing that puts forward a position on a question and supports it with evidence from credible sources. It differs from a report (which mostly presents findings) and from a review (which evaluates sources) because the essay's central job is to argue something.",
        },
        {
          t: "p",
          v: "Three features matter most:",
        },
        {
          t: "ul",
          v: [
            "A clear, arguable position. If both sides are equally reasonable and you refuse to choose, you have not yet written an essay.",
            "Evidence drawn from sources, data, or examples, cited properly.",
            "An argument that connects that evidence to your position rather than just listing it.",
          ],
        },
      ],
    },
    {
      heading: "Before You Start",
      blocks: [
        {
          t: "p",
          v: "Ten minutes spent decoding the brief prevents most essay problems. Gather your instructions and work through this list:",
        },
        {
          t: "checklist",
          v: [
            "Read the assignment question word by word, twice.",
            "Identify the task verb: argue, discuss, compare, evaluate, explain, or describe.",
            "Note the scope: which time period, region, case, or number of sources.",
            "Check the required word count and what it counts (some exclude references).",
            "Check the deadline, including any draft or peer-review checkpoints.",
            "Find the grading criteria, or rubric, if your instructor provided one.",
            "Note how many sources you need and what type they should be.",
            "Confirm the required citation style and formatting rules.",
          ],
        },
        {
          t: "note",
          title: "What is a rubric?",
          v: "A rubric is a grading guide provided by your instructor that explains what criteria will be used to evaluate your work. It usually lists things like argument quality, evidence, structure, and referencing, often weighted by percentage. If you are given a rubric, read it before you start and treat it as your outline.",
        },
      ],
      links: [{ label: "How to write a strong thesis statement", slug: "how-to-write-a-thesis-statement" }],
    },
    {
      heading: "Step 1: Understand the Question",
      blocks: [
        {
          t: "p",
          v: "Break the question into four parts: the topic you are writing about, the task you must perform, the scope you must stay within, and any key instructions.",
        },
        {
          t: "example",
          label: "Example",
          v: [
            "Question: \"To what extent has social media changed how teenagers form friendships?\"",
            "Topic: social media and teenage friendship formation.",
            "Task: \"to what extent\" asks you to weigh how much, and to argue a degree rather than describe everything.",
            "Scope: teenagers, friendship formation, and the period you define. Not social media in general, and not adult relationships.",
            "Key instruction: the word \"extent\" means a partial answer with a judgement is expected, not a list of effects.",
          ],
        },
        {
          t: "p",
          v: "Rewrite the question as a statement you could argue. \"Social media has made teenage friendships more superficial but no less meaningful\" is arguable. \"Social media affects teenagers\" is too vague to build an essay on.",
        },
      ],
    },
    {
      heading: "Step 2: Research Your Topic",
      blocks: [
        {
          t: "p",
          v: "Search with intention. Start from the keywords in your question, then follow citations forward from one good source — the reference lists of well-cited papers are the fastest route to a solid reading list.",
        },
        {
          t: "ul",
          v: [
            "Check credibility: peer-reviewed journals, established books, official reports, reputable institutional sites.",
            "Check relevance and date. A source from 1998 may still be the standard work in a field, but in fast-moving subjects you usually want recent research.",
            "Avoid relying on blogs, content farms, and undated pages for factual claims you intend to cite.",
          ],
        },
        {
          t: "p",
          v: "While you read, keep two things apart in your notes:",
        },
        {
          t: "example",
          label: "Note-taking",
          v: [
            "Source information, recorded fully at the time you read it: author, year, title, publication, and the page or paragraph you are using. Retrieving this later is slow and error-prone.",
            "Your own reactions: what you agree with, what surprised you, what seems missing, what you can use as an example.",
          ],
        },
        {
          t: "p",
          v: "Never state a fact you cannot attribute. If you cannot point to where it came from, it is either your opinion (and should be presented as analysis) or it needs a source.",
        },
      ],
      links: [{ label: "How to cite sources in academic writing", slug: "how-to-cite-sources" }],
    },
    {
      heading: "Step 3: Develop Your Main Argument",
      blocks: [
        {
          t: "p",
          v: "Your argument is the answer to the question. Before drafting, be able to complete this sentence: \"This essay argues that ___ because ___ and ___.\" The blanks are the position and the reasons.",
        },
        {
          t: "p",
          v: "Test it against three filters. Is it specific? Does it directly answer the verb in the question? Could a reasonable person disagree with it? If any answer is no, sharpen it.",
        },
      ],
      links: [{ label: "How to write a strong thesis statement", slug: "how-to-write-a-thesis-statement" }],
    },
    {
      heading: "Step 4: Create an Outline",
      blocks: [
        {
          t: "p",
          v: "An outline is a plan of paragraphs, not a summary of the essay. For each body paragraph write: the point it makes, the evidence it uses, and how that evidence supports the point.",
        },
        {
          t: "example",
          label: "Simple essay outline",
          v: [
            "Introduction: hook, context, thesis.",
            "Body 1: main reason — evidence from Source A.",
            "Body 2: counter-argument — acknowledge it, show why it does not outweigh your position.",
            "Body 3: second reason or consequence — evidence from Source B.",
            "Conclusion: restate position in new words, state significance, no new evidence.",
          ],
        },
      ],
    },
    {
      heading: "Step 5: Write the Introduction",
      blocks: [
        {
          t: "p",
          v: "A strong introduction moves from general to specific across roughly three moves:",
        },
        {
          t: "ol",
          v: [
            "Context: a short opening that shows why the topic matters. Avoid dictionary definitions and grand claims about society.",
            "Narrowing: the specific question or debate you are addressing.",
            "Thesis: your position in one or two sentences, plus a brief roadmap if the essay is long.",
          ],
        },
        {
          t: "p",
          v: "Do not bury the thesis in the last sentence of a long paragraph. Readers (and markers) should not have to hunt for it.",
        },
      ],
      links: [{ label: "How to write an effective essay introduction", slug: "how-to-write-an-introduction" }],
    },
    {
      heading: "Step 6: Write the Body Paragraphs",
      blocks: [
        {
          t: "p",
          v: "One idea per paragraph. A widely used structure is Claim, Evidence, Explanation, Connection:",
        },
        {
          t: "ul",
          v: [
            "Claim: the point of the paragraph, stated in your own words.",
            "Evidence: the specific data, quotation, example, or result that supports it, cited.",
            "Explanation: your analysis of what that evidence shows and why it matters.",
            "Connection: how this paragraph advances the overall argument.",
          ],
        },
        {
          t: "p",
          v: "This is one workable structure, not the only one. Some disciplines favour different orders, and some essays work well as a continuous sequence without explicit signposting. Whatever you choose, each paragraph should do one job and do it well.",
        },
      ],
      links: [{ label: "How to paraphrase without changing the meaning", slug: "how-to-paraphrase" }],
    },
    {
      heading: "Step 7: Write the Conclusion",
      blocks: [
        {
          t: "p",
          v: "The conclusion does three things:",
        },
        {
          t: "ol",
          v: [
            "Return to the argument in new wording, so the essay ends on its central point.",
            "Briefly pull together the reasoning that got you there.",
            "Explain the significance: what changes if your position is right, or what question remains open.",
          ],
        },
        {
          t: "p",
          v: "Never introduce a major new argument or new evidence in the conclusion. It will not be developed properly and it will unbalance the essay.",
        },
      ],
    },
    {
      heading: "Step 8: Add Citations and References",
      blocks: [
        {
          t: "p",
          v: "Cite when you use another person's ideas, wording, data, images, or distinctive interpretation — even when you put it in your own words. Anything a reader could not produce from general knowledge needs a source.",
        },
        {
          t: "ul",
          v: [
            "Place the citation at the point you use the information, not only at the end of the paragraph.",
            "Use the style your course requires: APA, MLA, Chicago, Harvard, or IEEE.",
            "Build the reference list from the same sources you actually cited — no extras, no omissions.",
          ],
        },
      ],
      links: [{ label: "APA citation guide", slug: "apa-citation-guide" }],
    },
    {
      heading: "Step 9: Proofread",
      blocks: [
        {
          t: "p",
          v: "Do not try to fix everything in one pass. Reading for structure first, then language, then mechanics, catches more than rereading everything at once.",
        },
        {
          t: "ul",
          v: [
            "Print it if you can. Sentence fragments and inconsistent paragraphing are obvious on paper.",
            "Read the first sentence of every paragraph in sequence; they should sketch the argument.",
            "Read the last sentence of every paragraph; they should connect to what follows.",
            "Check formatting: margins, spacing, fonts, headings, page numbers.",
          ],
        },
      ],
      links: [{ label: "How to proofread an essay before submission", slug: "how-to-proofread-an-essay" }],
    },
  ],
  takeaways: [
    "Decode the question before you write a word — the task verb and scope determine everything.",
    "A rubric is your instructor's grading guide; use it as your outline.",
    "One idea per paragraph, developed with cited evidence and your own analysis.",
    "Introductions narrow from context to thesis; conclusions restate without adding new arguments.",
    "Cite as you write, and build the reference list from what you actually used.",
  ],
  checklist: [
    "I answered the assignment question",
    "My thesis/main argument is clear",
    "My paragraphs are logically organized",
    "My evidence supports my claims",
    "I cited sources where required",
    "My references are complete",
    "I followed the required formatting",
    "I checked grammar and spelling",
    "I stayed within the required word count",
    "I reviewed the assignment instructions before submitting",
  ],
  mistakes: [
    "Answering a different question than the one that was set.",
    "Writing a descriptive summary with no position to defend.",
    "Including sources you never actually read in the reference list.",
    "Starting paragraphs with \"In today's society\" or \"Throughout history\".",
    "Using quotations without any analysis of what they mean.",
    "Letting the conclusion introduce a new argument.",
    "Editing word choice before the structure is sound.",
    "Ignoring the rubric.",
  ],
  related: [
    { slug: "how-to-write-a-thesis-statement", label: "How to Write a Strong Thesis Statement" },
    { slug: "how-to-write-an-introduction", label: "How to Write an Effective Essay Introduction" },
    { slug: "how-to-write-a-conclusion", label: "How to Write a Strong Essay Conclusion" },
    { slug: "how-to-paraphrase", label: "How to Paraphrase Without Changing the Meaning" },
    { slug: "how-to-cite-sources", label: "How to Cite Sources in Academic Writing" },
    { slug: "how-to-proofread-an-essay", label: "How to Proofread an Essay Before Submission" },
  ],
  subjects: [
    { slug: "academic-writing", label: "Academic Writing" },
    { slug: "english-literature", label: "English Literature" },
    { slug: "history", label: "History" },
    { slug: "philosophy", label: "Philosophy" },
    { slug: "sociology", label: "Sociology" },
  ],
  service: {
    title: "Need help with your essay?",
    body: "Find a helper who can work through structure, argument, and clarity with you before you submit.",
    cta: "Find an Essay Helper",
    href: "/browse-helpers",
  },
};

export default howToWriteAnEssay;