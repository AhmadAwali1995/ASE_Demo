export const locales = ["en", "ar"] as const;

export type Locale = (typeof locales)[number];

export type Copy = {
  en: string;
  ar: string;
};

export function isLocale(value: string): value is Locale {
  return value === "en" || value === "ar";
}

export function pick(copy: Copy, locale: Locale): string {
  return copy[locale];
}

export function localeFromPath(pathname: string | null): Locale {
  return pathname?.startsWith("/ar") ? "ar" : "en";
}

export function swapLocale(pathname: string, locale: Locale): string {
  const rest = pathname.replace(/^\/(en|ar)(?=\/|$)/, "");
  return `/${locale}${rest}`;
}

const messages = {
  en: {
    metaTitle: "ASE Desk",
    metaDescription: "Amman Stock Exchange profit changes and report scores.",
    brand: "ASE Desk",
    exchange: "Amman Stock Exchange",
    watch: "Watch",
    compare: "Compare",
    ai: "AI",
    pages: "Pages",
    language: "Language",
    performanceEyebrow: "Company results",
    performanceTitle: "Annual profit",
    performanceLede: "Published profit change sits next to this year’s closing prices.",
    searchCompanies: "Search companies",
    searchPlaceholder: "Search symbol or company",
    sector: "Sector",
    allSectors: "All sectors",
    sectorPicked: (count: number) => `${count} ${count === 1 ? "sector" : "sectors"}`,
    clearSectors: "Clear",
    filterAll: "All",
    filterProfitDown: "Profit down",
    filterProfitUp: "Profit up",
    filterPrice: "Price this year",
    filterPriceAll: "All prices",
    filterPriceUp: "Price up",
    filterPriceDown: "Price down",
    filterDividend: "Pays a dividend",
    filterSort: "Sort",
    sortProfit: "Profit change",
    sortYear: "Price this year",
    sortScore: "Score",
    companyCount: (count: number) => `${count} ${count === 1 ? "company" : "companies"}`,
    yearSpan: (prior: number | null, year: number) => ` · ${prior ?? "prior"} to ${year}`,
    noFilterMatch: "Nothing matches this filter.",
    selectCompany: "Select a company.",
    watchDisclaimer:
      "Figures are read from the ASE daily bulletin, the 2026 closing-price file, and the companies guides. This is not a recommendation to buy or sell.",
    session: "Session",
    thisYear: "This year",
    profitUpGuide: (pct: string) => `Profit up ${pct} in the latest guide.`,
    profitDownGuide: (pct: string) => `Profit down ${pct} in the latest guide.`,
    profitUnchangedGuide: "Profit unchanged in the latest guide.",
    noProfitChangeGuide: "The latest guide does not publish a profit change.",
    guideFigure: "Guide figure",
    latest: "Latest",
    prior: "Prior",
    change: "Change",
    profit: "Profit",
    profitTrend: "Profit trend",
    returnOnEquity: "Return on equity",
    returnOnAssets: "Return on assets",
    dividendYield: "Dividend yield",
    dividend: "Dividend",
    priceEarnings: "Price / earnings",
    debt: "Debt",
    valuation: "Valuation",
    revenue: "Revenue",
    grossIncome: "Gross income",
    publishedResults: "Published results",
    details: "Details",
    legacyData: "Legacy data",
    hideLegacy: "Close",
    financialReports: "Guide figures",
    statementsTitle: "Financial statements",
    statementsLede:
      "Annual, six-month, and three-month statements the company filed with the ASE. Annual filings are the audited accounts; the auditor’s name is inside the file.",
    statementAnnual: "Annual",
    statementSemi: "Six months",
    statementQuarter: "Three months",
    statementKind: "Statement",
    publishedOn: "Published",
    openPdf: "PDF",
    openExcel: "Excel",
    openXbrl: "XBRL",
    noStatements: "No financial statements are published for this symbol.",
    backToWatch: "Watch",
    loadingStatementsTitle: "Reading the ASE filings",
    loadingStatementsBody: "Annual, six-month, and three-month statements for this company.",
    earlierYears: "Earlier years",
    noReports: "No company guide is published for this symbol.",
    earningsPerShare: "Earnings per share",
    noPriceHistory: "No closing-price history is published for this symbol yet.",
    chartLabel: "Closing price timeline",
    reportsEyebrow: "Published reports",
    reportsTitle: "Scores, with the reasons",
    reportsLede:
      "Each score reads the latest ASE company guide against the year before, then the daily bulletin for dividend yield and price-to-earnings. Select up to three companies to put the reasons side by side.",
    chooseCompanies: "Choose companies from the list below.",
    findCompany: "Find a company",
    findPlaceholder: "Find a company to add",
    company: "Company",
    score: "Score",
    mainReason: "Main reason",
    inComparison: "In comparison",
    notEnough: "Not enough published figures to score.",
    notEnoughOne: "Not enough published figures to score this company.",
    scoreDisclaimer:
      "The score is a reading of published figures, weighted toward return on equity and the profit trend. It is not investment advice.",
    price: "Price",
    profitChange: "Profit change",
    remove: "Remove",
    companyScores: "Company scores",
    filesDidNotLoad: "The ASE files did not load.",
    emptyFiles: "The bulletin and price file came back empty.",
    unknownError: "Unknown error",
    errorNote:
      "Quotes come from the daily bulletin, prices from the yearly closing-price file, and company results from the ASE companies guides.",
    bulletinFailed: (status: string) => `The ASE bulletin returned ${status}.`,
    fileFailed: (status: string) => `An ASE file returned ${status}.`,
    loadingWatchTitle: "Reading the ASE files",
    loadingWatchBody: "Daily bulletin, closing prices, and the last two company guides.",
    loadingCompareTitle: "Scoring the published reports",
    loadingCompareBody: "This uses the same ASE files as the watch page.",
    aiEyebrow: "Placeholder",
    aiTitle: "Suggested companies",
    aiLede:
      "Three companies with the highest published profit in each sector. This is stand-in ranking until the model reads the latest filings. It is not a recommendation to buy or sell.",
    aiDisclaimer:
      "These names are a placeholder, ranked by the latest company-guide profit figure. They are not an AI output and not investment advice.",
    aiBadge: "Virtual pick",
    aiNoPicks: "No published profit figures to rank yet.",
    loadingAiTitle: "Ranking by published profit",
    loadingAiBody: "Stand-in picks from the latest company guides, grouped by sector.",
    indexFallback: "ASE",
  },
  ar: {
    metaTitle: "مكتب البورصة",
    metaDescription: "تغيّر الربح ودرجات التقارير في بورصة عمّان.",
    brand: "ASE Desk",
    exchange: "بورصة عمّان",
    watch: "المتابعة",
    compare: "المقارنة",
    ai: "اقتراح",
    pages: "الصفحات",
    language: "اللغة",
    performanceEyebrow: "نتائج الشركات",
    performanceTitle: "الربح السنوي",
    performanceLede: "تغيّر الربح المنشور يظهر إلى جانب أسعار الإغلاق لهذا العام.",
    searchCompanies: "البحث عن الشركات",
    searchPlaceholder: "ابحث بالرمز أو اسم الشركة",
    sector: "القطاع",
    allSectors: "كل القطاعات",
    sectorPicked: (count: number) => {
      if (count === 1) return "قطاع واحد";
      if (count === 2) return "قطاعان";
      if (count >= 3 && count <= 10) return `${count} قطاعات`;
      return `${count} قطاعاً`;
    },
    clearSectors: "مسح",
    filterAll: "الكل",
    filterProfitDown: "انخفاض الربح",
    filterProfitUp: "ارتفاع الربح",
    filterPrice: "السعر هذا العام",
    filterPriceAll: "كل الأسعار",
    filterPriceUp: "السعر مرتفع",
    filterPriceDown: "السعر منخفض",
    filterDividend: "توزّع أرباحاً",
    filterSort: "الترتيب",
    sortProfit: "تغيّر الربح",
    sortYear: "السعر هذا العام",
    sortScore: "الدرجة",
    companyCount: (count: number) => {
      if (count === 0) return "لا شركات";
      if (count === 1) return "شركة واحدة";
      if (count === 2) return "شركتان";
      if (count >= 3 && count <= 10) return `${count} شركات`;
      return `${count} شركة`;
    },
    yearSpan: (prior: number | null, year: number) => ` · من ${prior ?? "السابق"} إلى ${year}`,
    noFilterMatch: "لا توجد شركة تطابق هذا التصفية.",
    selectCompany: "اختر شركة.",
    watchDisclaimer:
      "الأرقام مأخوذة من النشرة اليومية لبورصة عمّان، وملف أسعار الإغلاق لعام 2026، وأدلة الشركات. ليست توصية بالشراء أو البيع.",
    session: "الجلسة",
    thisYear: "هذا العام",
    profitUpGuide: (pct: string) => `الربح مرتفع ${pct} في أحدث دليل.`,
    profitDownGuide: (pct: string) => `الربح منخفض ${pct} في أحدث دليل.`,
    profitUnchangedGuide: "الربح دون تغيّر في أحدث دليل.",
    noProfitChangeGuide: "لا يُنشر تغيّر للربح في أحدث دليل.",
    guideFigure: "بند الدليل",
    latest: "الأحدث",
    prior: "السابق",
    change: "التغيّر",
    profit: "الربح",
    profitTrend: "اتجاه الربح",
    returnOnEquity: "العائد على حقوق الملكية",
    returnOnAssets: "العائد على الأصول",
    dividendYield: "عائد التوزيع",
    dividend: "التوزيع",
    priceEarnings: "السعر إلى الربح",
    debt: "الدين",
    valuation: "التقييم",
    revenue: "الإيرادات",
    grossIncome: "إجمالي الدخل",
    publishedResults: "النتائج المنشورة",
    details: "التفاصيل",
    legacyData: "بيانات سابقة",
    hideLegacy: "إغلاق",
    financialReports: "أرقام الدليل",
    statementsTitle: "القوائم المالية",
    statementsLede:
      "القوائم السنوية ونصف السنوية والربع سنوية التي أودعتها الشركة لدى بورصة عمّان. السنوية هي الحسابات المدققة، واسم المدقق داخل الملف.",
    statementAnnual: "سنوي",
    statementSemi: "ستة أشهر",
    statementQuarter: "ثلاثة أشهر",
    statementKind: "القائمة",
    publishedOn: "تاريخ النشر",
    openPdf: "PDF",
    openExcel: "Excel",
    openXbrl: "XBRL",
    noStatements: "لا تُنشر قوائم مالية لهذا الرمز.",
    backToWatch: "المتابعة",
    loadingStatementsTitle: "جارٍ قراءة إفصاحات البورصة",
    loadingStatementsBody: "القوائم السنوية ونصف السنوية والربع سنوية لهذه الشركة.",
    earlierYears: "سنوات سابقة",
    noReports: "لا يُنشر دليل لهذه الشركة.",
    earningsPerShare: "الربح للسهم",
    noPriceHistory: "لا يوجد بعد سجل منشور لأسعار إغلاق هذا الرمز.",
    chartLabel: "الخط الزمني لسعر الإغلاق",
    reportsEyebrow: "التقارير المنشورة",
    reportsTitle: "الدرجات مع أسبابها",
    reportsLede:
      "تُقرأ كل درجة من أحدث دليل للشركة مقابل السنة السابقة، ثم من النشرة اليومية لعائد التوزيع ونسبة السعر إلى الربح. اختر حتى ثلاث شركات لتضع الأسباب جنباً إلى جنب.",
    chooseCompanies: "اختر شركات من القائمة أدناه.",
    findCompany: "ابحث عن شركة",
    findPlaceholder: "ابحث عن شركة لإضافتها",
    company: "الشركة",
    score: "الدرجة",
    mainReason: "السبب الأبرز",
    inComparison: "ضمن المقارنة",
    notEnough: "لا تكفي الأرقام المنشورة لمنح درجة.",
    notEnoughOne: "لا تكفي الأرقام المنشورة لمنح هذه الشركة درجة.",
    scoreDisclaimer:
      "الدرجة قراءة للأرقام المنشورة، بوزن أكبر للعائد على حقوق الملكية واتجاه الربح. ليست نصيحة استثمارية.",
    price: "السعر",
    profitChange: "تغيّر الربح",
    remove: "إزالة",
    companyScores: "درجات الشركات",
    filesDidNotLoad: "تعذّر تحميل ملفات البورصة.",
    emptyFiles: "عادت النشرة اليومية وملف الأسعار فارغين.",
    unknownError: "خطأ غير معروف",
    errorNote:
      "الأسعار من النشرة اليومية، والإغلاقات من ملف أسعار السنة، ونتائج الشركات من أدلة بورصة عمّان.",
    bulletinFailed: (status: string) => `أعادت نشرة البورصة الخطأ ${status}.`,
    fileFailed: (status: string) => `أعاد ملف البورصة الخطأ ${status}.`,
    loadingWatchTitle: "جارٍ قراءة ملفات البورصة",
    loadingWatchBody: "النشرة اليومية، وأسعار الإغلاق، وآخر دليلين للشركات.",
    loadingCompareTitle: "جارٍ حساب درجات التقارير",
    loadingCompareBody: "تستخدم ملفات البورصة نفسها المستخدمة في صفحة المتابعة.",
    aiEyebrow: "بيانات مؤقتة",
    aiTitle: "شركات مقترحة",
    aiLede:
      "ثلاث شركات بأعلى ربح منشور في كل قطاع. هذا ترتيب مؤقت إلى أن يقرأ النموذج أحدث الإفصاحات. ليس توصية بالشراء أو البيع.",
    aiDisclaimer:
      "هذه الأسماء مؤقتة، مرتبة حسب رقم الربح في أحدث دليل شركات. ليست ناتج ذكاء اصطناعي وليست نصيحة استثمارية.",
    aiBadge: "اختيار مؤقت",
    aiNoPicks: "لا توجد أرقام ربح منشورة للترتيب بعد.",
    loadingAiTitle: "جارٍ الترتيب حسب الربح المنشور",
    loadingAiBody: "اختيارات مؤقتة من أحدث أدلة الشركات، مجمّعة حسب القطاع.",
    indexFallback: "بورصة عمّان",
  },
};

