/* ===================== TEST DEALER: ONE FILE (no setup needed) ===================== */
/* It works the moment it is on Render. Optional settings can be added later on Render's Environment page. */
const C = {
  PORT: 3000,
  MONGO_URI: "",
  JWT_SECRET: "",
  ADMIN_KEY: "",
  PAYSTACK_SECRET_KEY: "",
  BASE_URL: "",
  FREE_LIMIT: 5,
  SMTP_HOST: "smtp.gmail.com",
  SMTP_PORT: 587,
  SMTP_USER: "",
  SMTP_PASS: "",
  MAIL_FROM: "",
  ANTHROPIC_API_KEY: "",
};
for (const k in C) if (process.env[k] && process.env[k].trim()) C[k] = process.env[k].trim();
if (!C.BASE_URL) C.BASE_URL = process.env.RENDER_EXTERNAL_URL || "http://localhost:" + C.PORT;
const real = (v) => !!v && String(v).trim() !== "" && String(v).trim() !== "placeholder";

const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");

process.on("unhandledRejection", (e) => console.error("Unhandled problem:", e && e.message ? e.message : e));
process.on("uncaughtException", (e) => console.error("Uncaught problem:", e && e.message ? e.message : e));

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

/* ======================= DATA LAYER (starts here) =======================
   Everything is kept in memory and saved to a file (preview mode)
   or to MongoDB (permanent mode, only when MONGO_URI is set). */
const DB = { users: [], questions: [], exams: [], payments: [], settings: [] };
const IDX = { userById: new Map(), userByEmail: new Map(), qById: new Map(), qBySubject: new Map(), examById: new Map(), seenBy: new Map(), payByRef: new Map(), setting: new Map() };
const newId = () => crypto.randomBytes(12).toString("hex");

function indexUser(u) { IDX.userById.set(u._id, u); IDX.userByEmail.set(u.email, u); }
function indexQuestion(q) {
  IDX.qById.set(q._id, q);
  if (!IDX.qBySubject.has(q.subject)) IDX.qBySubject.set(q.subject, []);
  IDX.qBySubject.get(q.subject).push(q);
}
function indexExam(e) {
  IDX.examById.set(e._id, e);
  let s = IDX.seenBy.get(e.user);
  if (!s) { s = new Set(); IDX.seenBy.set(e.user, s); }
  e.questions.forEach((id) => s.add(id));
}
function reindex() {
  for (const m of Object.values(IDX)) m.clear();
  DB.users.forEach(indexUser);
  DB.questions.forEach(indexQuestion);
  DB.exams.forEach(indexExam);
  DB.payments.forEach((p) => IDX.payByRef.set(p._id, p));
  DB.settings.forEach((s) => IDX.setting.set(s._id, s.value));
}

const PERSIST = { mode: "file", dir: "", db: null, dirty: new Set(), timer: null };
function dataDir() {
  const tries = [process.env.DATA_DIR, path.join(__dirname, "data"), path.join(os.tmpdir(), "testdealer-data")].filter(Boolean);
  for (const d of tries) {
    try { fs.mkdirSync(d, { recursive: true }); fs.accessSync(d, fs.constants.W_OK); return d; } catch (e) { /* try the next folder */ }
  }
  return "";
}
async function persistInit(uri) {
  if (uri) {
    const { MongoClient } = require("mongoose").mongo;
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 20000 });
    try {
      await client.connect();
      const db = client.db();
      await db.command({ ping: 1 });
      for (const c of Object.keys(DB)) DB[c] = await db.collection("td_" + c).find({}).toArray();
      PERSIST.db = db; PERSIST.mode = "mongo";
    } catch (e) { try { await client.close(); } catch (x) { /* ignore */ } throw e; }
  } else {
    PERSIST.mode = "file"; PERSIST.dir = dataDir();
    for (const c of Object.keys(DB)) {
      try { DB[c] = JSON.parse(fs.readFileSync(path.join(PERSIST.dir, c + ".json"), "utf8")); } catch (e) { DB[c] = []; }
    }
  }
}
function flush() {
  PERSIST.timer = null;
  if (!PERSIST.dir) return;
  for (const c of [...PERSIST.dirty]) {
    PERSIST.dirty.delete(c);
    try {
      const f = path.join(PERSIST.dir, c + ".json");
      fs.writeFileSync(f + ".tmp", JSON.stringify(DB[c]));
      fs.renameSync(f + ".tmp", f);
    } catch (e) { console.error("Could not save " + c + ":", e.message); }
  }
}
function later
