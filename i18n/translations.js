// Translation strings. Keys are shared across languages; add a key to BOTH
// dictionaries when introducing new UI text. Urdu is the primary local language.
export const translations = {
  en: {
    // App
    appName: "AgroChain",
    login: "Login",
    username: "Username",
    password: "Password",
    forgotPassword: "Forgot Password?",
    submit: "Submit",
    signingIn: "Signing in…",
    enterCredentials: "Please enter your username and password.",
    loginFailed: "Login failed",

    // Commodities / agriculture
    wheat: "Wheat",
    sugar: "Sugar",
    sugarcane: "Sugarcane",
    harvestDate: "Harvest Date",
    sowingDate: "Sowing Date",
    district: "District",
    variety: "Variety",

    // Roles / home
    farmer: "Farmer",
    cropProduced: "Crop Produced",
    camera: "Camera",
    qrScanner: "QR Scanner",
    faqs: "FAQs",

    // Dashboard KPIs
    dashboard: "Dashboard",
    batchesCreated: "Batches Created",
    inTransit: "In Transit",
    delivered: "Delivered",
    earnings: "Earnings",
    quickActions: "Quick Actions",
    newBatch: "New Batch",
    recentActivity: "Recent Activity",
    fraudAlerts: "Fraud Alerts",
    passRate: "Quality Pass Rate",
    qualityFlags: "Quality Flags",

    // Crop form
    cropId: "Crop ID",
    address: "Address",
    batchNumber: "Batch Number",
    productionDate: "Production Date",
    addCrop: "Add Crop",

    // Farmer / Mill forms
    addFarmer: "Add Farmer",
    farmerId: "Farmer ID",
    addFarmerValidation: "Add Farmer Validation",
    addCropValidation: "Add Crop Validation",
    addMill: "Add Mill",
    millName: "Mill Name",
    millId: "Mill ID",
    location: "Location",
    quantityReceived: "Quantity Received",
    expiryDate: "Expiry Date",
    validMill: "Valid Mill",

    // Quality report
    moisture: "Moisture",
    protein: "Protein",
    gluten: "Gluten",
    pesticides: "Pesticides",
    aflatoxin: "Aflatoxin",
    detected: "Detected",
    none: "None",
    noQualityReport: "No quality report available yet",
    testedBy: "Tested by",

    // Lab dashboard
    labDashboard: "Lab Dashboard",
    recordQualityTest: "Record Quality Test",
    reportId: "Report ID",
    subjectId: "Batch / Product ID",
    labId: "Lab ID",
    testDate: "Test Date",
    grade: "Grade",
    result: "Result",
    pass: "Pass",
    fail: "Fail",
    save: "Save Report",
    qualityRecorded: "Quality report recorded on the blockchain.",
    fillRequired: "Report ID and Batch/Product ID are required.",

    // Sync
    offline: "Offline",
    syncing: "Syncing…",
    pendingChanges: "changes pending",
    tapToSync: "Tap to sync",
    savedOffline: "Saved offline",

    // Consumer trust
    verifiedOnBlockchain: "Verified on Blockchain",
    productJourney: "Product Journey",
    qualityReport: "Quality Report",
    reportIssue: "Report Issue",
    farmOrigin: "Farm Origin",
    passed: "Passed",
    failed: "Failed",
    viewOnMap: "View Route on Map",
    noLocationData: "No GPS location data recorded",

    // Supply chain tracking
    supplyChainTracking: "Supply Chain Tracking",
    companyName: "Company Name",
    date: "Date",
    loading: "Loading…",
    noData: "No records found",

    // Settings
    settings: "Settings",
    language: "Language",
    contactUs: "Contact Us",
    logout: "Logout",
    english: "English",
    urdu: "اردو",

    // About / Acknowledgment
    about: "About",
    projectAcknowledgment: "Project Acknowledgment",
    fundingAgency: "Funding Agency",
    hostInstitution: "Host Institution",
    projectNumber: "NRPU Project No.",
  },
  ur: {
    // App
    appName: "ایگروچین",
    login: "لاگ ان",
    username: "صارف نام",
    password: "پاس ورڈ",
    forgotPassword: "پاس ورڈ بھول گئے؟",
    submit: "جمع کریں",
    signingIn: "سائن ان ہو رہا ہے…",
    enterCredentials: "براہ کرم اپنا صارف نام اور پاس ورڈ درج کریں۔",
    loginFailed: "لاگ ان ناکام",

    // Commodities / agriculture
    wheat: "گندم",
    sugar: "چینی",
    sugarcane: "گنا",
    harvestDate: "تاریخ برداشت",
    sowingDate: "تاریخِ کاشت",
    district: "ضلع",
    variety: "قسم",

    // Roles / home
    farmer: "کسان",
    cropProduced: "فصل کی پیداوار",
    camera: "کیمرہ",
    qrScanner: "کیو آر سکینر",
    faqs: "عمومی سوالات",

    // Dashboard KPIs
    dashboard: "ڈیش بورڈ",
    batchesCreated: "بنائے گئے بیچ",
    inTransit: "راستے میں",
    delivered: "پہنچا دیا گیا",
    earnings: "آمدنی",
    quickActions: "فوری اقدامات",
    newBatch: "نیا بیچ",
    recentActivity: "حالیہ سرگرمی",
    fraudAlerts: "دھوکہ دہی کی وارننگ",
    passRate: "معیار کی کامیابی کی شرح",
    qualityFlags: "معیار کی وارننگز",

    // Crop form
    cropId: "فصل کی شناخت",
    address: "پتہ",
    batchNumber: "بیچ نمبر",
    productionDate: "پیداوار کی تاریخ",
    addCrop: "فصل شامل کریں",

    // Farmer / Mill forms
    addFarmer: "کسان شامل کریں",
    farmerId: "کسان کی شناخت",
    addFarmerValidation: "کسان کی تصدیق",
    addCropValidation: "فصل کی تصدیق",
    addMill: "مل شامل کریں",
    millName: "مل کا نام",
    millId: "مل کی شناخت",
    location: "مقام",
    quantityReceived: "موصول شدہ مقدار",
    expiryDate: "میعاد ختم ہونے کی تاریخ",
    validMill: "تصدیق شدہ مل",

    // Quality report
    moisture: "نمی",
    protein: "پروٹین",
    gluten: "گلوٹین",
    pesticides: "کیڑے مار ادویات",
    aflatoxin: "افلاٹاکسن",
    detected: "پایا گیا",
    none: "کوئی نہیں",
    noQualityReport: "ابھی تک کوئی معیار کی رپورٹ دستیاب نہیں",
    testedBy: "ٹیسٹ کرنے والا",

    // Lab dashboard
    labDashboard: "لیب ڈیش بورڈ",
    recordQualityTest: "معیار ٹیسٹ ریکارڈ کریں",
    reportId: "رپورٹ کی شناخت",
    subjectId: "بیچ / پروڈکٹ شناخت",
    labId: "لیب کی شناخت",
    testDate: "ٹیسٹ کی تاریخ",
    grade: "درجہ",
    result: "نتیجہ",
    pass: "کامیاب",
    fail: "ناکام",
    save: "رپورٹ محفوظ کریں",
    qualityRecorded: "معیار کی رپورٹ بلاک چین پر ریکارڈ ہو گئی۔",
    fillRequired: "رپورٹ کی شناخت اور بیچ/پروڈکٹ شناخت ضروری ہیں۔",

    // Sync
    offline: "آف لائن",
    syncing: "ہم آہنگی ہو رہی ہے…",
    pendingChanges: "تبدیلیاں زیر التواء",
    tapToSync: "ہم آہنگ کرنے کے لیے دبائیں",
    savedOffline: "آف لائن محفوظ ہو گیا",

    // Consumer trust
    verifiedOnBlockchain: "بلاک چین پر تصدیق شدہ",
    productJourney: "پروڈکٹ کا سفر",
    qualityReport: "معیار کی رپورٹ",
    reportIssue: "مسئلہ رپورٹ کریں",
    farmOrigin: "کھیت کی اصل",
    passed: "کامیاب",
    failed: "ناکام",
    viewOnMap: "نقشے پر راستہ دیکھیں",
    noLocationData: "کوئی جی پی ایس مقام ریکارڈ نہیں ہوا",

    // Supply chain tracking
    supplyChainTracking: "سپلائی چین ٹریکنگ",
    companyName: "کمپنی کا نام",
    date: "تاریخ",
    loading: "لوڈ ہو رہا ہے…",
    noData: "کوئی ریکارڈ نہیں ملا",

    // Settings
    settings: "ترتیبات",
    language: "زبان",
    contactUs: "ہم سے رابطہ کریں",
    logout: "لاگ آؤٹ",
    english: "English",
    urdu: "اردو",

    // About / Acknowledgment
    about: "تعارف",
    projectAcknowledgment: "پروجیکٹ کا اعتراف",
    fundingAgency: "فنڈنگ ادارہ",
    hostInstitution: "میزبان ادارہ",
    projectNumber: "این آر پی یو پروجیکٹ نمبر",
  },
};
