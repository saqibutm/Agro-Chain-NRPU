import React, { useState } from 'react'
import { Dimensions, StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'
import Container from '../Abstracts/Container'
import Backward from '../Abstracts/Backward'
import { FontSize } from '../Abstracts/Theme'
import { useI18n } from '../i18n/I18nContext'
import { useAuth } from '../Services/AuthContext'
const { width, height } = Dimensions.get("window");

const GENERAL_FAQS_EN = [
    {
        q: "What is AgroChain?",
        a: "AgroChain is a traceability platform for wheat and sugarcane supply chains in Pakistan. Every step from farm to consumer — batch creation, custody transfers, and quality tests — is recorded in a secure, role-based database with a full audit trail."
    },
    {
        q: "How do I verify a product?",
        a: "Scan the QR code on the product packaging using the QR Scanner in the app. You will see the full journey of the product — farm origin, quality tests, processing, and delivery."
    },
    {
        q: "Can I use the app without an internet connection?",
        a: "Yes. AgroChain works fully offline. Any records you create are saved locally and automatically synced to the server when your connection is restored."
    },
    {
        q: "Who can record supply-chain events?",
        a: "Authorized participants — farmers, labs, mills, and regulators — can record events using their credentials. Consumers can verify products without creating an account."
    },
    {
        q: "What data is stored?",
        a: "Supply-chain events: batch creation, custody transfers, quality test results, and GPS coordinates. Personal information is kept to a minimum and only identifiers required for traceability are recorded."
    },
    {
        q: "Can records be deleted or changed?",
        a: "Once submitted, custody transfers, quality test results, and issue reports can't be edited or deleted — this keeps the audit trail reliable. A batch's status updates automatically as it moves through the supply chain (e.g. picked up, delivered). If something was entered incorrectly, contact support."
    },
    {
        q: "What do the Fraud Alerts mean?",
        a: "The app monitors for anomalies such as unusual weight variances, failed quality tests, or missing custody steps. Alerts are colour-coded: red is high severity, yellow is medium, green is low."
    },
    {
        q: "How do I change the app language?",
        a: "Open Settings (the gear icon on the home screen) and select English or Urdu under the Language section. The change takes effect immediately."
    },
    {
        q: "How do I delete my account?",
        a: "Open Settings and tap Delete Account. Your profile and login are permanently removed; any supply-chain records you created are anonymized (not deleted) to preserve the audit trail for other participants."
    },
];

const ROLE_FAQS_EN = {
    farmer: [
        {
            q: "What unit do I enter my harvest quantity in?",
            a: "Maund. 1 maund = 40 kg. The app converts to kilograms automatically for mills, labs, and consumers downstream — you always enter and see maund on your own screens."
        },
        {
            q: "How do I choose between wheat and sugarcane?",
            a: "The New Batch screen has a crop-type selector. Pick wheat or sugarcane before entering the rest of the batch details — this determines which quality metrics the lab will later test for."
        },
        {
            q: "How do I share or print my batch's QR code?",
            a: "Open the batch's QR code screen and use the Print or Share buttons. The same QR code stays valid for the whole journey — its label just refreshes with the current status (in transit, tested, delivered) at every step."
        },
    ],
    mill: [
        {
            q: "How do I register more than one mill location?",
            a: "Settings for mills include My Mills, where you can add each physical mill location you operate. They then appear as a picker when recording a batch transfer, instead of typing the name each time."
        },
        {
            q: "How do I send a sample to a lab?",
            a: "Use Send Sample, pick a registered lab from the directory, and enter the sample weight — capped at 1kg (1000g), since a sample is a small portion pulled from a much larger batch, not a bulk transfer."
        },
        {
            q: "What happens to the batch after I send a sample?",
            a: "The batch's status moves to Processing. It reappears in the destination lab's pending-samples inbox until they record a quality test against it."
        },
    ],
    lab: [
        {
            q: "What quality metrics do I record?",
            a: "It depends on the batch's crop type, detected automatically: Moisture, Protein, and Gluten for wheat; Brix, Pol, and Purity for sugarcane. You can override the crop type manually if a sample was mislabeled."
        },
        {
            q: "How do I find samples sent to me?",
            a: "Your dashboard's pending-samples inbox lists only samples mills have addressed to your lab specifically, with the batch's variety, quantity, and the date it was sent."
        },
        {
            q: "Can I test an ID that isn't in my pending list?",
            a: "Yes — type or scan the batch/subject ID directly for ad-hoc testing, useful for consumer-reported products or batches outside the formal sample-transfer flow."
        },
    ],
    regulator: [
        {
            q: "What can I see as a regulator?",
            a: "Full oversight visibility: all batches, transfers, quality reports, and fraud alerts across the network, plus the same KPI dashboard other roles see — for monitoring, not day-to-day operations."
        },
        {
            q: "Can I edit or correct a record I find suspicious?",
            a: "No — records are immutable once submitted, by design, so the audit trail stays trustworthy. Use Fraud Alerts to flag anomalies for follow-up outside the app instead."
        },
    ],
    consumer: [
        {
            q: "Do I need an account to scan a product?",
            a: "No. Scanning a QR code and viewing a product's full farm-to-shelf journey works without signing in or creating an account."
        },
        {
            q: "How do I report a problem with a product?",
            a: "Open the product's journey screen (scan its QR code) and tap Report Issue. No account is required."
        },
        {
            q: "What does the quality report on a product mean?",
            a: "It shows the most recent lab test result for that batch — Pass or Fail, a letter grade, and the specific metrics tested (different for wheat vs. sugarcane), plus whether pesticides or aflatoxin were detected."
        },
    ],
};

const GENERAL_FAQS_UR = [
    {
        q: "ایگروچین کیا ہے؟",
        a: "ایگروچین پاکستان میں گندم اور گنے کی سپلائی چین کے لیے ایک ٹریس ایبلٹی پلیٹ فارم ہے۔ کھیت سے صارف تک ہر قدم — بیچ کی تخلیق، تحویل کی منتقلی، اور معیار کے ٹیسٹ — ایک محفوظ، کردار پر مبنی ڈیٹا بیس میں مکمل آڈٹ ٹریل کے ساتھ ریکارڈ ہوتا ہے۔"
    },
    {
        q: "میں کسی پروڈکٹ کی تصدیق کیسے کروں؟",
        a: "پروڈکٹ کی پیکیجنگ پر موجود QR کوڈ کو ایپ کے QR سکینر سے اسکین کریں۔ آپ کو پروڈکٹ کا مکمل سفر نظر آئے گا — کھیت کی اصل، معیار کے ٹیسٹ، پروسیسنگ، اور ترسیل۔"
    },
    {
        q: "کیا میں انٹرنیٹ کنیکشن کے بغیر ایپ استعمال کر سکتا ہوں؟",
        a: "جی ہاں۔ ایگروچین بغیر آن لائن رہے مکمل طور پر کام کرتا ہے۔ آپ کے بنائے گئے ریکارڈ مقامی طور پر محفوظ ہو جاتے ہیں اور کنیکشن بحال ہونے پر خود بخود سرور سے ہم آہنگ ہو جاتے ہیں۔"
    },
    {
        q: "سپلائی چین کے واقعات کون ریکارڈ کر سکتا ہے؟",
        a: "مجاز شرکاء — کسان، لیبز، ملیں، اور ریگولیٹرز — اپنی اسناد سے واقعات ریکارڈ کر سکتے ہیں۔ صارفین بغیر اکاؤنٹ بنائے پروڈکٹ کی تصدیق کر سکتے ہیں۔"
    },
    {
        q: "کیا ڈیٹا محفوظ ہوتا ہے؟",
        a: "سپلائی چین واقعات: بیچ کی تخلیق، تحویل کی منتقلی، معیار کے ٹیسٹ کے نتائج، اور جی پی ایس کوآرڈینیٹس۔"
    },
    {
        q: "کیا ریکارڈز حذف یا تبدیل کیے جا سکتے ہیں؟",
        a: "ایک بار جمع کرانے کے بعد، تحویل کی منتقلی، معیار کے ٹیسٹ کے نتائج، اور مسئلے کی رپورٹس کو تبدیل یا حذف نہیں کیا جا سکتا — اس سے آڈٹ ٹریل قابلِ اعتماد رہتا ہے۔ بیچ کی حیثیت سپلائی چین میں آگے بڑھنے کے ساتھ خود بخود اپ ڈیٹ ہوتی ہے (مثلاً وصولی، ترسیل)۔ اگر کچھ غلط درج ہو گیا ہو تو سپورٹ سے رابطہ کریں۔"
    },
    {
        q: "دھوکہ دہی کی وارننگز کا کیا مطلب ہے؟",
        a: "ایپ غیر معمولی وزن کے فرق، معیار کے ٹیسٹ میں ناکامی، یا تحویل کے مراحل میں خلاء جیسی بے ضابطگیوں پر نظر رکھتی ہے۔"
    },
    {
        q: "میں ایپ کی زبان کیسے تبدیل کروں؟",
        a: "ترتیبات کھولیں اور زبان کے سیکشن میں انگریزی یا اردو منتخب کریں۔ تبدیلی فوری طور پر نافذ ہو جاتی ہے۔"
    },
    {
        q: "میں اپنا اکاؤنٹ کیسے حذف کروں؟",
        a: "ترتیبات کھولیں اور اکاؤنٹ حذف کریں پر ٹیپ کریں۔ آپ کی پروفائل اور لاگ ان مستقل طور پر ہٹا دیے جاتے ہیں؛ آپ کے بنائے گئے سپلائی چین ریکارڈز کو دیگر شرکاء کے آڈٹ ٹریل کے تحفظ کے لیے گمنام کر دیا جاتا ہے (حذف نہیں کیا جاتا)۔"
    },
];

const ROLE_FAQS_UR = {
    farmer: [
        {
            q: "میں اپنی فصل کی مقدار کس اکائی میں درج کروں؟",
            a: "من میں۔ 1 من = 40 کلوگرام۔ ایپ خود بخود آگے ملوں، لیبز، اور صارفین کے لیے کلوگرام میں تبدیل کر دیتی ہے — آپ ہمیشہ اپنی سکرینوں پر من ہی درج اور دیکھتے ہیں۔"
        },
        {
            q: "میں گندم اور گنے میں انتخاب کیسے کروں؟",
            a: "نیا بیچ سکرین پر فصل کی قسم کا انتخاب موجود ہے۔ باقی تفصیلات درج کرنے سے پہلے گندم یا گنا منتخب کریں — یہ طے کرتا ہے کہ لیب بعد میں کون سے معیار کے پیمانے ٹیسٹ کرے گی۔"
        },
        {
            q: "میں اپنے بیچ کا QR کوڈ کیسے شیئر یا پرنٹ کروں؟",
            a: "بیچ کی QR کوڈ سکرین کھولیں اور پرنٹ یا شیئر بٹن استعمال کریں۔ QR کوڈ پورے سفر میں وہی رہتا ہے — بس اس کا لیبل ہر مرحلے پر موجودہ حیثیت کے ساتھ تازہ ہوتا رہتا ہے۔"
        },
    ],
    mill: [
        {
            q: "میں ایک سے زیادہ مل مقامات کیسے رجسٹر کروں؟",
            a: "میری ملیں سیکشن میں آپ اپنی ہر جسمانی مل کا مقام شامل کر سکتے ہیں۔ یہ پھر بیچ کی منتقلی ریکارڈ کرتے وقت ایک فہرست میں دکھائی دیتے ہیں۔"
        },
        {
            q: "میں لیب کو نمونہ کیسے بھیجوں؟",
            a: "نمونہ بھیجیں استعمال کریں، فہرست سے ایک رجسٹرڈ لیب منتخب کریں، اور نمونے کا وزن درج کریں — زیادہ سے زیادہ 1 کلوگرام (1000 گرام)۔"
        },
        {
            q: "نمونہ بھیجنے کے بعد بیچ کا کیا ہوتا ہے؟",
            a: "بیچ کی حیثیت پروسیسنگ میں تبدیل ہو جاتی ہے۔ یہ منزل لیب کے زیرِ التوا نمونوں کی فہرست میں دکھائی دیتا ہے جب تک وہ معیار کا ٹیسٹ ریکارڈ نہ کریں۔"
        },
    ],
    lab: [
        {
            q: "میں کون سے معیار کے پیمانے ریکارڈ کرتی/کرتا ہوں؟",
            a: "یہ بیچ کی فصل کی قسم پر منحصر ہے، جو خود بخود معلوم ہو جاتی ہے: گندم کے لیے نمی، پروٹین، اور گلوٹین؛ گنے کے لیے بریکس، پول، اور خالص پن۔"
        },
        {
            q: "مجھے بھیجے گئے نمونے کہاں ملیں گے؟",
            a: "آپ کے ڈیش بورڈ کی زیرِ التوا نمونوں کی فہرست میں صرف وہ نمونے دکھائے جاتے ہیں جو ملوں نے خاص طور پر آپ کی لیب کو بھیجے ہیں۔"
        },
        {
            q: "کیا میں کسی ایسی شناخت کا ٹیسٹ کر سکتا ہوں جو میری فہرست میں نہیں؟",
            a: "جی ہاں — بیچ/موضوع کی شناخت خود ٹائپ کریں یا اسکین کریں۔"
        },
    ],
    regulator: [
        {
            q: "بطور ریگولیٹر میں کیا دیکھ سکتا ہوں؟",
            a: "مکمل نگرانی کی رسائی: نیٹ ورک بھر کے تمام بیچ، منتقلیاں، معیار کی رپورٹس، اور دھوکہ دہی کی وارننگز، ساتھ ہی وہی KPI ڈیش بورڈ جو دیگر کردار دیکھتے ہیں۔"
        },
        {
            q: "کیا میں کسی مشکوک ریکارڈ کو درست کر سکتا ہوں؟",
            a: "نہیں — ریکارڈز جمع کرانے کے بعد ناقابلِ تبدیل ہوتے ہیں، تاکہ آڈٹ ٹریل قابلِ اعتماد رہے۔ اس کے بجائے دھوکہ دہی کی وارننگز کا سیکشن استعمال کریں۔"
        },
    ],
    consumer: [
        {
            q: "کیا مجھے پروڈکٹ اسکین کرنے کے لیے اکاؤنٹ درکار ہے؟",
            a: "نہیں۔ QR کوڈ اسکین کرنا اور پروڈکٹ کا مکمل سفر دیکھنا بغیر لاگ ان یا اکاؤنٹ بنائے کام کرتا ہے۔"
        },
        {
            q: "میں پروڈکٹ سے متعلق مسئلہ کیسے رپورٹ کروں؟",
            a: "پروڈکٹ کی سفر سکرین کھولیں (اس کا QR کوڈ اسکین کریں) اور مسئلہ رپورٹ کریں پر ٹیپ کریں۔ اکاؤنٹ کی ضرورت نہیں۔"
        },
        {
            q: "پروڈکٹ پر معیار کی رپورٹ کا کیا مطلب ہے؟",
            a: "یہ اس بیچ کے تازہ ترین لیب ٹیسٹ کا نتیجہ دکھاتی ہے — پاس یا فیل، ایک گریڈ، اور ٹیسٹ کیے گئے مخصوص پیمانے (گندم اور گنے کے لیے مختلف)۔"
        },
    ],
};

const FAQItem = ({ item }) => {
    const [open, setOpen] = useState(false);
    return (
        <TouchableOpacity style={styles.item} onPress={() => setOpen(o => !o)} activeOpacity={0.7}>
            <View style={styles.qRow}>
                <Text style={styles.question}>{item.q}</Text>
                <Text style={styles.chevron}>{open ? "▲" : "▼"}</Text>
            </View>
            {open && <Text style={styles.answer}>{item.a}</Text>}
        </TouchableOpacity>
    );
};

const ROLE_LABEL_EN = { farmer: "Farmer", mill: "Mill", lab: "Lab", regulator: "Regulator", consumer: "Consumer" };
const ROLE_LABEL_UR = { farmer: "کسان", mill: "مل", lab: "لیب", regulator: "ریگولیٹر", consumer: "صارف" };

const FAQs = ({ navigation, route }) => {
    const { language, t } = useI18n();
    const { user } = useAuth();
    const isUrdu = language === "ur";
    const role = user?.role;
    const roleLabel = (isUrdu ? ROLE_LABEL_UR : ROLE_LABEL_EN)[role];

    // Two entry points share this screen: each role's Home quick actions
    // pass scope="role" (that role's specific questions only), Settings
    // passes scope="general" (the common questions only). Falls back to
    // general if a screen ever navigates here with no scope.
    const showRole = route?.params?.scope === "role";
    const items = showRole
        ? (isUrdu ? ROLE_FAQS_UR : ROLE_FAQS_EN)[role]
        : (isUrdu ? GENERAL_FAQS_UR : GENERAL_FAQS_EN);
    const title = showRole && roleLabel ? `${roleLabel} ${t("faqs")}` : t("faqs");

    return (
        <Container style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Backward onPress={() => navigation.goBack()} />
                <Text style={styles.headText}>{title}</Text>
            </View>
            <ScrollView style={{ marginTop: height * 0.01 }} showsVerticalScrollIndicator={false}>
                {(items || []).map((item, i) => <FAQItem key={i} item={item} />)}
                <View style={{ height: height * 0.05 }} />
            </ScrollView>
        </Container>
    )
}

const styles = StyleSheet.create({
    headText: {
        fontSize: FontSize.F26,
        fontWeight: "bold",
        textAlign: "center",
        marginVertical: height * 0.04,
        flex: 1,
    },
    item: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#ccc",
        paddingVertical: height * 0.018,
        paddingHorizontal: 4,
    },
    qRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    question: {
        fontSize: FontSize.F16,
        fontWeight: "600",
        color: "#1a1a1a",
        flex: 1,
        paddingRight: 8,
    },
    chevron: {
        fontSize: 12,
        color: "green",
    },
    answer: {
        marginTop: height * 0.01,
        fontSize: FontSize.F15,
        color: "#555",
        lineHeight: FontSize.F15 * 1.6,
    },
})

export default FAQs
