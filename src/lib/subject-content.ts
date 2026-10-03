export type SubjectSubtopic = {
  title: string;
  blurb: string;
};

export type SubjectContent = {
  slug: string;
  name: string;
  group: string;
  icon: string;
  cardDesc: string;
  h1: string;
  title: string;
  description: string;
  ogDescription: string;
  intro: string;
  subtopics: SubjectSubtopic[];
  faqs: { q: string; a: string }[];
};

const HOW_IT_WORDS =
  "Tell us what you're working on, browse relevant helpers, choose who you want to work with, discuss your requirements, and receive a personalized proposal before you pay.";

export const SUBJECT_CONTENT: SubjectContent[] = [
  {
    slug: "computer-science",
    name: "Computer Science",
    group: "Sciences & STEM",
    icon: "code",
    cardDesc: "Programming, algorithms, data structures, and software engineering",
    h1: "Computer Science Assignment Help",
    title: "Computer Science Assignment Help | Python, Java, SQL & More | Acadibo",
    description:
      "Get computer science assignment help for Python, Java, SQL, databases, machine learning, data structures, and programming projects. Choose a helper and get a proposal before you pay.",
    ogDescription:
      "CS assignment help for Python, Java, SQL, databases, algorithms, ML, and projects. Discuss with a helper, get a personalized proposal, pay only after accepting.",
    intro: `Get expert computer science assignment help across programming, databases, algorithms, and machine learning. ${HOW_IT_WORDS}`,
    subtopics: [
      { title: "Python Assignment Help", blurb: "Functions, OOP, data analysis, automation, and scripting explained clearly." },
      { title: "SQL Assignment Help", blurb: "Queries, joins, normalization, and schema design with hands-on review." },
      { title: "Java Assignment Help", blurb: "OOP principles, collections, JDBC, and build tooling support." },
      { title: "Database Assignment Help", blurb: "Relational modelling, transactions, indexing, and ER diagrams." },
      { title: "Machine Learning Assignment Help", blurb: "Model selection, feature engineering, evaluation, and interpretation." },
      { title: "Data Structures Assignment Help", blurb: "Trees, graphs, hashing, and complexity analysis worked through step by step." },
      { title: "Programming Assignment Help", blurb: "Debugging, logic errors, and refactoring with a helper who explains why." },
      { title: "Computer Science Project Help", blurb: "Project scoping, architecture choices, documentation, and review." },
    ],
    faqs: [
      { q: "Can I get help with Python assignments?", a: "Yes. Get step-by-step Python assignment help covering functions, OOP, data analysis, automation, and more." },
      { q: "Do you offer Java and SQL assignment help?", a: "Yes. Helpers cover Java, JDBC, SQL queries, normalization, stored procedures, and database design." },
      { q: "Will I understand the work or just get an answer?", a: "Yes. We focus on explanations and guidance so you learn the concepts instead of only receiving output." },
      { q: "Do I pay before or after getting a quote?", a: "You receive a personalized proposal with pricing and scope first, and pay only after you accept it." },
    ],
  },
  {
    slug: "statistics",
    name: "Statistics",
    group: "Sciences & STEM",
    icon: "bar_chart",
    cardDesc: "Probability, data analysis, hypothesis testing, and regression",
    h1: "Statistics Assignment Help",
    title: "Statistics Assignment Help | SPSS, R, Data Analysis | Acadibo",
    description:
      "Get statistics assignment help, statistics homework help, SPSS assignment help, R programming assignment help, data analysis help, hypothesis testing help, and regression analysis help.",
    ogDescription:
      "Statistics assignment help with SPSS, R, data analysis, hypothesis testing, and regression. Choose a helper, discuss requirements, get a proposal before paying.",
    intro: `Get expert statistics support for assignments, homework, and analysis projects. ${HOW_IT_WORDS}`,
    subtopics: [
      { title: "Statistics Assignment Help", blurb: "Full support for coursework, reports, and statistical analysis projects." },
      { title: "Statistics Homework Help", blurb: "Work through problems with clear explanations of each step." },
      { title: "SPSS Assignment Help", blurb: "Data entry, test selection, output interpretation, and APA reporting." },
      { title: "R Programming Assignment Help", blurb: "Data wrangling, visualization, modelling, and reproducible analysis." },
      { title: "Data Analysis Assignment Help", blurb: "Cleaning, transforming, and interpreting real datasets responsibly." },
      { title: "Hypothesis Testing Help", blurb: "Assumptions, test choice, p-values, and reporting results correctly." },
      { title: "Regression Analysis Help", blurb: "Model specification, diagnostics, residuals, and interpretation." },
    ],
    faqs: [
      { q: "Can you help with SPSS assignments?", a: "Yes. Helpers cover SPSS data entry, statistical tests, output interpretation, and result reporting." },
      { q: "Do you help with R programming?", a: "Yes. R programming assignment help covers data analysis, visualization, and statistical testing." },
      { q: "Can I get help with hypothesis testing or regression?", a: "Yes. Helpers explain assumptions, run the appropriate test, and help you interpret results." },
    ],
  },
  {
    slug: "mathematics",
    name: "Mathematics",
    group: "Sciences & STEM",
    icon: "calculate",
    cardDesc: "Algebra, calculus, geometry, number theory, and applied math",
    h1: "Mathematics Assignment Help",
    title: "Mathematics Assignment Help | Algebra, Calculus & More | Acadibo",
    description:
      "Get mathematics assignment help for algebra, calculus, geometry, linear algebra, discrete math, and applied mathematics from verified tutors who explain every step.",
    ogDescription:
      "Mathematics assignment help with step-by-step explanations for algebra, calculus, geometry, and more. Choose a tutor, discuss your problem, and get a proposal before paying.",
    intro: `Get clear, step-by-step mathematics guidance from verified tutors. ${HOW_IT_WORDS}`,
    subtopics: [
      { title: "Algebra Assignment Help", blurb: "Equations, functions, inequalities, and sequences explained clearly." },
      { title: "Calculus Assignment Help", blurb: "Limits, derivatives, integrals, and series with worked solutions." },
      { title: "Geometry Assignment Help", blurb: "Proofs, coordinate geometry, and spatial reasoning support." },
      { title: "Linear Algebra Assignment Help", blurb: "Matrices, vectors, eigenvalues, and transformations." },
      { title: "Discrete Mathematics Assignment Help", blurb: "Logic, proof techniques, combinatorics, and graph theory." },
      { title: "Trigonometry Assignment Help", blurb: "Identities, equations, and applications with unit-circle fluency." },
      { title: "Precalculus Assignment Help", blurb: "Functions, graphs, and preparation for calculus." },
      { title: "Applied Mathematics Assignment Help", blurb: "Modelling, numerical methods, and real-world problem solving." },
    ],
    faqs: [
      { q: "Can you help with calculus?", a: "Yes. Limits, derivatives, integrals, series, and applications are all covered." },
      { q: "Will I see how each step works?", a: "Yes. Tutors explain the method so you can reproduce it yourself." },
      { q: "Which levels do you support?", a: "High school, college, undergraduate, and graduate-level problems depending on helper expertise." },
    ],
  },
  {
    slug: "business-studies",
    name: "Business Studies",
    group: "Business & Social Sciences",
    icon: "business_center",
    cardDesc: "Management, marketing, finance, and strategic planning",
    h1: "Business Assignment Help",
    title: "Business Assignment Help | Marketing, Finance & Case Studies | Acadibo",
    description:
      "Get business assignment help, marketing assignment help, finance assignment help, accounting assignment help, case study help, and MBA assignment help from verified tutors.",
    ogDescription:
      "Business assignment help for marketing, finance, accounting, case studies, and MBA work. Choose a tutor, discuss your requirements, and get a proposal before paying.",
    intro: `Get expert business guidance for assignments, reports, and case studies. ${HOW_IT_WORDS}`,
    subtopics: [
      { title: "Business Assignment Help", blurb: "Structured support for essays, reports, and presentations." },
      { title: "Marketing Assignment Help", blurb: "Segmentation, positioning, campaigns, and marketing mix analysis." },
      { title: "Finance Assignment Help", blurb: "Valuation, ratios, capital budgeting, and financial statement analysis." },
      { title: "Accounting Assignment Help", blurb: "Debits and credits, journals, reconciliations, and cost behaviour." },
      { title: "Case Study Help", blurb: "Framework-based analysis with structured recommendations." },
      { title: "MBA Assignment Help", blurb: "Strategy, leadership, operations, and decision analysis." },
      { title: "Management Assignment Help", blurb: "Organisational behaviour, planning, and control frameworks." },
      { title: "Human Resource Assignment Help", blurb: "Recruitment, performance, motivation, and labour relations." },
    ],
    faqs: [
      { q: "Can you help with case studies?", a: "Yes. Helpers help you structure analysis, apply frameworks, and build defensible recommendations." },
      { q: "Do you cover MBA-level work?", a: "Yes, depending on helper expertise and the scope of your assignment." },
      { q: "Can you help with finance calculations?", a: "Yes. Valuation, ratios, and capital budgeting can be worked through step by step." },
    ],
  },
  {
    slug: "academic-writing",
    name: "Academic Writing",
    group: "Humanities & Liberal Arts",
    icon: "edit_note",
    cardDesc: "Essays, research papers, reports, editing, and proofreading",
    h1: "Essay Help & Academic Writing Support",
    title: "Essay Help & Academic Writing Support | Acadibo",
    description:
      "Get essay help, research paper help, report writing help, proofreading assignment support, and academic editing from verified writing tutors.",
    ogDescription:
      "Essay help, research paper help, and academic editing from verified tutors. Discuss your requirements and receive a personalized proposal before you pay.",
    intro: `Get support that strengthens your writing instead of replacing it. ${HOW_IT_WORDS}`,
    subtopics: [
      { title: "Essay Help", blurb: "Structure, arguments, evidence, and clarity with feedback on your own draft." },
      { title: "Research Paper Help", blurb: "Topic scoping, literature review, methodology, and citation practice." },
      { title: "Report Writing Help", blurb: "Organising findings into a clear, well-structured report." },
      { title: "Proofreading Assignment", blurb: "Grammar, punctuation, and consistency checked line by line." },
      { title: "Academic Editing", blurb: "Structure, flow, and argument strengthened while keeping your voice." },
      { title: "Case Study Help", blurb: "Analysis frameworks applied consistently and referenced correctly." },
      { title: "Thesis and Dissertation Help", blurb: "Chapter structure, argument coherence, and long-document planning." },
      { title: "Citation Help", blurb: "APA, MLA, Harvard, and Chicago applied correctly and consistently." },
    ],
    faqs: [
      { q: "Will someone write my essay for me?", a: "No. Tutors give feedback, explain structure, and help you improve your own writing." },
      { q: "Can you help with citations and referencing?", a: "Yes. Helpers cover APA, MLA, Harvard, and Chicago formatting and in-text citation practice." },
      { q: "Do you help with dissertations?", a: "Yes. Helpers can support chapter structure, argument planning, and editing long documents." },
    ],
  },
  {
    slug: "english-literature",
    name: "English Literature",
    group: "Humanities & Liberal Arts",
    icon: "menu_book",
    cardDesc: "Literary analysis, critical essays, poetry, and prose interpretation",
    h1: "English Literature Assignment Help",
    title: "English Literature Assignment Help | Essay & Analysis Support | Acadibo",
    description:
      "Get English literature assignment help with literary analysis, poetry and prose interpretation, close reading, and critical essay structure from verified tutors.",
    ogDescription:
      "English literature assignment help for literary analysis, close reading, poetry, and critical essays from verified tutors.",
    intro: `Get guidance on close reading, argument, and literary analysis. ${HOW_IT_WORDS}`,
    subtopics: [
      { title: "Literary Analysis Help", blurb: "Building arguments from textual evidence with clear critical logic." },
      { title: "Poetry Analysis Help", blurb: "Form, meter, rhyme, imagery, and interpretation." },
      { title: "Prose and Novel Analysis Help", blurb: "Narrative structure, character development, and theme." },
      { title: "Comparative Essay Help", blurb: "Linking two texts through a focused lens." },
      { title: "Close Reading Help", blurb: "Line-by-line interpretation grounded in the text." },
      { title: "Modernist and Postmodern Literature Help", blurb: "Key movements, techniques, and critical frameworks." },
    ],
    faqs: [
      { q: "Can you help me analyse a text?", a: "Yes. Tutors help you build interpretations from evidence rather than summaries." },
      { q: "Do you help with comparative essays?", a: "Yes, including selecting a comparison lens and structuring the argument." },
    ],
  },
  {
    slug: "biology",
    name: "Biology",
    group: "Sciences & STEM",
    icon: "biotech",
    cardDesc: "Cell biology, genetics, ecology, anatomy, and lab reports",
    h1: "Biology Assignment Help",
    title: "Biology Assignment Help | Genetics, Ecology & Lab Reports | Acadibo",
    description:
      "Get biology assignment help with genetics, cell biology, ecology, anatomy, physiology, and lab report writing from verified science tutors.",
    ogDescription:
      "Biology assignment help for genetics, cell biology, ecology, anatomy, and lab reports from verified tutors.",
    intro: `Get help understanding biological concepts and writing accurate lab reports. ${HOW_IT_WORDS}`,
    subtopics: [
      { title: "Genetics Assignment Help", blurb: "Inheritance patterns, gene regulation, and population genetics." },
      { title: "Cell Biology Assignment Help", blurb: "Organelles, signalling, membranes, and cell cycle." },
      { title: "Ecology Assignment Help", blurb: "Ecosystem dynamics, population models, and fieldwork analysis." },
      { title: "Anatomy and Physiology Help", blurb: "Body systems, mechanisms, and clinical correlations." },
      { title: "Biochemistry Assignment Help", blurb: "Metabolism, enzymes, and molecular interactions." },
      { title: "Biology Lab Report Help", blurb: "Method, results, figures, and discussion written correctly." },
    ],
    faqs: [
      { q: "Do you help with lab reports?", a: "Yes, including method, results presentation, and discussion sections." },
      { q: "Can you explain difficult concepts like genetics?", a: "Yes. Tutors focus on mechanisms so the logic makes sense." },
    ],
  },
  {
    slug: "chemistry",
    name: "Chemistry",
    group: "Sciences & STEM",
    icon: "science",
    cardDesc: "Organic, inorganic, physical chemistry, and lab methodology",
    h1: "Chemistry Assignment Help",
    title: "Chemistry Assignment Help | Organic, Physical & Lab Work | Acadibo",
    description:
      "Get chemistry assignment help with organic chemistry mechanisms, physical chemistry calculations, spectroscopy, and laboratory methodology.",
    ogDescription:
      "Chemistry assignment help for organic mechanisms, physical chemistry calculations, and lab methodology from verified tutors.",
    intro: `Get support with reaction mechanisms, calculations, and laboratory technique. ${HOW_IT_WORDS}`,
    subtopics: [
      { title: "Organic Chemistry Assignment Help", blurb: "Reaction mechanisms, functional groups, and synthesis routes." },
      { title: "Physical Chemistry Help", blurb: "Thermodynamics, kinetics, equilibria, and electrochemistry." },
      { title: "Stoichiometry Help", blurb: "Calculations, limiting reagents, and concentration problems." },
      { title: "Spectroscopy Assignment Help", blurb: "Interpreting NMR, IR, and mass spectra to identify structures." },
      { title: "Chemistry Lab Report Help", blurb: "Accurate procedures, observations, and data interpretation." },
      { title: "Inorganic Chemistry Help", blurb: "Coordination chemistry, bonding, and periodic trends." },
    ],
    faqs: [
      { q: "Can you help with reaction mechanisms?", a: "Yes. Tutors walk through electron flow and intermediates step by step." },
      { q: "Do you help with lab reports?", a: "Yes, including procedure, results, and discussion sections." },
    ],
  },
  {
    slug: "physics",
    name: "Physics",
    group: "Sciences & STEM",
    icon: "settings_input_antenna",
    cardDesc: "Mechanics, thermodynamics, electromagnetism, and quantum theory",
    h1: "Physics Assignment Help",
    title: "Physics Assignment Help | Mechanics, E&M & More | Acadibo",
    description:
      "Get physics assignment help with mechanics, thermodynamics, electromagnetism, optics, and quantum physics from verified tutors who show the reasoning.",
    ogDescription:
      "Physics assignment help for mechanics, thermodynamics, electromagnetism, and quantum physics with full derivations.",
    intro: `Get physics help with complete derivations, not just final numbers. ${HOW_IT_WORDS}`,
    subtopics: [
      { title: "Classical Mechanics Help", blurb: "Newtonian motion, energy, momentum, and rotational dynamics." },
      { title: "Electromagnetism Assignment Help", blurb: "Fields, potentials, circuits, and Maxwell's equations." },
      { title: "Thermodynamics Help", blurb: "Laws, cycles, entropy, and statistical interpretation." },
      { title: "Quantum Physics Help", blurb: "Wavefunctions, operators, uncertainty, and simple models." },
      { title: "Optics Assignment Help", blurb: "Geometric and wave optics with relevant approximations." },
      { title: "Fluid Mechanics Help", blurb: "Continuity, Bernoulli, viscosity, and flow analysis." },
    ],
    faqs: [
      { q: "Will you show the full derivation?", a: "Yes. Every problem is worked through with reasoning, not just answers." },
      { q: "Which physics topics are covered?", a: "Mechanics, E&M, thermodynamics, optics, quantum physics, and fluids." },
    ],
  },
  {
    slug: "engineering",
    name: "Engineering",
    group: "Sciences & STEM",
    icon: "precision_manufacturing",
    cardDesc: "Mechanical, civil, and electrical engineering principles and design",
    h1: "Engineering Assignment Help",
    title: "Engineering Assignment Help | Mechanical, Civil & Electrical | Acadibo",
    description:
      "Get engineering assignment help with mechanics, circuits, thermodynamics, structures, and design projects from verified engineering tutors.",
    ogDescription:
      "Engineering assignment help for mechanical, civil, and electrical topics including design projects and technical reports.",
    intro: `Get engineering guidance on analysis, design trade-offs, and technical reporting. ${HOW_IT_WORDS}`,
    subtopics: [
      { title: "Mechanical Engineering Help", blurb: "Statics, dynamics, machines, and design fundamentals." },
      { title: "Electrical Engineering Help", blurb: "Circuits, signals, control systems, and electronics." },
      { title: "Civil Engineering Help", blurb: "Structures, materials, geotechnics, and transportation." },
      { title: "Engineering Mathematics Help", blurb: "Applied calculus, linear algebra, and numerical methods." },
      { title: "Thermodynamics for Engineers Help", blurb: "Systems analysis, cycles, and energy balances." },
      { title: "Engineering Design Project Help", blurb: "Requirements, trade-offs, prototyping, and documentation." },
    ],
    faqs: [
      { q: "Do you help with design projects?", a: "Yes, including requirements analysis, trade-off evaluation, and documentation." },
      { q: "Can you help with circuit analysis?", a: "Yes, including nodal and mesh methods, AC circuits, and control basics." },
    ],
  },
  {
    slug: "psychology",
    name: "Psychology",
    group: "Business & Social Sciences",
    icon: "psychology_alt",
    cardDesc: "Cognitive, developmental, clinical, and social psychology",
    h1: "Psychology Assignment Help",
    title: "Psychology Assignment Help | Research, Essays & Concepts | Acadibo",
    description:
      "Get psychology assignment help with research papers, case studies, APA referencing, and core psychological concepts from verified tutors.",
    ogDescription:
      "Psychology assignment help for essays, research, case studies, and APA referencing from verified tutors.",
    intro: `Get structured guidance on psychological concepts, research, and academic writing. ${HOW_IT_WORDS}`,
    subtopics: [
      { title: "Psychology Assignment Help", blurb: "Essays, research papers, and concept explanations." },
      { title: "Cognitive Psychology Help", blurb: "Attention, memory, perception, and experimental findings." },
      { title: "Developmental Psychology Help", blurb: "Life-span theories and empirical developmental stages." },
      { title: "Social Psychology Help", blurb: "Conformity, attribution, groups, and social influence." },
      { title: "Research Methods Help", blurb: "Designs, ethics, statistics, and APA 7 referencing." },
      { title: "Abnormal Psychology Help", blurb: "Disorders, classification, aetiology, and treatment approaches." },
      { title: "Case Study Assignment Help", blurb: "Structured clinical or case analysis with evidence." },
    ],
    faqs: [
      { q: "Can you help with APA formatting?", a: "Yes. Helpers cover APA 7 citations, reference lists, and formatting." },
      { q: "Do you help with research papers?", a: "Yes, from literature review to methodology and structure." },
    ],
  },
  {
    slug: "economics",
    name: "Economics",
    group: "Business & Social Sciences",
    icon: "trending_up",
    cardDesc: "Microeconomics, macroeconomics, econometrics, and policy analysis",
    h1: "Economics Assignment Help",
    title: "Economics Assignment Help | Micro, Macro & Econometrics | Acadibo",
    description:
      "Get economics assignment help with microeconomics, macroeconomics, econometrics, and policy analysis from verified economics tutors.",
    ogDescription:
      "Economics assignment help for microeconomics, macroeconomics, econometrics, and policy analysis from verified tutors.",
    intro: `Get help with economic models, data, and policy reasoning. ${HOW_IT_WORDS}`,
    subtopics: [
      { title: "Microeconomics Assignment Help", blurb: "Supply and demand, elasticity, and market structures." },
      { title: "Macroeconomics Assignment Help", blurb: "Growth, unemployment, inflation, and policy trade-offs." },
      { title: "Econometrics Help", blurb: "Regression, hypothesis testing, and interpreting estimates." },
      { title: "Economic Data Analysis Help", blurb: "Working with real datasets and reporting results rigorously." },
      { title: "Public Policy Analysis Help", blurb: "Cost-benefit reasoning and policy evaluation frameworks." },
      { title: "International Economics Help", blurb: "Trade, exchange rates, and global market mechanisms." },
    ],
    faqs: [
      { q: "Do you help with econometrics?", a: "Yes, including model specification, estimation, and interpretation of results." },
      { q: "Can you explain economic models?", a: "Yes. Tutors walk through assumptions and intuition behind each model." },
    ],
  },
  {
    slug: "history",
    name: "History",
    group: "Humanities & Liberal Arts",
    icon: "history_edu",
    cardDesc: "World history, historiography, and source analysis",
    h1: "History Assignment Help",
    title: "History Assignment Help | Analysis, Sources & Essays | Acadibo",
    description:
      "Get history assignment help with source analysis, historiography, essays, and period-specific context from verified tutors.",
    ogDescription:
      "History assignment help for source analysis, historiography, and essay writing from verified tutors.",
    intro: `Get help building historical arguments from evidence and context. ${HOW_IT_WORDS}`,
    subtopics: [
      { title: "World History Assignment Help", blurb: "Cross-period comparison and global context." },
      { title: "Source Analysis Help", blurb: "Evaluating primary sources for bias, purpose, and reliability." },
      { title: "Historiography Help", blurb: "Comparing interpretations and building a historiographical argument." },
      { title: "Essay Structure Help", blurb: "Thesis, evidence selection, and coherent paragraph flow." },
      { title: "Modern History Help", blurb: "Revolutions, industrialisation, and twentieth-century developments." },
    ],
    faqs: [
      { q: "Can you help me analyse primary sources?", a: "Yes. Tutors guide you to assess purpose, audience, bias, and reliability." },
      { q: "Do you help with thesis development?", a: "Yes, including narrowing a topic into a defensible argument." },
    ],
  },
  {
    slug: "philosophy",
    name: "Philosophy",
    group: "Humanities & Liberal Arts",
    icon: "psychology",
    cardDesc: "Ethics, logic, political philosophy, and critical thinking",
    h1: "Philosophy Assignment Help",
    title: "Philosophy Assignment Help | Ethics, Logic & Arguments | Acadibo",
    description:
      "Get philosophy assignment help with ethics, formal and informal logic, political philosophy, and argument analysis from verified tutors.",
    ogDescription:
      "Philosophy assignment help for ethics, logic, political philosophy, and argument analysis from verified tutors.",
    intro: `Get help formalising arguments and reasoning through philosophical problems. ${HOW_IT_WORDS}`,
    subtopics: [
      { title: "Ethics Assignment Help", blurb: "Normative frameworks, dilemmas, and applied reasoning." },
      { title: "Logic Assignment Help", blurb: "Validity, soundness, formalisation, and proofs." },
      { title: "Political Philosophy Help", blurb: "Justice, authority, liberty, and social contract debates." },
      { title: "Philosophy of Mind Help", blurb: "Consciousness, qualia, and functionalism debates." },
      { title: "Metaphysics Help", blurb: "Identity, causation, possibility, and modality." },
      { title: "Argument Analysis Help", blurb: "Diagramming arguments and identifying hidden premises." },
    ],
    faqs: [
      { q: "Can you help with logic assignments?", a: "Yes, including validity, soundness, symbolisation, and proofs." },
      { q: "Do you help with ethics dilemmas?", a: "Yes. Tutors help you apply frameworks to specific cases rather than giving conclusions." },
    ],
  },
  {
    slug: "sociology",
    name: "Sociology",
    group: "Humanities & Liberal Arts",
    icon: "groups",
    cardDesc: "Social theory, research methods, and contemporary social issues",
    h1: "Sociology Assignment Help",
    title: "Sociology Assignment Help | Theory, Methods & Social Issues | Acadibo",
    description:
      "Get sociology assignment help with social theory, research methods, and contemporary social issues from verified tutors.",
    ogDescription:
      "Sociology assignment help for social theory, research methods, and contemporary social issues from verified tutors.",
    intro: `Get help connecting sociological theory to observable social phenomena. ${HOW_IT_WORDS}`,
    subtopics: [
      { title: "Social Theory Assignment Help", blurb: "Classical and contemporary theorists explained." },
      { title: "Research Methods Help", blurb: "Surveys, ethnography, interviews, and validity concerns." },
      { title: "Social Issues Assignment Help", blurb: "Inequality, urbanisation, and social policy analysis." },
      { title: "Culture and Identity Help", blurb: "Culture, identity, media, and socialisation." },
      { title: "Demography Help", blurb: "Population trends, migration, and social change." },
    ],
    faqs: [
      { q: "Do you help with research methods?", a: "Yes, covering method choice, sampling, and validity limitations." },
      { q: "Can you explain sociological theory?", a: "Yes, with clear links between theory and concrete examples." },
    ],
  },
  {
    slug: "political-science",
    name: "Political Science",
    group: "Humanities & Liberal Arts",
    icon: "gavel",
    cardDesc: "Political theory, international relations, and public policy",
    h1: "Political Science Assignment Help",
    title: "Political Science Assignment Help | Theory, IR & Policy | Acadibo",
    description:
      "Get political science assignment help with political theory, international relations, comparative politics, and public policy analysis.",
    ogDescription:
      "Political science assignment help for political theory, international relations, comparative politics, and public policy.",
    intro: `Get help with political frameworks, evidence, and policy evaluation. ${HOW_IT_WORDS}`,
    subtopics: [
      { title: "Political Theory Help", blurb: "Classical and modern theories of authority and legitimacy." },
      { title: "International Relations Help", blurb: "Realism, liberalism, institutions, and international systems." },
      { title: "Comparative Politics Help", blurb: "Regime comparison, elections, and political institutions." },
      { title: "Public Policy Help", blurb: "Policy design, implementation, and evaluation frameworks." },
      { title: "Political Economy Help", blurb: "Institutions, distribution, and the interaction of politics and markets." },
    ],
    faqs: [
      { q: "Do you help with IR essays?", a: "Yes, including framework selection and evidence." },
      { q: "Can you help with policy analysis?", a: "Yes, using structured evaluation criteria rather than opinion." },
    ],
  },
  {
    slug: "nursing",
    name: "Nursing",
    group: "Business & Social Sciences",
    icon: "local_hospital",
    cardDesc: "Nursing theory, patient care, pharmacology, and clinical practice",
    h1: "Nursing Assignment Help",
    title: "Nursing Assignment Help | Care Plans, Pharmacology & Theory | Acadibo",
    description:
      "Get nursing assignment help with care plans, pharmacology, nursing theory, evidence-based practice, and clinical reflections from verified tutors.",
    ogDescription:
      "Nursing assignment help for care plans, pharmacology, theory, and clinical practice from verified nursing tutors.",
    intro: `Get support with nursing care plans, pharmacology, and clinical reasoning. ${HOW_IT_WORDS}`,
    subtopics: [
      { title: "Nursing Care Plan Help", blurb: "Assessment, diagnosis, goals, interventions, and evaluation." },
      { title: "Pharmacology Assignment Help", blurb: "Drug classes, mechanisms, side effects, and nursing considerations." },
      { title: "Nursing Theory Help", blurb: "Fawcett, Roy, Orem, and other theoretical frameworks." },
      { title: "Clinical Reflection Help", blurb: "Structuring reflective practice for clinical submissions." },
      { title: "Evidence-Based Practice Help", blurb: "Appraising research and applying it to patient care." },
      { title: "Community Health Help", blurb: "Public health, prevention, and population-level care." },
    ],
    faqs: [
      { q: "Can you help write care plans?", a: "Yes, including assessment, diagnosis, outcomes, and rationales." },
      { q: "Do you help with pharmacology?", a: "Yes, covering drug mechanisms, adverse effects, and nursing responsibilities." },
    ],
  },
];

export const SUBJECT_CONTENT_BY_SLUG = new Map(
  SUBJECT_CONTENT.map((s) => [s.slug, s]),
);

export const SUBJECT_GROUPS = SUBJECT_CONTENT.reduce<
  { category: string; icon: string; subjects: SubjectContent[] }[]
>((groups, subject) => {
  let group = groups.find((g) => g.category === subject.group);
  if (!group) {
    group = { category: subject.group, icon: subject.icon, subjects: [] };
    groups.push(group);
  }
  group.subjects.push(subject);
  return groups;
}, []);