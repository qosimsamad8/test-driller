
/* ===================== TEST DEALER: ONE FILE ===================== */
const C = {
  PORT: 3000,
  MONGO_URI: "placeholder",
  JWT_SECRET: "placeholder",
  ADMIN_KEY: "placeholder",
  PAYSTACK_SECRET_KEY: "placeholder",
  BASE_URL: "http://localhost:3000",
  FREE_LIMIT: 5,
  SMTP_HOST: "smtp.gmail.com",
  SMTP_PORT: 587,
  SMTP_USER: "placeholder",
  SMTP_PASS: "placeholder",
  MAIL_FROM: "Test Dealer <placeholder@example.com>",
  ANTHROPIC_API_KEY: "placeholder",
};
for (const k in C) if (process.env[k]) C[k] = process.env[k]; // Render's Environment values override the above

const crypto = require("crypto");
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");
const { Schema } = mongoose;

/* ---------- Starter questions: [question, [options], correctIndex (from 0), solution] ---------- */
const BANK = {
"Use of English": [
 ["Choose the option opposite in meaning to 'benevolent'.", ["Kind","Generous","Malicious","Charitable"], 2, "Benevolent means kind and well-meaning. Malicious means intending harm, so it is the opposite. Answer: C"],
 ["Neither the teacher nor the students ___ present.", ["was","were","is","has been"], 1, "With 'neither...nor', the verb agrees with the nearer subject, 'students' (plural), so 'were'. Answer: B"],
 ["'To kick the bucket' means to", ["die","fight","escape","fail"], 0, "It is an idiom meaning to die. Answer: A"],
 ["Choose the option nearest in meaning to 'ephemeral'.", ["lasting","short-lived","ancient","powerful"], 1, "Ephemeral means lasting for a very short time. Answer: B"],
 ["The plural of 'phenomenon' is", ["phenomenons","phenomena","phenomenas","phenomenae"], 1, "'Phenomenon' comes from Greek and forms its plural as 'phenomena'. Answer: B"]
],
"Mathematics": [
 ["Solve 3x − 7 = 11.", ["4","5","6","7"], 2, "3x = 11 + 7 = 18, so x = 18 ÷ 3 = 6. Answer: C"],
 ["Find the value of log₂ 32.", ["3","4","5","6"], 2, "2⁵ = 32, so log₂ 32 = 5. Answer: C"],
 ["The gradient of the line 2y = 6x + 4 is", ["2","3","4","6"], 1, "Divide by 2: y = 3x + 2. The gradient is the coefficient of x, which is 3. Answer: B"],
 ["The sides of a right-angled triangle are 3 cm and 4 cm. The hypotenuse is", ["5 cm","6 cm","7 cm","12 cm"], 0, "h² = 3² + 4² = 9 + 16 = 25, so h = 5 cm. Answer: A"],
 ["Simplify (x²)³ ÷ x⁴.", ["x²","x³","x⁴","x⁶"], 0, "(x²)³ = x⁶. Then x⁶ ÷ x⁴ = x⁶⁻⁴ = x². Answer: A"]
],
"Further Mathematics": [
 ["Differentiate y = 5x³ with respect to x.", ["5x²","15x²","15x³","3x²"], 1, "Multiply by the power and reduce it by 1: 5 × 3 × x² = 15x². Answer: B"],
 ["Find ∫ 4x dx.", ["2x² + C","4x² + C","x² + C","4 + C"], 0, "Add 1 to the power and divide by it: 4x²/2 = 2x² + C. Answer: A"],
 ["The determinant of the matrix with rows (2, 3) and (1, 4) is", ["5","8","11","−5"], 0, "Determinant = (2 × 4) − (3 × 1) = 8 − 3 = 5. Answer: A"],
 ["The sum of the first 10 terms of the AP 2, 4, 6, ... is", ["100","110","120","55"], 1, "S = n/2 [2a + (n−1)d] = 5 [4 + 18] = 5 × 22 = 110. Answer: B"],
 ["The number of ways of arranging the letters of the word 'CAT' is", ["3","6","9","12"], 1, "Three different letters can be arranged in 3! = 3 × 2 × 1 = 6 ways. Answer: B"]
],
"Physics": [
 ["The SI unit of power is", ["Joule","Watt","Newton","Pascal"], 1, "Power is energy per second, measured in watts (1 W = 1 J/s). Answer: B"],
 ["A car accelerates uniformly from rest to 20 m/s in 5 s. Its acceleration is", ["2 m/s²","4 m/s²","5 m/s²","100 m/s²"], 1, "a = (v − u)/t = (20 − 0)/5 = 4 m/s². Answer: B"],
 ["Which of these is a scalar quantity?", ["Force","Velocity","Displacement","Energy"], 3, "Energy has magnitude only, no direction. The others are vectors. Answer: D"],
 ["Ohm's law states that V equals", ["IR","I/R","R/I","I²R"], 0, "At constant temperature, voltage is proportional to current: V = IR. Answer: A"],
 ["The image formed by a plane mirror is", ["real and inverted","virtual and erect","real and erect","virtual and inverted"], 1, "A plane mirror forms an image that cannot be caught on a screen (virtual) and is upright (erect). Answer: B"]
],
"Chemistry": [
 ["The atomic number of an element is the number of its", ["neutrons","protons","nucleons","outer electrons"], 1, "Atomic number = number of protons in the nucleus. Answer: B"],
 ["Which gas is produced when zinc reacts with dilute hydrochloric acid?", ["Oxygen","Chlorine","Hydrogen","Carbon dioxide"], 2, "Zn + 2HCl → ZnCl₂ + H₂. Answer: C"],
 ["A solution has a pH of 3. It is", ["strongly alkaline","neutral","weakly alkaline","acidic"], 3, "pH below 7 means acidic. Answer: D"],
 ["The number of moles in 36 g of water (H = 1, O = 16) is", ["1","2","3","18"], 1, "Molar mass of H₂O = 18 g/mol. Moles = 36 ÷ 18 = 2. Answer: B"],
 ["Which of the following is an alkane?", ["C₂H₄","C₂H₆","C₂H₂","C₆H₆"], 1, "Alkanes follow CₙH₂ₙ₊₂. For n = 2 this gives C₂H₆. Answer: B"]
],
"Biology": [
 ["The site of photosynthesis in a plant cell is the", ["mitochondrion","chloroplast","ribosome","nucleus"], 1, "Chloroplasts contain chlorophyll, which traps light for photosynthesis. Answer: B"],
 ["Which blood group is the universal donor?", ["A","B","AB","O"], 3, "Group O has no A or B antigens, so it can be given to all groups. Answer: D"],
 ["Deficiency of which vitamin causes rickets?", ["A","B₁","C","D"], 3, "Vitamin D helps the body absorb calcium for strong bones. Answer: D"],
 ["Movement of water across a semi-permeable membrane from a dilute to a concentrated solution is", ["diffusion","osmosis","active transport","transpiration"], 1, "This is the definition of osmosis. Answer: B"],
 ["An organism that feeds on dead organic matter is a", ["parasite","saprophyte","predator","producer"], 1, "Saprophytes, such as fungi, feed on dead and decaying matter. Answer: B"]
],
"Agricultural Science": [
 ["Soil made of roughly equal parts sand, silt and clay is", ["loamy soil","clay soil","sandy soil","gravel"], 0, "Loam is the best all-round agricultural soil because of this balance. Answer: A"],
 ["Which of these is a leguminous crop?", ["Maize","Cassava","Groundnut","Yam"], 2, "Groundnut belongs to the legume family and fixes nitrogen in the soil. Answer: C"],
 ["The rearing of bees is called", ["apiculture","sericulture","pisciculture","horticulture"], 0, "Apiculture is bee-keeping. Answer: A"],
 ["In NPK fertilizer, the letter K stands for", ["calcium","potassium","phosphorus","nitrogen"], 1, "N is nitrogen, P is phosphorus and K is potassium. Answer: B"],
 ["Mixed farming is the practice of", ["growing only one crop","keeping animals and growing crops on the same farm","farming for export only","farming on rented land"], 1, "Mixed farming combines crop production and livestock rearing. Answer: B"]
],
"Economics": [
 ["The basic economic problem is", ["inflation","scarcity","unemployment","taxation"], 1, "Wants are unlimited but resources are limited, which is scarcity. Answer: B"],
 ["When price rises and quantity demanded falls, this illustrates the law of", ["supply","demand","diminishing returns","variable proportions"], 1, "The law of demand says price and quantity demanded move in opposite directions. Answer: B"],
 ["A market with a single seller is called a", ["monopoly","oligopoly","perfect competition","duopoly"], 0, "Mono means one. Answer: A"],
 ["Money that is valuable only because government declares it legal tender is", ["commodity money","fiat money","credit money","barter"], 1, "Fiat money has no intrinsic value and is backed by government order. Answer: B"],
 ["GDP stands for", ["Gross Domestic Product","General Domestic Price","Gross Distribution Percentage","Government Domestic Policy"], 0, "GDP is the total value of goods and services produced in a country in a period. Answer: A"]
],
"Commerce": [
 ["The exchange of goods for goods without using money is", ["barter","hire purchase","retailing","credit"], 0, "This is barter trade. Answer: A"],
 ["A document sent by a seller to a buyer listing goods supplied and their prices is an", ["invoice","receipt","cheque","voucher"], 0, "The invoice is the bill for goods supplied. Answer: A"],
 ["The insurance principle that a person must stand to lose if the insured item is damaged is", ["utmost good faith","insurable interest","indemnity","contribution"], 1, "This is insurable interest. Answer: B"],
 ["Which is a function of a retailer?", ["Selling in small quantities to consumers","Manufacturing goods","Importing in bulk","Printing money"], 0, "Retailers sell in small quantities to final consumers. Answer: A"],
 ["A bank account operated mainly with cheques is a", ["fixed deposit","current account","savings account","loan account"], 1, "Current accounts are designed for frequent transactions using cheques. Answer: B"]
],
"Financial Accounting": [
 ["The accounting equation is", ["Assets = Capital + Liabilities","Assets = Capital − Liabilities","Capital = Assets + Liabilities","Liabilities = Assets + Capital"], 0, "What a business owns is funded by the owner (capital) and outsiders (liabilities). Answer: A"],
 ["Which of these is a current asset?", ["Land","Debtors","Motor vehicle","Building"], 1, "Debtors will pay within the year, so they are current assets. Answer: B"],
 ["Goods taken by the owner for personal use are recorded as", ["sales","purchases","drawings","expenses"], 2, "Owner withdrawals of goods or cash are drawings. Answer: C"],
 ["Gross profit is", ["sales minus cost of goods sold","sales minus all expenses","purchases minus sales","capital minus drawings"], 0, "Gross profit = net sales − cost of goods sold. Answer: A"],
 ["A trial balance is prepared to", ["check the arithmetical accuracy of the ledger","calculate profit","find cash at bank","record sales"], 0, "If total debits equal total credits, the ledger is arithmetically accurate. Answer: A"]
],
"Government": [
 ["Nigeria gained independence in", ["1957","1960","1963","1966"], 1, "Nigeria became independent on 1 October 1960. Answer: B"],
 ["The arm of government that interprets laws is the", ["legislature","executive","judiciary","civil service"], 2, "Courts (the judiciary) interpret and apply the law. Answer: C"],
 ["A system where power is shared between a central government and component units is", ["unitary","federal","confederal","monarchical"], 1, "This describes federalism. Answer: B"],
 ["The doctrine of separation of powers was popularised by", ["Montesquieu","Karl Marx","Plato","John Locke"], 0, "Baron de Montesquieu developed it in 'The Spirit of the Laws'. Answer: A"],
 ["Rule by a small privileged group is", ["democracy","oligarchy","monarchy","anarchy"], 1, "Oligarchy means rule by the few. Answer: B"]
],
"Literature in English": [
 ["A poem of fourteen lines is a", ["sonnet","ode","elegy","ballad"], 0, "A sonnet has 14 lines. Answer: A"],
 ["Giving human qualities to non-human things is", ["personification","simile","hyperbole","irony"], 0, "This is personification. Answer: A"],
 ["The main character in a work of literature is the", ["antagonist","protagonist","narrator","foil"], 1, "The protagonist is the central character. Answer: B"],
 ["A poem of lamentation for the dead is an", ["elegy","satire","epic","ode"], 0, "An elegy mourns the dead. Answer: A"],
 ["Using words to mean the opposite of what they say is", ["irony","metaphor","alliteration","onomatopoeia"], 0, "Verbal irony says one thing while meaning the opposite. Answer: A"]
],
"CRK": [
 ["Who led the Israelites out of Egypt?", ["Abraham","Moses","Joshua","David"], 1, "God used Moses to lead the Israelites out of Egypt (Exodus). Answer: B"],
 ["The first book of the New Testament is", ["Mark","Matthew","John","Luke"], 1, "The New Testament begins with the Gospel of Matthew. Answer: B"],
 ["Jesus was baptised by", ["Peter","John the Baptist","Andrew","Paul"], 1, "John the Baptist baptised Jesus in the River Jordan. Answer: B"],
 ["According to Genesis, God created the heavens and the earth in", ["five days","six days","eight days","ten days"], 1, "God created in six days and rested on the seventh. Answer: B"],
 ["The disciple who betrayed Jesus was", ["Peter","Thomas","Judas Iscariot","Andrew"], 2, "Judas Iscariot betrayed Jesus for thirty pieces of silver. Answer: C"]
],
"IRK": [
 ["The Islamic month of fasting is", ["Shawwal","Ramadan","Rajab","Muharram"], 1, "Muslims fast during Ramadan. Answer: B"],
 ["The number of daily obligatory prayers in Islam is", ["three","four","five","seven"], 2, "Fajr, Dhuhr, Asr, Maghrib and Isha. Answer: C"],
 ["The holy book of Islam is the", ["Torah","Bible","Qur'an","Zabur"], 2, "The Qur'an was revealed to Prophet Muhammad (SAW). Answer: C"],
 ["The pilgrimage to Makkah is called", ["Zakat","Hajj","Sawm","Salat"], 1, "Hajj is the annual pilgrimage to Makkah. Answer: B"],
 ["Prophet Muhammad (SAW) was born in", ["Madinah","Makkah","Jerusalem","Taif"], 1, "He was born in Makkah. Answer: B"]
],
"Geography": [
 ["The imaginary line at 0° latitude is the", ["Equator","Tropic of Cancer","Prime Meridian","Arctic Circle"], 0, "Latitude 0° is the Equator. Answer: A"],
 ["The layer of the earth between the crust and the core is the", ["mantle","atmosphere","lithosphere","hydrosphere"], 0, "The mantle lies between the crust and the core. Answer: A"],
 ["Rocks formed from cooled molten magma are", ["sedimentary","igneous","metamorphic","organic"], 1, "Igneous rocks form when magma or lava cools. Answer: B"],
 ["The instrument for measuring atmospheric pressure is the", ["thermometer","barometer","hygrometer","anemometer"], 1, "A barometer measures air pressure. Answer: B"],
 ["The Prime Meridian passes through", ["Greenwich","Lagos","Cairo","Paris"], 0, "The 0° longitude line passes through Greenwich, London. Answer: A"]
],
"History": [
 ["The first Prime Minister of Nigeria was", ["Nnamdi Azikiwe","Abubakar Tafawa Balewa","Obafemi Awolowo","Ahmadu Bello"], 1, "Sir Abubakar Tafawa Balewa held the office from 1957. Answer: B"],
 ["The Berlin Conference of 1884–85 was held to", ["end slavery","regulate the partition of Africa","form the UN","end World War I"], 1, "European powers set rules for colonising Africa. Answer: B"],
 ["The amalgamation of Northern and Southern Nigeria in 1914 was carried out by", ["Lord Lugard","Hugh Clifford","Arthur Richards","John Macpherson"], 0, "Frederick Lugard amalgamated the protectorates in 1914. Answer: A"],
 ["The Sokoto Caliphate was founded by", ["Usman dan Fodio","Al-Kanemi","Rabih","Muhammadu Bello"], 0, "Usman dan Fodio led the 1804 jihad that created it. Answer: A"],
 ["The transatlantic slave trade mainly took Africans to", ["Asia","the Americas","Australia","Antarctica"], 1, "Millions were carried to the Americas and the Caribbean. Answer: B"]
],
"Civic Education": [
 ["A person who legally belongs to a country is a", ["citizen","alien","visitor","refugee"], 0, "A citizen has full legal membership of a country. Answer: A"],
 ["The right to vote is a", ["political right","social duty","economic right","religious right"], 0, "Voting is a political right. Answer: A"],
 ["Which of these is a civic duty?", ["Paying taxes","Owning land","Travelling abroad","Joining a club"], 0, "Paying taxes is a duty every citizen owes the state. Answer: A"],
 ["The rule of law means that", ["everyone is subject to the law","only the poor obey laws","the president is above the law","the military makes the laws"], 0, "No person or office is above the law. Answer: A"],
 ["Bribery and corruption slow national development because they", ["waste public resources","create jobs","reduce taxes","improve services"], 0, "Money meant for public projects is diverted for private gain. Answer: A"]
],
"Computer Studies": [
 ["The brain of the computer is the", ["monitor","CPU","keyboard","mouse"], 1, "The CPU processes all instructions. Answer: B"],
 ["Which of these is an input device?", ["Printer","Scanner","Monitor","Speaker"], 1, "A scanner sends data into the computer. Answer: B"],
 ["One byte is equal to", ["4 bits","8 bits","16 bits","32 bits"], 1, "1 byte = 8 bits. Answer: B"],
 ["Which of these is an operating system?", ["Microsoft Word","Windows","Google Chrome","Excel"], 1, "Windows manages the computer's hardware and software. Answer: B"],
 ["RAM stands for", ["Random Access Memory","Read Access Memory","Rapid Active Memory","Run Any Memory"], 0, "RAM is the computer's temporary working memory. Answer: A"]
]
};
const STARTER = Object.entries(BANK).flatMap(([subject, list]) =>
  list.map(([question, options, answer, explanation]) => ({ subject, year: 0, question, options, answer, explanation })));

