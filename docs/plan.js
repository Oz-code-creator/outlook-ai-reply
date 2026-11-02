// תוכנית הטיול לימסול 27–30.11.2026. קואורדינטות של המלון והמסעדות אומתו; שאר המקומות (טירות, קוריון, לפקארה, נמל) משוערות.
window.PLAN = {
  title: "לימסול 27–30.11.2026",
  days: [
    { n: 1, date: "2026-11-27", label: "שישי 27/11", theme: "נחיתה, עיר עתיקה ואיטלקית" },
    { n: 2, date: "2026-11-28", label: "שבת 28/11", theme: "קולוסי, קוריון והחוף" },
    { n: 3, date: "2026-11-29", label: "ראשון 29/11", theme: "לפקארה" },
    { n: 4, date: "2026-11-30", label: "שני 30/11", theme: "חזרה" }
  ],
  // חלון שימושי לכל יום (לשיבוץ מחדש)
  windows: { 1: ["12:30", "22:00"], 2: ["09:45", "22:00"], 3: ["10:00", "22:00"], 4: ["08:00", "09:45"] },
  context: [
    "זוג, שתי בנות צעירות בבית — רוצים לקנות להן מתנות.",
    "מלון Royal Apollonia (חוף לימסול המזרחי, ~15 דקות מהעיר העתיקה).",
    "מזג אוויר: ~22°C ביום, ~17°C בלילה, שקיעה ~16:30–16:45. הים קריר.",
    "העדפות: יציאה בכל ערב, הפסקת התרעננות בחדר אחה״צ, ארוחות מסורתיות עם קצת גיוון, מחיר לא משנה.",
    "לפקארה ביום ראשון (לא בשבת). MEZE Taverna סגורה בראשון.",
    "טיסה חזרה 30/11 ב-14:40 מלרנקה; יציאה לשדה 10:30, להיות בשדה עד 11:40.",
    "תכנית גשם: האגורה, מוזיאון Paradox במרינה, מתחם טחנת החרובים, הספא במלון.",
    "נהיגה בצד שמאל. עדיין לא הוחלט: רכב שכור או נהג פרטי."
  ],
  // type: sight | food | rest | shop | travel   fixed: לא זזים אוטומטית (הזמנות/טיסות)
  items: [
    { id: "d1-hotel", ta: "https://www.tripadvisor.com/Hotel_Review-g3359582-d243531-Reviews-Royal_Apollonia-Germasogeia_Limassol.html", day: 1, start: "12:00", dur: 30, type: "rest", fixed: true, title: "הגעה למלון", notes: "משאירים מזוודות, מבקשים כניסה מוקדמת וחדר שקט עם נוף לים.", lat: 34.6974038, lng: 33.0949755, radius: 300 },
    { id: "d1-lunch", ta: "https://www.tripadvisor.com/Restaurant_Review-g190382-d23873437-Reviews-Mostra_Meze_Tavern-Limassol_City_Limassol.html", day: 1, start: "13:00", dur: 75, type: "food", title: "ארוחת צהריים – Mostra Meze", notes: "מזה קפריסאית, סריפולו 41 (העיר העתיקה).", reserve: "לוודא שעות פתיחה לצהריים בשישי (ב-TripAdvisor מופיע שפתוחה בעיקר בערב)", lat: 34.6754273, lng: 33.0431423 },
    { id: "d1-castle", ta: "https://www.tripadvisor.com/Attraction_Review-g190382-d527729-Reviews-Limassol_Castle-Limassol_City_Limassol.html", day: 1, start: "14:15", dur: 60, type: "sight", daylight: true, close: "17:00", title: "טירת לימסול והמוזיאון הימי-ביניימי", notes: "אופציונלי אחרי טיסה מוקדמת.", lat: 34.6727, lng: 33.0431 },
    { id: "d1-molos", ta: "https://www.tripadvisor.com/Attraction_Review-g190382-d527737-Reviews-Promenade-Limassol_City_Limassol.html", day: 1, start: "15:15", dur: 60, type: "sight", daylight: true, title: "טיילת מולוס", notes: "הליכה על הטיילת.", lat: 34.6743, lng: 33.0475 },
    { id: "d1-rest", ta: "https://www.tripadvisor.com/Hotel_Review-g3359582-d243531-Reviews-Royal_Apollonia-Germasogeia_Limassol.html", day: 1, start: "16:30", dur: 120, type: "rest", soft: true, title: "מנוחה ומקלחת במלון", notes: "הפסקת התרעננות לפני הערב.", lat: 34.6974038, lng: 33.0949755, radius: 300 },
    { id: "d1-port", ta: "https://www.tripadvisor.com/Attraction_Review-g190382-d6960498-Reviews-Limassol_Marina-Limassol_City_Limassol.html", day: 1, start: "18:30", dur: 90, type: "sight", title: "הנמל הישן ופארק חג המולד", notes: "אורות, דוכנים, יין חם. פעיל מ-21/11.", lat: 34.6704, lng: 33.0443 },
    { id: "d1-dinner", book: true, ta: "https://www.tripadvisor.com/Search?q=Mazema%20Limassol", day: 1, start: "20:00", dur: 90, type: "food", fixed: true, title: "ארוחת ערב – Mazema", notes: "", reserve: "לוודא הזמנת שולחן ל-20:00 ושהמסעדה פתוחה", lat: 34.673984, lng: 33.039054 },

    { id: "d2-bf", ta: "https://www.tripadvisor.com/Hotel_Review-g3359582-d243531-Reviews-Royal_Apollonia-Germasogeia_Limassol.html", day: 2, start: "08:30", dur: 60, type: "food", fixed: true, title: "ארוחת בוקר במלון", notes: "", lat: 34.6974038, lng: 33.0949755, radius: 300 },
    { id: "d2-kolossi", ta: "https://www.tripadvisor.com/Attraction_Review-g190382-d313647-Reviews-Kolossi_Castle-Limassol_City_Limassol.html", day: 2, start: "10:30", dur: 45, type: "sight", daylight: true, open: "08:30", close: "17:00", title: "טירת קולוסי", notes: "שעות חורף 8:30–17:00. אפשר לוותר כדי להשאיר זמן לספא.", lat: 34.6644, lng: 32.9306 },
    { id: "d2-kourion", ta: "https://www.tripadvisor.com/Attraction_Review-g190382-d527735-Reviews-Kourion-Limassol_City_Limassol.html", day: 2, start: "11:30", dur: 120, type: "sight", daylight: true, close: "17:00", title: "קוריון העתיקה", notes: "אמפיתיאטרון ופסיפסים.", reserve: "לאשר טלפונית שהאתר פתוח: +357 25 934250", lat: 34.6641, lng: 32.8856 },
    { id: "d2-lunch", ta: "https://www.tripadvisor.com/Restaurant_Review-g190382-d2221890-Reviews-Chris_Blue_Beach-Limassol_City_Limassol.html", day: 2, start: "13:45", dur: 90, type: "food", title: "צהריים – Chris Blue Beach", notes: "חוף קוריון, פתוחה 8:30–22:30.", lat: 34.6658863, lng: 32.8771663 },
    { id: "d2-spa", book: true, ta: "https://www.tripadvisor.com/Hotel_Review-g3359582-d243531-Reviews-Royal_Apollonia-Germasogeia_Limassol.html", day: 2, start: "16:00", dur: 120, type: "rest", soft: true, title: "ספא או מנוחה במלון", notes: "ספא פתוח 9:00–20:00. כדאי טיפול זוגי עם ג׳קוזי.", reserve: "לשריין טיפול זוגי מראש", lat: 34.6974038, lng: 33.0949755, radius: 300 },
    { id: "d2-shop", ta: "https://www.tripadvisor.com/Search?q=Agiou%20Andreou%20Limassol", day: 2, start: "18:30", dur: 60, type: "shop", title: "אגיו אנדראו – קניות ומתנות", notes: "העיר העתיקה, כחצי שעה למתנות.", lat: 34.6764937, lng: 33.0475766 },
    { id: "d2-dinner", book: true, ta: "https://www.tripadvisor.com/Restaurant_Review-g190382-d2369481-Reviews-Meze_Taverna_Restaurant-Limassol_City_Limassol.html", day: 2, start: "19:30", dur: 100, type: "food", fixed: true, closedDays: ["2026-11-29"], title: "ארוחת ערב – MEZE Taverna", notes: "אגיו אנדראו 209. פתוחה עד 22:00, סגורה בראשון.", reserve: "חובה להזמין: +357 25 367333", lat: 34.6764937, lng: 33.0475766 },

    { id: "d3-bf", ta: "https://www.tripadvisor.com/Hotel_Review-g3359582-d243531-Reviews-Royal_Apollonia-Germasogeia_Limassol.html", day: 3, start: "08:45", dur: 60, type: "food", fixed: true, title: "ארוחת בוקר במלון", notes: "", lat: 34.6974038, lng: 33.0949755, radius: 300 },
    { id: "d3-lefkara", ta: "https://www.tripadvisor.com/Tourism-g1900120-Pano_Lefkara_Larnaka_District-Vacations.html", day: 3, start: "11:00", dur: 135, type: "shop", daylight: true, title: "פאנו לפקארה – תחרה, כסף ומתנות", notes: "מוזיאון הפולקלור, כנסיית Timios Stavros, דוכני כפר חג המולד. כשעה לקניות לבנות. לבוש חם (650 מ׳).", lat: 34.8666, lng: 33.3028, radius: 600 },
    { id: "d3-lunch", book: true, ta2: "https://www.tripadvisor.com/Restaurant_Review-g1900120-d33049687-Reviews-To_Piperi_Tavern-Pano_Lefkara_Larnaka_District.html", ta: "https://www.tripadvisor.com/Restaurant_Review-g1900120-d27781720-Reviews-Iason_Tavern-Pano_Lefkara_Larnaka_District.html", day: 3, start: "13:15", dur: 90, type: "food", open: "12:00", close: "18:30", title: "צהריים – Iason Tavern (גיבוי: To Piperi)", notes: "ראשון 12:00–18:30. To Piperi: 11:30–17:00.", reserve: "אולי להזמין: +357 99 668930", lat: 34.8672, lng: 33.3033, radius: 400 },
    { id: "d3-rest", ta: "https://www.tripadvisor.com/Hotel_Review-g3359582-d243531-Reviews-Royal_Apollonia-Germasogeia_Limassol.html", day: 3, start: "16:30", dur: 160, type: "rest", soft: true, title: "מנוחה במלון", notes: "לחזור לפני החשכה.", lat: 34.6974038, lng: 33.0949755, radius: 300 },
    { id: "d3-dinner", book: true, ta: "https://www.tripadvisor.com/Restaurant_Review-g190382-d26223615-Reviews-Kai_Sushi_Bar_Limassol-Limassol_City_Limassol.html", day: 3, start: "20:00", dur: 90, type: "food", fixed: true, title: "ארוחת ערב – Kai Sushi", notes: "קראון פלאזה, 18:00–23:00.", reserve: "הזמנה דרך המלון: +357 25 851515", lat: 34.688916, lng: 33.0711665 },

    { id: "d4-bf", ta: "https://www.tripadvisor.com/Hotel_Review-g3359582-d243531-Reviews-Royal_Apollonia-Germasogeia_Limassol.html", day: 4, start: "08:30", dur: 45, type: "food", fixed: true, title: "ארוחת בוקר", notes: "", lat: 34.6974038, lng: 33.0949755, radius: 300 },
    { id: "d4-walk", day: 4, start: "09:15", dur: 30, type: "sight", title: "הליכה על החוף", notes: "", lat: 34.6974038, lng: 33.0949755, radius: 400 },
    { id: "d4-checkout", ta: "https://www.tripadvisor.com/Hotel_Review-g3359582-d243531-Reviews-Royal_Apollonia-Germasogeia_Limassol.html", day: 4, start: "10:00", dur: 30, type: "rest", fixed: true, title: "צ׳ק-אאוט", notes: "עד 12:00.", lat: 34.6974038, lng: 33.0949755, radius: 300 },
    { id: "d4-airport", day: 4, start: "10:30", dur: 60, type: "travel", fixed: true, title: "נסיעה לשדה לרנקה", notes: "~52 ק״מ, כ-45–60 דקות. צ׳ק-אין בשדה עד 11:40 (3 שעות לפני ההמראה). מתנות אחרונות בשדה.", lat: 34.8751, lng: 33.6249, radius: 1500 },
    { id: "d4-flight", day: 4, start: "14:40", dur: 60, type: "travel", fixed: true, title: "טיסה חזרה", notes: "המראה 14:40, נחיתה 15:40 (שעות עשויות להשתנות).", lat: 34.8751, lng: 33.6249, radius: 1500 }
  ]
};

