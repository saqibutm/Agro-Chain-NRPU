// Translation strings. Keys are shared across languages; add a key to BOTH
// dictionaries when introducing new UI text. Urdu is the primary local language.
export const translations = {
  en: {
    // App
    appName: "AgroChain",
    login: "Login",
    mobileNumber: "Mobile Number",
    password: "Password",
    forgotPassword: "Forgot Password?",
    submit: "Submit",
    signingIn: "Signing in…",
    enterCredentials: "Please enter your mobile number and password.",
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
    qualityRecorded: "Quality report recorded.",
    fillRequired: "Report ID and Batch/Product ID are required.",

    // Sync
    offline: "Offline",
    syncing: "Syncing…",
    pendingChanges: "changes pending",
    tapToSync: "Tap to sync",
    savedOffline: "Saved offline",

    // Consumer trust
    verifiedOnBlockchain: "Verified Record",
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
    contactUs: "Contact Us (Email)",
    contactWhatsapp: "Contact Us (WhatsApp)",
    logout: "Logout",
    english: "English",
    urdu: "اردو",

    // About / Acknowledgment
    about: "About",
    projectAcknowledgment: "Project Acknowledgment",
    fundingAgency: "Funding Agency",
    hostInstitution: "Host Institution",
    projectNumber: "NRPU Project No.",

    // Transaction history
    transactionHistory: "Transaction History",
    batchId: "Batch ID",
    farmerName: "Farmer",
    cropName: "Crop Name",
    lastSynced: "Last synced",
    quantity: "Quantity",

    // Validation / confirmation
    confirm: "Confirm",
    missingFields: "Missing fields",
    farmerRegistered: "Farmer registered.",
    millBatchReceived: "Batch transferred to mill.",
    millConfirmed: "Mill ID recorded. Processing complete.",
    fillNumericFields: "At least one of Moisture, Protein, or Gluten is required.",
    offlineQueue: "No connection — your record was queued and will sync automatically.",

    // Product detail
    productDetails: "Product Details",
    noProduct: "Product not found",

    // Roles
    selectRole: "Select Role",
    roleMill: "Mill Operator",
    roleLab: "Lab Technician",
    roleRegulator: "Regulator",
    roleConsumer: "Consumer",
    // Sign up
    signUp: "Sign Up",
    createAccount: "Create Account",
    confirmPassword: "Confirm Password",
    passwordMismatch: "Passwords do not match",
    accountCreated: "Account Created",
    alreadyHaveAccount: "Already have an account?",
    noAccount: "Don't have an account?",
    signingUp: "Creating account…",
    passwordTooShort: "Password must be at least 6 characters.",
    invalidMobileNumber: "Enter an 11-digit mobile number starting with 0 (e.g. 03001234567).",
  },
  ur: {
    // App
    appName: "ایگروچین",
    login: "لاگ ان",
    mobileNumber: "موبائل نمبر",
    password: "پاس ورڈ",
    forgotPassword: "پاس ورڈ بھول گئے؟",
    submit: "جمع کریں",
    signingIn: "سائن ان ہو رہا ہے…",
    enterCredentials: "براہ کرم اپنا موبائل نمبر اور پاس ورڈ درج کریں۔",
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
    qualityRecorded: "معیار کی رپورٹ ریکارڈ ہو گئی۔",
    fillRequired: "رپورٹ کی شناخت اور بیچ/پروڈکٹ شناخت ضروری ہیں۔",

    // Sync
    offline: "آف لائن",
    syncing: "ہم آہنگی ہو رہی ہے…",
    pendingChanges: "تبدیلیاں زیر التواء",
    tapToSync: "ہم آہنگ کرنے کے لیے دبائیں",
    savedOffline: "آف لائن محفوظ ہو گیا",

    // Consumer trust
    verifiedOnBlockchain: "تصدیق شدہ ریکارڈ",
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
    contactUs: "ہم سے رابطہ کریں (ای میل)",
    contactWhatsapp: "ہم سے رابطہ کریں (واٹس ایپ)",
    logout: "لاگ آؤٹ",
    english: "English",
    urdu: "اردو",

    // About / Acknowledgment
    about: "تعارف",
    projectAcknowledgment: "پروجیکٹ کا اعتراف",
    fundingAgency: "فنڈنگ ادارہ",
    hostInstitution: "میزبان ادارہ",
    projectNumber: "این آر پی یو پروجیکٹ نمبر",

    // Transaction history
    transactionHistory: "لین دین کی تاریخ",
    batchId: "بیچ شناخت",
    farmerName: "کسان",
    cropName: "فصل کا نام",
    lastSynced: "آخری ہم آہنگی",
    quantity: "مقدار",

    // Validation / confirmation
    confirm: "تصدیق کریں",
    missingFields: "لازمی خانے",
    farmerRegistered: "کسان ریکارڈ ہو گیا۔",
    millBatchReceived: "بیچ مل کو منتقل ہو گیا۔",
    millConfirmed: "مل شناخت ریکارڈ ہو گئی۔ پروسیسنگ مکمل۔",
    fillNumericFields: "نمی، پروٹین، یا گلوٹین میں سے کم از کم ایک ضروری ہے۔",
    offlineQueue: "کنیکشن نہیں — آپ کا ریکارڈ محفوظ ہو گیا اور خود بخود ہم آہنگ ہو جائے گا۔",

    // Product detail
    productDetails: "پروڈکٹ کی تفصیل",
    noProduct: "پروڈکٹ نہیں ملا",

    // Roles
    selectRole: "کردار منتخب کریں",
    roleMill: "مل آپریٹر",
    roleLab: "لیب ٹیکنیشن",
    roleRegulator: "ریگولیٹر",
    roleConsumer: "صارف",
    // Sign up
    signUp: "سائن اپ",
    createAccount: "اکاؤنٹ بنائیں",
    confirmPassword: "پاس ورڈ کی تصدیق",
    passwordMismatch: "پاس ورڈ مماثل نہیں",
    accountCreated: "اکاؤنٹ بنایا گیا",
    alreadyHaveAccount: "پہلے سے اکاؤنٹ ہے؟",
    noAccount: "اکاؤنٹ نہیں ہے؟",
    signingUp: "اکاؤنٹ بن رہا ہے…",
    passwordTooShort: "پاس ورڈ کم از کم 6 حروف کا ہونا چاہیے۔",
    invalidMobileNumber: "11 ہندسوں کا موبائل نمبر درج کریں جو 0 سے شروع ہو (مثال: 03001234567)۔",
  },
};
