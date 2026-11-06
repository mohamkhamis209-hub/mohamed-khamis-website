/**
 * Authentic Projects and Experiments by Mohamed Khamis
 * Truthful status markers: No fabricated claims or fake live metrics.
 */

export const INITIAL_PROJECTS = [
  {
    id: 'moja-lang',
    slug: 'moja-mj-language',
    titleAr: 'MOJA / MJ — لغة برمجة ومحرك تفسير',
    titleEn: 'MOJA / MJ — Arabic Programming Language & Interpreter',
    stage: 'experimental',
    stageAr: 'مشروع تجريبي وبحثي قيد التطوير',
    stageEn: 'Experimental Research & Development',
    badgeClass: 'badge-warning',
    shortDescAr: 'مشروع لغة برمجة عربية مستقلة ومحرك تفسير مكتوب بلغة Rust، مصحوبة ببيئة تطوير متخصصة MJ Studio.',
    shortDescEn: 'An independent Arabic programming language and bytecode interpreter built in Rust, accompanied by the MJ Studio IDE environment.',
    descriptionAr: 'مشروع تقني وبحثي طموح يهدف إلى بناء لغة برمجة تدعم النحو العربي مع الحفاظ على الأداء العالي ومفاهيم هندسة البرمجيات الحديثة. تم بناء المعالج المعجمي (Lexer) والمحلل اللغوي (Parser) ومحرك التفسير باستخدام لغة Rust للاستفادة من أمان الذاكرة والسرعة الفائقة، وتطوير بيئة MJ Studio لتقديم تجربة تحرير مريحة للمطورين.',
    descriptionEn: 'An ambitious system-level project crafting an independent programming language tailored for Arabic syntax while retaining high runtime performance. Built in Rust for robust memory safety and execution speed, featuring custom lexer/parser modules and an integrated MJ Studio IDE workspace.',
    technologies: ['Rust', 'Compiler Design', 'System Programming', 'MJ Studio', 'AST'],
    category: 'systems',
    featured: true,
    coverUrl: 'assets/images/project-moja.svg',
    links: {
      github: '',
      demo: ''
    },
    highlightsAr: [
      'محرك تفسير Lexer & Parser مكتوب بلغة Rust للأداء الفائق',
      'دعم بنية الجمل البرمجية العربية بدقة منطقية',
      'بيئة تطوير متكاملة MJ Studio قيد التجربة والتحديث',
      'بحث تطبيقي في أمان الذاكرة ومعالجة الرموز اللغوية'
    ],
    highlightsEn: [
      'High-performance custom Lexer & Parser built in Rust',
      'Native Arabic grammar syntax with strict logical evaluation',
      'Experimental integrated development environment: MJ Studio',
      'System-level research into memory safety & token parsing'
    ]
  },
  {
    id: 'qesma-network',
    slug: 'qesma-network-quotas',
    titleAr: 'QESMA — قسمة لإدارة وتوزيع حصص الإنترنت',
    titleEn: 'QESMA — Internet Quota Distribution & Management',
    stage: 'in_development',
    stageAr: 'مرحلة الإعداد والنمذجة والتطوير',
    stageEn: 'In Preparation & Prototype Phase',
    badgeClass: 'badge-info',
    shortDescAr: 'نظام رقمي لإدارة وتوزيع حصص باقات الإنترنت للشبكات المحلية اعتماداً على Firebase.',
    shortDescEn: 'A network quota allocation and management system for local bandwidth distribution, powered by Firebase.',
    descriptionAr: 'حل تقني مخصص لحل مشكلات توزيع الحصص العادلة لاستهلاك الإنترنت في الشبكات المشتركة. يعتمد النظام على Firebase لمزامنة حالات الاستهلاك وحساب الباقات لكل مستخدم لحظياً، وما زال المشروع ضمن مراحل الإعداد الهندسي والتطوير والاختبار التجريبي.',
    descriptionEn: 'A practical utility system designed to ensure fair-share internet bandwidth distribution across shared networks. Backed by Firebase for low-latency state synchronization and real-time consumption auditing, currently undergoing active architectural prototyping.',
    technologies: ['Firebase', 'Firestore', 'JavaScript', 'Networking', 'Realtime Sync'],
    category: 'systems',
    featured: true,
    coverUrl: 'assets/images/project-qesma.svg',
    links: {
      github: '',
      demo: ''
    },
    highlightsAr: [
      'مزامنة فورية لاستهلاك المستخدمين عبر Firestore',
      'نموذج حسابي مرن لتوزيع الحصص والسرعات',
      'لوحة مراقبة لمسؤولي الشبكة',
      'تحت الاختبار البرمجي المستمر للربط الشبكي'
    ],
    highlightsEn: [
      'Real-time user quota metering backed by Firestore',
      'Dynamic allocation algorithm for balanced bandwidth',
      'Network administrator oversight console',
      'Undergoing active network integration testing'
    ]
  },
  {
    id: 'mizoma-ai',
    slug: 'mizoma-ai-assistant',
    titleAr: 'Mizoma AI — المساعد الذكي التفاعلي',
    titleEn: 'Mizoma AI — Intelligent Conversational Assistant',
    stage: 'prototype',
    stageAr: 'نموذج أولي وتجربة Backend فعالة',
    stageEn: 'Functional Prototype & Backend Experiment',
    badgeClass: 'badge-accent',
    shortDescAr: 'مشروع مساعد ذكاء اصطناعي تفاعلي مع واجهة خلفية Backend باستخدام Python وFastAPI ونموذج Gemini.',
    shortDescEn: 'An intelligent AI assistant featuring a high-speed Python/FastAPI backend integrated with Google Gemini.',
    descriptionAr: 'تجربة تقنية لبناء مساعد ذكي قادر على فهم التعليمات المعقدة وتقديم إجابات متناسقة. تم تصميم واجهة الخدمة الخلفية باستخدام Python وإطار العمل السريع FastAPI للتواصل مع واجهة برمجة تطبيقات Gemini API، مع تطبيق آليات معالجة وتدفق الردود الذكية وتأمين مفاتيح الاستدعاء.',
    descriptionEn: 'A hands-on AI engineering experiment creating a responsive digital assistant. Architected with Python and FastAPI for low-latency asynchronous API bridging to Google Gemini models, implementing secure token relaying and conversational state handling.',
    technologies: ['Python', 'FastAPI', 'Gemini API', 'AI Integration', 'REST APIs'],
    category: 'ai',
    featured: true,
    coverUrl: 'assets/images/project-mizoma.svg',
    links: {
      github: '',
      demo: ''
    },
    highlightsAr: [
      'خادم Backend غير متزامن فائق السرعة عبر FastAPI',
      'ربط مباشر مع نموذج Google Gemini لمعالجة اللغات الطبيعية',
      'فهم متقدم للمحادثات العربية والإنجليزية',
      'بنية تحتية مهيأة للربط مع واجهات متعددة'
    ],
    highlightsEn: [
      'High-speed asynchronous Python backend with FastAPI',
      'Direct Google Gemini API integration for natural reasoning',
      'Bilingual Arabic & English conversational awareness',
      'Modular architecture ready for multi-client consumption'
    ]
  },
  {
    id: 'manasati-lms',
    slug: 'manasati-educational-platform',
    titleAr: 'منصتك التعليمية — المنظومة التدريسية المتكاملة',
    titleEn: 'Manasati — Comprehensive Educational Platform',
    stage: 'in_development',
    stageAr: 'مرحلة التطوير والتجهيز',
    stageEn: 'In Active Development & Staging',
    badgeClass: 'badge-info',
    shortDescAr: 'مشروع منصة شاملة لإدارة العملية التعليمية والدورات والمحاضرات والكتب والاختبارات التفاعلية.',
    shortDescEn: 'A comprehensive educational management platform for video courses, lectures, digital books, and interactive exams.',
    descriptionAr: 'مشروع واسع النطاق يهدف إلى تقديم تجربة تعليمية سلسة للمحاضرين والطلاب. يشتمل على هيكل تنظيمي لتصنيف المواد الدراسية، رفع الكتب والملخصات، إدارة بنوك الأسئلة وإجراء الاختبارات مع التصحيح الفوري وإصدار تقارير الأداء.',
    descriptionEn: 'An extensive platform designed to streamline digital learning for tutors and students. Incorporates hierarchical course taxonomies, digital library modules, randomized exam banks with automated grading, and comprehensive student report cards.',
    technologies: ['Web Development', 'JavaScript', 'Database Architecture', 'LMS', 'Responsive UI'],
    category: 'education',
    featured: true,
    coverUrl: 'assets/images/project-manasati.svg',
    links: {
      github: '',
      demo: ''
    },
    highlightsAr: [
      'نظام منظم لإدارة المحاضرات المرئية والملفات التعليمية',
      'محرك اختبارات تفاعلي يدعم الاختيار من متعدد وتحديد الوقت',
      'مكتبة رقمية للمذكرات والكتب بصيغة PDF',
      'لوحة تحكم للمحاضر لمتابعة نتائج الطلاب بدقة'
    ],
    highlightsEn: [
      'Structured catalog for video lectures and lecture notes',
      'Interactive timed exam engine with instantaneous grading',
      'Digital library module for student PDF resources',
      'Instructor dashboard for tracking grade distributions'
    ]
  },
  {
    id: 'zoma-student',
    slug: 'zoma-student-platform',
    titleAr: 'ZOMA Student — منصة متابعة شؤون الطلاب',
    titleEn: 'ZOMA Student — Academic & Study Companion',
    stage: 'in_development',
    stageAr: 'قيد التطوير والتخطيط',
    stageEn: 'In Development & Planning',
    badgeClass: 'badge-info',
    shortDescAr: 'مشروع منصة تعليمية موجهة لمساعدة الطلاب على تنظيم الجداول الدراسية والمهام والمتابعة اليومية.',
    shortDescEn: 'An educational companion platform engineered to help students organize study schedules and academic tasks.',
    descriptionAr: 'منصة مصممة خصيصاً لتلبية احتياجات الطالب الأكاديمية والتنظيمية. تتيح ترتيب جدول المذاكرة، جدولة المواعيد، استعراض المناهج، وتلقي التنبيهات حول مواعيد التسليم والاختبارات القادمة في واجهة مستخدم مريحة للعين ومحفزة للإنتاجية.',
    descriptionEn: 'A student-centric digital companion aimed at structuring daily study schedules, tracking curriculum milestones, logging assignment deadlines, and boosting focus with an ergonomic, distraction-free interface.',
    technologies: ['Frontend Architecture', 'User Experience (UX)', 'Database Design', 'PWA'],
    category: 'education',
    featured: false,
    coverUrl: 'assets/images/project-zoma.svg',
    links: {
      github: '',
      demo: ''
    },
    highlightsAr: [
      'واجهة مستخدم تركز على البساطة والوضوح للحد من التشتت',
      'متابعة الإنجاز اليومي والمهام الدراسية',
      'تنبيهات مخصصة لمواعيد المراجعة والاختبارات',
      'تصميم متجاوب بالكامل مع شاشات الهواتف المحمولة'
    ],
    highlightsEn: [
      'Distraction-free ergonomics prioritizing student focus',
      'Daily milestone tracking and homework logging',
      'Contextual reminders for upcoming exams & revisions',
      'Full responsive adaptation across smartphones & tablets'
    ]
  }
];