/* ---------- Database models ---------- */
const User = mongoose.model("User", new Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true, required: true },
  password: { type: String, required: true },
  used: { type: Number, default: 0 },
  allUntil: Date,
  subjects: [{ name: String, until: Date, _id: false }],
  resetHash: String,
  resetExpires: Date,
}, { timestamps: true }));

const Question = mongoose.model("Question", new Schema({
  subject: { type: String, index: true },
  year: { type: Number, default: 0 },
  question: String,
  options: [String],
  answer: Number,
  explanation: String,
}));

const Exam = mongoose.model("Exam", new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", index: true },
  subject: String,
  total: Number,
  questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
  submitted: { type: Boolean, default: false },
  score: Number,
}, { timestamps: true }));

const Payment = mongoose.model("Payment", new Schema({
  reference: { type: String, unique: true },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  plan: String, subject: String, amount: Number,
}, { timestamps: true }));

/* ---------- Settings & helpers ---------- */
const app = express();
app.set("trust proxy", 1);
const FREE = +C.FREE_LIMIT || 5;
const DAY = 86400000;
const PS = "https://api.paystack.co";
const psHeaders = () => ({ Authorization: `Bearer ${C.PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json" });

// Change these prices and durations whenever you like
const PLANS = {
  subject: { label: "One subject (30 days)", naira: 1500, days: 30 },
  monthly: { label: "All subjects (30 days)", naira: 3000, days: 30 },
  full:    { label: "All subjects (lifetime)", naira: 10000, days: 36500 },
};

app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));

async function fulfil(d) {
  const m = d.metadata || {};
  const plan = PLANS[m.plan];
  if (!plan || !m.userId || d.status !== "success" || d.amount < plan.naira * 100) return false;
  if (m.plan === "subject" && !m.subject) return false;
  try {
    await Payment.create({ reference: d.reference, user: m.userId, plan: m.plan, subject: m.subject, amount: d.amount });
  } catch (e) {
    if (e.code !== 11000) throw e;
    return true;
  }
  const u = await User.findById(m.userId);
  if (!u) return false;
  const now = Date.now();
  if (m.plan === "subject") {
    const cur = u.subjects.find((s) => s.name === m.subject);
    const base = cur && cur.until > now ? +cur.until : now;
    const until = new Date(base + plan.days * DAY);
    if (cur) cur.until = until; else u.subjects.push({ name: m.subject, until });
  } else {
    const base = u.allUntil && u.allUntil > now ? +u.allUntil : now;
    u.allUntil = new Date(base + plan.days * DAY);
  }
  await u.save();
  return true;
}

app.post("/api/pay/webhook", express.raw({ type: "*/*" }), async (req, res) => {
  const hash = crypto.createHmac("sha512", C.PAYSTACK_SECRET_KEY).update(req.body).digest("hex");
  if (hash !== req.headers["x-paystack-signature"]) return res.sendStatus(401);
  const event = JSON.parse(req.body.toString());
  if (event.event === "charge.success") await fulfil(event.data);
  res.sendStatus(200);
});

app.use(express.json({ limit: "5mb" }));
app.use("/api/login", rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));
app.use("/api/signup", rateLimit({ windowMs: 60 * 60 * 1000, max: 20 }));
app.use("/api/forgot", rateLimit({ windowMs: 60 * 60 * 1000, max: 10 }));

const sign = (u) => jwt.sign({ id: u._id }, C.JWT_SECRET, { expiresIn: "30d" });
async function auth(req, res, next) {
  try {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    const { id } = jwt.verify(token, C.JWT_SECRET);
    req.user = await User.findById(id);
    if (!req.user) throw new Error();
    next();
  } catch { res.status(401).json({ error: "Please log in" }); }
}
const hasAccess = (u, subject) => {
  const now = Date.now();
  if (u.allUntil && u.allUntil > now) return true;
  return u.subjects.some((s) => s.name === subject && s.until > now);
};
const freeLeft = (u) => Math.max(0, FREE - u.used);
const publicUser = (u) => {
  const now = Date.now();
  return {
    name: u.name, email: u.email, left: freeLeft(u),
    allUntil: u.allUntil && u.allUntil > now ? u.allUntil : null,
    subjects: u.subjects.filter((s) => s.until > now).map((s) => ({ name: s.name, until: s.until })),
  };
};

/* ---------- Login, signup, password reset ---------- */
app.post("/api/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || password.length < 6) return res.status(400).json({ error: "Email and a password of 6+ characters required" });
  if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ error: "Email already registered" });
  const u = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
  res.json({ token: sign(u), user: publicUser(u) });
});

app.post("/api/login", async (req, res) => {
  const u = await User.findOne({ email: (req.body.email || "").toLowerCase() });
  if (!u || !(await bcrypt.compare(req.body.password || "", u.password))) return res.status(401).json({ error: "Wrong email or password" });
  res.json({ token: sign(u), user: publicUser(u) });
});

app.get("/api/me", auth, (req, res) => res.json(publicUser(req.user)));

const mailer = nodemailer.createTransport({
  host: C.SMTP_HOST, port: +C.SMTP_PORT || 587, secure: +C.SMTP_PORT === 465,
  auth: { user: C.SMTP_USER, pass: C.SMTP_PASS },
});

app.post("/api/forgot", async (req, res) => {
  res.json({ ok: true });
  try {
    const u = await User.findOne({ email: (req.body.email || "").toLowerCase() });
    if (!u) return;
    const token = crypto.randomBytes(32).toString("hex");
    u.resetHash = crypto.createHash("sha256").update(token).digest("hex");
    u.resetExpires = new Date(Date.now() + 3600000);
    await u.save();
    await mailer.sendMail({
      from: C.MAIL_FROM, to: u.email, subject: "Reset your Test Dealer password",
      text: `Open this link to set a new password (valid for 1 hour):\n${C.BASE_URL}/?reset=${token}\n\nIf you did not ask for this, ignore this email.`,
    });
  } catch (e) { console.error("Reset email failed:", e.message); }
});

app.post("/api/reset", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password || password.length < 6) return res.status(400).json({ error: "Password of 6+ characters required" });
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  const u = await User.findOne({ resetHash: hash, resetExpires: { $gt: new Date() } });
  if (!u) return res.status(400).json({ error: "This reset link is invalid or has expired" });
  u.password = await bcrypt.hash(password, 10);
  u.resetHash = undefined; u.resetExpires = undefined;
  await u.save();
  res.json({ token: sign(u), user: publicUser(u) });
});

/* ---------- Subjects, exams, score history ---------- */
app.get("/api/subjects", async (req, res) => res.json(await Question.distinct("subject")));
app.get("/api/plans", (req, res) => res.json(PLANS));

// Free users: 5 questions in total. Paid users: 40 random questions per exam, avoiding ones they have already seen.
app.post("/api/exam/start", auth, async (req, res) => {
  const { subject } = req.body;
  const unlimited = hasAccess(req.user, subject);
  const left = freeLeft(req.user);
  if (!unlimited && left === 0) return res.status(402).json({ error: "Your free questions are finished. Please choose a plan to continue." });

  const n = unlimited ? 40 : Math.min(5, left);
  const seen = await Exam.distinct("questions", { user: req.user._id });
  let qs = await Question.aggregate([{ $match: { subject, _id: { $nin: seen } } }, { $sample: { size: n } }]);
  if (qs.length < n) {
    const more = await Question.aggregate([{ $match: { subject, _id: { $nin: qs.map((q) => q._id) } } }, { $sample: { size: n - qs.length } }]);
    qs = qs.concat(more);
  }
  if (!qs.length) return res.status(404).json({ error: "No questions found for that subject" });

  if (!unlimited) { req.user.used += qs.length; await req.user.save(); }

  const exam = await Exam.create({ user: req.user._id, subject, total: qs.length, questions: qs.map((q) => q._id) });
  res.json({
    examId: exam._id,
    seconds: qs.length * 90,
    questions: qs.map((q) => ({ id: q._id, subject: q.subject, question: q.question, options: q.options })),
    user: publicUser(req.user),
  });
});

app.post("/api/exam/submit", auth, async (req, res) => {
  const exam = await Exam.findOne({ _id: req.body.examId, user: req.user._id }).populate("questions");
  if (!exam) return res.status(404).json({ error: "Exam not found" });
  if (exam.submitted) return res.status(400).json({ error: "Already submitted" });
  const answers = req.body.answers || {};
  let score = 0;
  const review = exam.questions.map((q) => {
    const picked = answers[q._id];
    if (picked === q.answer) score++;
    return { id: q._id, question: q.question, options: q.options, correct: q.answer, picked, explanation: q.explanation || "" };
  });
  exam.submitted = true; exam.score = score; await exam.save();
  res.json({ score, total: review.length, review, user: publicUser(req.user) });
});

app.get("/api/history", auth, async (req, res) => {
  res.json(await Exam.find({ user: req.user._id, submitted: true })
    .sort({ createdAt: -1 }).limit(50).select("subject score total createdAt"));
});

/* ---------- Payment (Paystack) ---------- */
app.post("/api/pay/init", auth, async (req, res) => {
  const { plan, subject } = req.body;
  const p = PLANS[plan];
  if (!p) return res.status(400).json({ error: "Unknown plan" });
  if (plan === "subject" && !subject) return res.status(400).json({ error: "Choose a subject" });
  const r = await fetch(`${PS}/transaction/initialize`, {
    method: "POST", headers: psHeaders(),
    body: JSON.stringify({
      email: req.user.email, amount: p.naira * 100,
      callback_url: `${C.BASE_URL}/`,
      metadata: { userId: String(req.user._id), plan, subject },
    }),
  });
  const j = await r.json();
  if (!j.status) return res.status(502).json({ error: j.message || "Could not start payment" });
  res.json({ url: j.data.authorization_url });
});

app.get("/api/pay/verify", auth, async (req, res) => {
  const r = await fetch(`${PS}/transaction/verify/${encodeURIComponent(req.query.reference)}`, { headers: psHeaders() });
  const j = await r.json();
  if (j.status && j.data && j.data.metadata && j.data.metadata.userId === String(req.user._id)) {
    await fulfil(j.data);
    req.user = await User.findById(req.user._id);
  }
  res.json(publicUser(req.user));
});

/* ---------- Admin: upload page at /admin ---------- */
const ADMIN_HTML = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Test Dealer Admin</title>
<style>
body{font-family:system-ui,Arial,sans-serif;max-width:720px;margin:0 auto;padding:16px}
textarea,input,button{width:100%;padding:10px;margin:6px 0;font:inherit;box-sizing:border-box}
textarea{height:320px;font-family:monospace}
button{background:#0b7a3e;color:#fff;border:0;border-radius:8px;font-weight:600;cursor:pointer}
pre{background:#eee;color:#111;padding:10px;border-radius:8px;white-space:pre-wrap}
</style></head><body>
<h2>Test Dealer Admin</h2>
<input id="key" type="password" placeholder="Admin key">
<textarea id="js" placeholder='Paste a JSON array: [{"subject":"Physics","question":"...","options":["A","B","C","D"],"answer":2,"explanation":"..."}]'></textarea>
<button id="go">Upload questions</button>
<pre id="out"></pre>
<script>
document.getElementById("go").onclick = async function () {
  var out = document.getElementById("out");
  var data;
  try { data = JSON.parse(document.getElementById("js").value); }
  catch (e) { out.textContent = "That is not valid JSON."; return; }
  var r = await fetch("/api/admin/questions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-key": document.getElementById("key").value },
    body: JSON.stringify(data)
  });
  out.textContent = r.status === 403 ? "Wrong admin key." : JSON.stringify(await r.json(), null, 2);
};
</script></body></html>`;
app.get("/admin", (req, res) => res.type("html").send(ADMIN_HTML));

const adminAuth = (req, res, next) =>
  C.ADMIN_KEY && req.headers["x-admin-key"] === C.ADMIN_KEY ? next() : res.sendStatus(403);

app.post("/api/admin/questions", adminAuth, async (req, res) => {
  const list = Array.isArray(req.body) ? req.body : [req.body];
  const good = [], bad = [];
  list.forEach((q, i) => {
    const y = q && q.year == null ? 0 : +(q && q.year);
    const ok = q && q.subject && (y === 0 || (y >= 1990 && y <= 2026)) &&
      q.question && Array.isArray(q.options) && q.options.length >= 2 &&
      Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length;
    ok ? good.push({ subject: q.subject.trim(), year: y, question: q.question, options: q.options, answer: q.answer, explanation: q.explanation || "" })
       : bad.push(i + 1);
  });
  if (good.length) await Question.insertMany(good);
  res.json({ added: good.length, rejected_item_numbers: bad });
});

/* ---------- Bulk question generator (open /generate) ---------- */
const GEN = { running: false, stop: false, log: [] };
const say = (m) => { GEN.log.push(new Date().toLocaleTimeString() + "  " + m); if (GEN.log.length > 100) GEN.log.shift(); console.log(m); };
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

async function claude(prompt, max = 4000) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": C.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-sonnet-5-5", max_tokens: max, messages: [{ role: "user", content: prompt }] }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error((j.error && j.error.message) || r.status);
  return j.content.map((c) => c.text || "").join("").replace(/```json|```/g, "").trim();
}

