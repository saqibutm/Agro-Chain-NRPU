import React, { useState } from 'react'
import { Dimensions, StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'
import Container from '../Abstracts/Container'
import Backward from '../Abstracts/Backward'
import { FontSize } from '../Abstracts/Theme'
import { useI18n } from '../i18n/I18nContext'
const { width, height } = Dimensions.get("window");

const FAQS_EN = [
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
];

const FAQS_UR = [
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
];

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

const FAQs = ({ navigation }) => {
    const { language } = useI18n();
    const items = language === "ur" ? FAQS_UR : FAQS_EN;

    return (
        <Container style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Backward onPress={() => navigation.goBack()} />
                <Text style={styles.headText}>FAQs</Text>
            </View>
            <ScrollView style={{ marginTop: height * 0.01 }} showsVerticalScrollIndicator={false}>
                {items.map((item, i) => <FAQItem key={i} item={item} />)}
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