// רשימות ברירת מחדל (ניתנות לעריכה באפליקציה)
window.PLAN.packing = [
  "דרכונים בתוקף + אישורי טיסה והזמנות",
  "כרטיסי אשראי + קצת מזומן (יורו)",
  "טלפון: מטען, כבל וסוללה ניידת",
  "מתאם חשמל בריטי (Type G)",
  "שכבה חמה לערב ולפקארה (650 מ׳)",
  "מעיל קל לגשם",
  "נעליים נוחות להליכה",
  "בגדים לערבים (יוצאים כל ערב)",
  "בגד ים לבריכה המחוממת ולספא",
  "משקפי שמש + קרם הגנה",
  "תרופות וציוד היגיינה",
  "תיק קטן ליום + בקבוק מים",
  "מקום פנוי במזוודה למתנות לבנות",
  "רישיון נהיגה (אם שוכרים רכב)"
];
window.PLAN.todos = [
  "להחליט: רכב שכור או נהג פרטי",
  "להזמין שולחן: Mazema – שישי 20:00",
  "להזמין שולחן: MEZE Taverna – שבת 19:30 (+357 25 367333)",
  "להזמין שולחן: Kai Sushi – ראשון 20:00 (דרך המלון +357 25 851515)",
  "אולי להזמין: Iason בלפקארה – ראשון 13:15",
  "להזמין טיפול ספא זוגי לשבת ~16:00 (עם ג׳קוזי)",
  "לוודא שעות Mostra Meze בשישי בצהריים",
  "לבדוק שעות כפר חג המולד בלפקארה (Visit Cyprus)",
  "לבקש מהמלון: חדר שקט עם נוף לים, כניסה מוקדמת, שעות מסעדות וספא",
  "לשלוח לשרית את קישור האפליקציה",
  "שבוע לפני: תחזית מזג אוויר",
  "שבוע לפני: לאשר שעות קוריון וקולוסי (+357 25 934250)",
  "שבוע לפני: לברר שעת הסעה מהמלון ביום שני",
  "לכבות מצב הדגמה באפליקציה",
  "אחרי הטיול: למחוק את מפתח ה-API ב-Console"
];
window.PLAN.info = [
  "טיסה הלוך: שישי 27/11 בשעה 9:00 (Arkia)",
  "טיסה חזור: שני 30/11, המראה 14:40 מלרנקה, נחיתה 15:40 (השעות עשויות להשתנות)",
  "מלון: Royal Apollonia, חוף לימסול המזרחי. כתובת וטלפון: להוסיף כאן",
  "צ׳ק-אין מ-14:00 · צ׳ק-אאוט עד 12:00",
  "הסעה מהמלון לשדה ביום שני: שעה להוסיף",
  "רכב שכור או נהג (שם וטלפון): להוסיף כאן",
  "חירום בקפריסין: 112",
  "MEZE Taverna (שבת 19:30): +357 25 367333",
  "Kai Sushi, דרך המלון (ראשון 20:00): +357 25 851515",
  "קוריון, לאשר שהאתר פתוח: +357 25 934250",
  "נהיגה בצד שמאל · מתאם חשמל בריטי (Type G) · אפליקציית מוניות: Bolt"
];
// עדכוני רשימות חד-פעמיים: מוחקים פריטים ישנים ומוסיפים חדשים (רק מידע כללי; בלי מספרי הזמנה, האתר ציבורי)
window.PLAN.listMigrations = [
  { id: "m2", list: "info", remove: ["d0", "d1", "d2", "d3"], add: [
    { id: "m2-a", t: "✈️ הלוך: IZ165, שישי 27/11, המראה 9:00 מתל אביב (טרמינל 3) ללרנקה" },
    { id: "m2-b", t: "✈️ חזור: IZ162, שני 30/11, המראה 14:40 מלרנקה לטרמינל 3 בתל אביב" },
    { id: "m2-c", t: "צ׳ק-אין בשדה לפחות 3 שעות לפני ההמראה: בחזור עד 11:40. להביא 2 עותקים מודפסים של כרטיסי הטיסה. בלי ארוחה בטיסות" },
    { id: "m2-d", t: "כבודה לפי הכרטיסים: אצל שרית תיק יד אחד עד 8 ק״ג; אצל עוז 0 יח׳. אין כבודה לבטן. לפי תנאי הכרטיס אפשר לקנות תיק טרולי (עד 8 ק״ג) או כבודה עד 20 ק״ג בתשלום, כדאי לוודא מול ארקיע" },
    { id: "m2-e", t: "ארקיע (שינויי שעות, שאלות): +972 3 6903712 (א׳–ה׳ 8:00–22:00, ו׳ 9:00–13:00) · מוקד *5758" },
    { id: "m2-f", t: "מלון Royal Apollonia: Georgios A Street, לימסול. טלפון: +357 25 323351" },
    { id: "m2-g", t: "אישור ההזמנה של המלון מ-Louis Hotels: +357 22 588210" },
    { id: "m2-h", t: "חדר Superior (זוגי/Twin), לינה וארוחת בוקר, 3 לילות, 27–30/11 · צ׳ק-אין 14:00 · צ׳ק-אאוט 12:00" },
    { id: "m2-i", t: "מספרי הזמנה (ארקיע, שובר מלון): להוסיף כאן ידנית" }
  ] },
  { id: "m2t", list: "todo", add: [
    { id: "m2t-a", t: "לברר מול ארקיע כבודה: בכרטיס של עוז אין תיק יד, ואין כבודה לבטן. לרכוש תוספת אם צריך (מתנות וקניות)" },
    { id: "m2t-b", t: "להדפיס 2 עותקים של כרטיסי הטיסה (נדרש לפי ארקיע)" },
    { id: "m2t-c", t: "ביום שני: להיות בשדה בלרנקה עד 11:40. לבדוק אם לצאת מהמלון מוקדם מ-10:45" }
  ] },
  { id: "m3", list: "todo", remove: ["m2t-c"], add: [
    { id: "m3-a", t: "ביום שני: יציאה מהמלון ב-10:30 (צ׳ק-אאוט ב-10:00), להיות בשדה בלרנקה עד 11:40" }
  ] }
];