const validQ = (q) => q && q.question && Array.isArray(q.options) && q.options.length === 4 &&
  Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4 && q.explanation;

async function runJob(subjects, target) {
  GEN.running = true; GEN.stop = false;
  try {
    for (const subject of subjects) {
      if (GEN.stop) break;
      const seen = new Set((await Question.find({ subject }).select("question")).map((q) => norm(q.question)));
      let have = seen.size, t = 0, fails = 0;
      say(subject + ": " + have + " questions now, target " + target);
      let topics;
      try {
        topics = JSON.parse(await claude(`List 40 different topics from the JAMB UTME ${subject} syllabus. Reply with ONLY a JSON array of 40 short strings.`, 1500));
      } catch (e) { say(subject + ": could not get the topic list (" + e.message + ")"); continue; }

      while (have < target && !GEN.stop && fails < 8) {
        const topic = topics[t++ % topics.length];
        try {
          const recent = (await Question.find({ subject }).sort({ _id: -1 }).limit(10).select("question")).map((q) => q.question);
          const items = JSON.parse(await claude(
            `Write 10 ORIGINAL multiple-choice practice questions for the JAMB UTME ${subject} syllabus on the topic "${topic}". ` +
            `Vary the difficulty. Do not copy real past questions, and do not repeat or closely copy these existing questions: ${JSON.stringify(recent)}. ` +
            `Each has exactly 4 options and exactly one correct answer, plus a short step-by-step solution ending with "Answer: <letter>". ` +
            `Reply with ONLY a JSON array: [{"question":"...","options":["...","...","...","..."],"answer":0,"explanation":"..."}] where "answer" is the index (0-3) of the correct option.`));
          const fresh = items.filter((q) => validQ(q) && !seen.has(norm(q.question)));
          let good = [];
          if (fresh.length) {
            const flags = JSON.parse(await claude(
              `Solve each multiple-choice question yourself. Reply with ONLY a JSON array of true or false, one per question: ` +
              `true only if the marked answer index (0-3) is definitely correct and no other option is also correct.\n` +
              JSON.stringify(fresh.map((q) => ({ question: q.question, options: q.options, answer: q.answer }))), 600));
            good = fresh.filter((q, i) => flags[i] === true)
              .map((q) => ({ subject, year: 0, question: q.question, options: q.options, answer: q.answer, explanation: q.explanation }));
          }
          if (good.length) {
            await Question.insertMany(good);
            good.forEach((q) => seen.add(norm(q.question)));
            have += good.length; fails = 0;
          } else fails++;
          say(subject + " (" + topic + "): +" + good.length + " = " + have);
        } catch (e) { fails++; say(subject + ": error, retrying (" + e.message + ")"); await pause(3000); }
      }
      say(subject + " finished with " + have + " questions");
    }
  } finally { GEN.running = false; say("Job ended"); }
}