export type Messages = (typeof messages)["en"];

export { messages };

export function text(locale: Locale): Messages {
  return messages[locale];
}

export function explainError(error: unknown, locale: Locale): string {
  const copy = messages[locale];
  const message = error instanceof Error ? error.message : copy.unknownError;
  const bulletin = message.match(/^ASE bulletin returned (\d+)/);
  if (bulletin) return copy.bulletinFailed(bulletin[1]);
  const file = message.match(/^ASE file returned (\d+)/);
  if (file) return copy.fileFailed(file[1]);
  return message;
}

export function companyName(stock: { name: string; nameAr?: string }, locale: Locale): string {
  const arabic = stock.nameAr?.trim() ?? "";
  if (locale === "ar" && arabic) return arabic;
  return stock.name;
}

const indexes: Record<string, string> = {
  "First market": "السوق الأول",
  "Second market": "السوق الثاني",
  "Third market": "السوق الثالث",
  "ASE General Index": "المؤشر العام",
  "General Index": "المؤشر العام",
};

export function indexLabel(name: string | null, locale: Locale): string {
  if (!name) return messages[locale].indexFallback;
  if (locale === "en" || /[\u0600-\u06FF]/.test(name)) return name;
  if (indexes[name]) return indexes[name];
  if (/ase\s*20/i.test(name)) return "مؤشر ASE20";
  if (/general/i.test(name)) return "المؤشر العام";
  return name;
}