app.post("/api/admin/generate", adminAuth, (req, res) => {
  if (GEN.running) return res.status(409).json({ error: "A job is already running" });
  if (!C.ANTHROPIC_API_KEY || C.ANTHROPIC_API_KEY === "placeholder") return res.status(400).json({ error: "ANTHROPIC_API_KEY is not set on Render" });
  const subjects = req.body.subject === "ALL" ? Object.keys(BANK) : [req.body.subject];
  runJob(subjects, Math.min(+req.body.target || 1000, 2000));
  res.json({ started: true });
});
app.post("/api/admin/stop", adminAuth, (req, res) => { GEN.stop = true; res.json({ ok: true }); });
app.get("/api/admin/status", adminAuth, async (req, res) => {
  const counts = {};
  for (const s of await Question.distinct("subject")) counts[s] = await Question.countDocuments({ subject: s });
  res.json({ running: GEN.running, log: GEN.log.slice(-25), counts });
});

const GEN_HTML = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Question generator</title>
<style>
body{font-family:system-ui,Arial,sans-serif;max-width:720px;margin:0 auto;padding:16px}
input,select,button{width:100%;padding:10px;margin:6px 0;font:inherit;box-sizing:border-box}
button{background:#0b7a3e;color:#fff;border:0;border-radius:8px;font-weight:600;cursor:pointer}
pre{background:#eee;color:#111;padding:10px;border-radius:8px;white-space:pre-wrap;font-size:13px}
</style></head><body>
<h2>Question generator</h2>
<input id="key" type="password" placeholder="Admin key">
<select id="sub"><option value="ALL">ALL subjects</option>${Object.keys(BANK).map((s) => `<option>${s}</option>`).join("")}</select>
<input id="target" type="number" value="1000">
<button id="go">Start generating</button>
<button id="stop" style="background:#c0392b">Stop</button>
<pre id="out">Enter your admin key, then press Start. Keep this page open while it runs.</pre>
<script>
function H(){return{"Content-Type":"application/json","x-admin-key":document.getElementById("key").value};}
function show(t){document.getElementById("out").textContent=t;}
async function post(url,body){var r=await fetch(url,{method:"POST",headers:H(),body:JSON.stringify(body||{})});return r.status===403?{error:"Wrong admin key."}:await r.json();}
document.getElementById("go").onclick=async function(){var j=await post("/api/admin/generate",{subject:document.getElementById("sub").value,target:+document.getElementById("target").value});if(j.error)show(j.error);};
document.getElementById("stop").onclick=async function(){await post("/api/admin/stop");};
async function poll(){if(!document.getElementById("key").value)return;try{var r=await fetch("/api/admin/status",{headers:H()});if(r.status===403){show("Wrong admin key.");return;}var j=await r.json();var t=(j.running?"RUNNING":"IDLE")+"\\n\\nQuestions per subject:\\n";for(var k in j.counts)t+=k+": "+j.counts[k]+"\\n";t+="\\nLog:\\n"+j.log.join("\\n");show(t);}catch(e){}}
setInterval(poll,5000);
</script></body></html>`;
app.get("/generate", (req, res) => res.type("html").send(GEN_HTML));

/* ---------- The website itself (front-end) ---------- */
const embed = (fn) => fn.toString().replace(/^[^]*?\/\*/, "").replace(/\*\/\s*\}\s*$/, "");
const PAGE = embed(function () {/*<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Test Dealer</title>
<style>
:root{--bg:#f5f7f4;--card:#fff;--tx:#14231a;--mut:#5b6b60;--pri:#0b7a3e;--bd:#d8e0da;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
@media(prefers-color-scheme:dark){:root{--bg:#0f1712;--card:#18231c;--tx:#e8f1ea;--mut:#9db0a3;--bd:#2a3b2f;--pri:#2ecc71}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--tx);font-family:system-ui,Segoe UI,Arial,sans-serif}
.w{max-width:680px;margin:0 auto;padding:16px}
h1{margin:0;color:var(--pri)}.sub{color:var(--mut);margin:4px 0 16px}
.card{background:var(--card);border:1px solid var(--bd);border-radius:12px;padding:16px;margin-bottom:12px}
select,input,button{font:inherit;padding:10px;border-radius:8px;border:1px solid var(--bd);background:var(--card);color:var(--tx);width:100%;margin:6px 0}
button{background:var(--pri);color:#fff;border:0;cursor:pointer;font-weight:600}
button:disabled{opacity:.5}
button.g{background:transparent;color:var(--tx);border:1px solid var(--bd)}
.opt{display:block;text-align:left;background:var(--card);color:var(--tx);border:1px solid var(--bd);font-weight:400}
.opt.sel{border-color:var(--pri);outline:2px solid var(--pri)}
.ans{padding:8px;border-radius:8px;margin:4px 0;border:1px solid var(--bd)}
.ans.ok{background:#d4f5e0;color:#0a3d1f}.ans.no{background:#fadbd8;color:#5c1a12}
.sol{margin-top:8px;padding:10px;border-left:4px solid var(--pri);background:rgba(11,122,62,.08);white-space:pre-wrap;border-radius:4px}
.row{display:flex;gap:8px}.row>*{flex:1}
.bar{display:flex;justify-content:space-between;color:var(--mut);font-size:14px;margin-bottom:8px}
.err{color:#c0392b;min-height:1.2em}.okm{color:var(--pri)}
.price{font-size:22px;font-weight:700;color:var(--pri)}
a{color:var(--pri)}small{color:var(--mut)}
</style></head><body><div class="w" id="app"></div>
<script>
const $ = id => document.getElementById(id), app = $("app");
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt = t => Math.floor(t/60) + ":" + String(t%60).padStart(2,"0");
const dt = s => new Date(s).toLocaleDateString();
let token = localStorage.getItem("td_token") || "";
let user = null, ex = null;

async function api(path, method = "GET", body) {
  const r = await fetch("/api" + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  if (r.status === 401 && token) logout();
  if (!r.ok) throw Object.assign(new Error(j.error || "Something went wrong"), { status: r.status });
  return j;
}
function logout() { token = ""; user = null; localStorage.removeItem("td_token"); authScreen(); }
function setSession(j) { token = j.token; user = j.user; localStorage.setItem("td_token", token); }

// ---------- Login / Signup / Forgot ----------
function authScreen(mode = "login") {
  const su = mode === "signup", fg = mode === "forgot";
  app.innerHTML = `<h1>Test Dealer</h1><p class="sub">JAMB CBT practice for all subjects</p>
  <div class="card"><h3>${fg ? "Reset password" : su ? "Create account" : "Log in"}</h3>
  ${su ? '<input id="nm" placeholder="Full name">' : ""}
  <input id="em" type="email" placeholder="Email">
  ${fg ? "" : '<input id="pw" type="password" placeholder="Password (6+ characters)">'}
  <div class="err" id="er"></div>
  <button id="go">${fg ? "Send reset link" : su ? "Sign up" : "Log in"}</button>
  ${mode === "login" ? '<button class="g" id="fp">Forgot password?</button>' : ""}
  <button class="g" id="sw">${mode === "login" ? "Create a new account" : "Back to log in"}</button></div>`;
  $("sw").onclick = () => authScreen(mode === "login" ? "signup" : "login");
  if ($("fp")) $("fp").onclick = () => authScreen("forgot");
  $("go").onclick = async () => {
    try {
      if (fg) {
        await api("/forgot", "POST", { email: $("em").value });
        $("er").className = "okm"; $("er").textContent = "If that email is registered, a reset link has been sent. Check your inbox and spam folder.";
        return;
      }
      setSession(await api(su ? "/signup" : "/login", "POST", { name: su ? $("nm").value : undefined, email: $("em").value, password: $("pw").value }));
      home();
    } catch (e) { $("er").textContent = e.message; }
  };
}
function resetScreen(t) {
  app.innerHTML = `<h1>Test Dealer</h1><div class="card"><h3>Choose a new password</h3>
  <input id="pw" type="password" placeholder="New password (6+ characters)"><div class="err" id="er"></div>
  <button id="go">Save password</button></div>`;
  $("go").onclick = async () => {
    try { setSession(await api("/reset", "POST", { token: t, password: $("pw").value })); history.replaceState({}, "", "/"); home(); }
    catch (e) { $("er").textContent = e.message; }
  };
}

// ---------- Home ----------
function status(u) {
  if (u.allUntil) return new Date(u.allUntil).getFullYear() > 2100 ? "All subjects unlocked for life ✅" : `All subjects unlocked until ${dt(u.allUntil)} ✅`;
  const s = u.subjects.map(x => `${esc(x.name)} (until ${dt(x.until)})`).join(", ");
  return (s ? "Unlocked: " + s + "<br>" : "") + "Free questions left: " + u.left;
}
async function home() {
  try { user = await api("/me"); } catch { return authScreen(); }
  const subjects = (await api("/subjects")).sort();
  app.innerHTML = `<h1>Test Dealer</h1>
  <div class="bar"><span>${esc(user.name || user.email)}</span><a href="#" id="lo">Log out</a></div>
  <div class="card"><b>${status(user)}</b>
  ${subjects.length ? `
  <label><small>Subject</small><select id="sub">${subjects.map(s => `<option>${esc(s)}</option>`).join("")}</select></label>
  <small>Free: 5 questions in total. After payment: 40 random questions in every exam.</small>
  <div class="err" id="er"></div><button id="go">Start exam</button>` : "<p>No questions in the database yet.</p>"}
  <div class="row"><button class="g" id="pl">Plans &amp; pricing</button><button class="g" id="hi">My scores</button></div></div>`;
  $("lo").onclick = e => { e.preventDefault(); logout(); };
  $("pl").onclick = () => plansScreen(); $("hi").onclick = historyScreen;
  if ($("go")) $("go").onclick = startExam;
}

// ---------- Exam ----------
async function startExam() {
  const subject = $("sub").value;
  try {
    const j = await api("/exam/start", "POST", { subject });
    ex = { id: j.examId, qs: j.questions, i: 0, ans: {}, t: j.seconds, done: false };
    ex.timer = setInterval(() => { ex.t--; const e = $("tm"); if (e) e.textContent = fmt(ex.t); if (ex.t <= 0) submit(); }, 1000);
    show();
  } catch (e) { if (e.status === 402) return plansScreen(subject, true); $("er").textContent = e.message; }
}
function show() {
  const q = ex.qs[ex.i];
  app.innerHTML = `<div class="bar"><span>Question ${ex.i + 1}/${ex.qs.length} · ${esc(q.subject)}</span><span>⏱ <b id="tm">${fmt(ex.t)}</b></span></div>
  <div class="card"><p><b>${esc(q.question)}</b></p>
  ${q.options.map((o, k) => `<button class="opt ${ex.ans[q.id] === k ? "sel" : ""}" data-k="${k}">${"ABCD"[k]}. ${esc(o)}</button>`).join("")}</div>
  <div class="row"><button class="g" id="pv" ${ex.i ? "" : "disabled"}>Previous</button>
  ${ex.i < ex.qs.length - 1 ? '<button id="nx">Next</button>' : '<button id="fn">Submit</button>'}</div>`;
  document.querySelectorAll(".opt").forEach(b => b.onclick = () => { ex.ans[q.id] = +b.dataset.k; show(); });
  $("pv").onclick = () => { ex.i--; show(); };
  if ($("nx")) $("nx").onclick = () => { ex.i++; show(); };
  if ($("fn")) $("fn").onclick = () => { if (confirm("Submit exam?")) submit(); };
}
async function submit() {
  if (ex.done) return; ex.done = true; clearInterval(ex.timer);
  try {
    const j = await api("/exam/submit", "POST", { examId: ex.id, answers: ex.ans });
    user = j.user;
    app.innerHTML = `<h1>Result</h1><div class="card"><p style="font-size:28px;margin:0"><b>${j.score}/${j.total}</b> (${Math.round(j.score / j.total * 100)}%)</p></div>
    ${j.review.map((r, i) => `<div class="card"><p><b>${i + 1}. ${esc(r.question)}</b></p>
    ${r.options.map((o, k) => `<div class="ans ${k === r.correct ? "ok" : r.picked === k ? "no" : ""}">${"ABCD"[k]}. ${esc(o)}${k === r.correct ? " ✔" : r.picked === k ? " ✘ (your answer)" : ""}</div>`).join("")}
    ${r.picked === undefined ? "<small>You did not answer this one.</small>" : ""}
    <div class="sol"><b>Solution:</b>\n${r.explanation ? esc(r.explanation) : "Solution coming soon."}</div></div>`).join("")}
    <button id="hm">Back home</button>`;
    $("hm").onclick = home;
  } catch (e) { alert(e.message); home(); }
}

// ---------- Plans & payment ----------
async function plansScreen(pre, ended) {
  const [plans, subjects] = await Promise.all([api("/plans"), api("/subjects")]);
  app.innerHTML = `<h1>Test Dealer</h1>
  ${ended ? '<div class="card"><b>Your free questions are finished.</b> Choose a plan to keep practising.</div>' : ""}
  ${Object.entries(plans).map(([k, p]) => `<div class="card"><b>${esc(p.label)}</b><div class="price">₦${p.naira.toLocaleString()}</div>
  ${k === "subject" ? `<select id="psub">${subjects.sort().map(s => `<option ${s === pre ? "selected" : ""}>${esc(s)}</option>`).join("")}</select>` : ""}
  <button data-plan="${k}">Pay ₦${p.naira.toLocaleString()}</button></div>`).join("")}
  <button class="g" id="bk">Back</button>`;
  document.querySelectorAll("[data-plan]").forEach(b => b.onclick = () => payNow(b.dataset.plan, b.dataset.plan === "subject" ? $("psub").value : undefined));
  $("bk").onclick = home;
}
async function payNow(plan, subject) {
  try { const j = await api("/pay/init", "POST", { plan, subject }); location.href = j.url; }
  catch (e) { alert(e.message); }
}

// ---------- Score history ----------
async function historyScreen() {
  const list = await api("/history");
  app.innerHTML = `<h1>My scores</h1>
  ${list.length ? list.map(h => `<div class="card"><b>${esc(h.subject)}</b> · ${dt(h.createdAt)}<br>${h.score}/${h.total} (${Math.round(h.score / h.total * 100)}%)</div>`).join("") : '<div class="card">No exams taken yet.</div>'}
  <button id="bk">Back</button>`;
  $("bk").onclick = home;
}

// ---------- Start ----------
(async function init() {
  const qp = new URLSearchParams(location.search);
  if (qp.get("reset")) return resetScreen(qp.get("reset"));
  if (!token) return authScreen();
  const ref = qp.get("reference");
  if (ref) {
    try { user = await api("/pay/verify?reference=" + encodeURIComponent(ref)); } catch {}
    history.replaceState({}, "", "/");
    alert("Payment received. Your access has been updated!");
  }
  home();
})();
</script></body></html>
*/});
app.get("/", (req, res) => res.type("html").send(PAGE));

/* ---------- Start the server (loads the 90 starter questions the first time) ---------- */
async function startServer() {
  try {
    await mongoose.connect(C.MONGO_URI);
    if (!(await Question.countDocuments())) {
      await Question.insertMany(STARTER);
      console.log("Loaded " + STARTER.length + " starter questions");
    }
    app.listen(C.PORT, () => console.log("Test Dealer running on port " + C.PORT));
  } catch (e) { console.error("DB connection failed:", e.message); }
}
startServer();