export function revenueText(key: "revenue" | "gross-income", locale: Locale): string {
  return key === "gross-income" ? messages[locale].grossIncome : messages[locale].revenue;
}

const sectors: Record<string, string> = {
  "Listed company": "شركة مدرجة",
  Banks: "البنوك",
  "Commercial Banks": "البنوك التجارية",
  "Islamic Banks": "البنوك الإسلامية",
  Insurance: "التأمين",
  "Financial Services": "الخدمات المالية",
  "Diversified Financial Services": "الخدمات المالية المتنوعة",
  "Real Estate": "العقارات",
  Services: "الخدمات",
  "Educational Services": "الخدمات التعليمية",
  "Hotels and Tourism": "الفنادق والسياحة",
  Transportation: "النقل",
  "Utilities and Energy": "المرافق والطاقة",
  "Commercial Services": "الخدمات التجارية",
  Media: "الإعلام",
  "Technology and Communication": "التكنولوجيا والاتصالات",
  "Health Care Services": "الخدمات الصحية",
  Industry: "الصناعة",
  Industrial: "الصناعة",
  Pharmaceutical: "الأدوية",
  Pharmceutical: "الأدوية",
  "Pharmaceutical and Medical Industries": "الصناعات الدوائية والطبية",
  "Chemical Industries": "الصناعات الكيميائية",
  "Paper and Cardboard Industries": "صناعات الورق والكرتون",
  "Printing and Packaging": "الطباعة والتغليف",
  "Food and Beverages": "الأغذية والمشروبات",
  "Tobacco and Cigarettes": "التبغ والسجائر",
  "Mining and Extraction Industries": "التعدين والاستخراج",
  "Engineering and Construction": "الهندسة والإنشاءات",
  "Engineering and Construction Industries": "صناعات الهندسة والإنشاءات",
  "Commercial Insurance": "التأمين التجاري",
  "Insurance - Takaful": "التأمين التكافلي",
  Energy: "الطاقة",
  Utilities: "المرافق",
  "Mining and Extraction": "التعدين والاستخراج",
  "Electrical Industries": "الصناعات الكهربائية",
  "Textiles, Leathers and Clothing": "النسيج والجلود والملابس",
  "Glass and Ceramic Industries": "صناعات الزجاج والسيراميك",
};

export function sectorLabel(sector: string, locale: Locale): string {
  if (locale === "en") return sector;
  return sector
    .split(" · ")
    .map((part) => sectors[part] ?? part)
    .join(" · ");
}
