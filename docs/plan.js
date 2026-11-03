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
  windows: { 1: ["12:30", "23:00"], 2: ["09:45", "22:00"], 3: ["10:00", "22:00"], 4: ["08:00", "10:00"] },
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
    { id: "d1-dinner", book: true, ta: "https://www.tripadvisor.com/Search?q=Mazema%20Limassol", day: 1, start: "20:00", dur: 90, type: "food", fixed: true, title: "ארוחת ערב – Mazema", notes: "", reserve: "לוודא הזמנת שולחן ל-20:00 ושהמסעדה פתוחה. אינסטגרם: כנראה @mazemaproject (לא אומת)", lat: 34.673984, lng: 33.039054 },
    { id: "d1-night", day: 1, start: "21:45", dur: 60, type: "food", title: "בילוי בסריפולו: דרינק או קוקטייל", notes: "רחוב וכיכר סריפולו: מדרחוב עם ברים, פאבים ובתי קפה, הכי תוסס בשישי בערב. בברים בכיכר: Salut (Saripolou 71-73), (in)Theory (קוקטייל בר, Saripolou 53), Blue Apple (פתוח 17:00–02:00).", lat: 34.6754273, lng: 33.0431423, radius: 300 },

    { id: "d2-bf", ta: "https://www.tripadvisor.com/Hotel_Review-g3359582-d243531-Reviews-Royal_Apollonia-Germasogeia_Limassol.html", day: 2, start: "08:30", dur: 60, type: "food", fixed: true, title: "ארוחת בוקר במלון", notes: "", lat: 34.6974038, lng: 33.0949755, radius: 300 },
    { id: "d2-kolossi", ta: "https://www.tripadvisor.com/Attraction_Review-g190382-d313647-Reviews-Kolossi_Castle-Limassol_City_Limassol.html", day: 2, start: "10:30", dur: 45, type: "sight", daylight: true, open: "08:30", close: "17:00", title: "טירת קולוסי", notes: "שעות חורף 8:30–17:00. אפשר לוותר כדי להשאיר זמן לספא.", lat: 34.6644, lng: 32.9306 },
    { id: "d2-commandaria", ta: "https://www.tripadvisor.com/Attraction_Review-g1916966-d1759181-Reviews-Cyprus_Wine_Museum-Erimi_Limassol.html", day: 2, start: "11:15", dur: 30, type: "shop", open: "10:00", close: "17:00", title: "טעימת Commandaria במוזיאון היין (ארימי)", lat: 34.670617, lng: 32.911833, radius: 200, notes: "The Cyprus Wine Museum, 42 Pafou, ארימי: כ-3 דקות נסיעה מקולוסי, ובדרך לקוריון. טעימות מודרכות של כמה סגנונות Commandaria (יין הקינוח העתיק שנולד באזור קולוסי). כניסה כ-4–5 יורו, וחבילה עם טעימה כ-10 יורו (לפי אתרי תיירות). אפשר לקנות בקבוק.", reserve: "שעות לפי מקורות שונים: 9:00–17:00 או 10:00–17:00. לוודא בטלפון +357 25 873808 או ב-cypruswinemuseum.com" },
    { id: "d2-kourion", ta: "https://www.tripadvisor.com/Attraction_Review-g190382-d527735-Reviews-Kourion-Limassol_City_Limassol.html", day: 2, start: "11:45", dur: 120, type: "sight", daylight: true, close: "17:00", title: "קוריון העתיקה", notes: "אמפיתיאטרון ופסיפסים.", reserve: "לאשר טלפונית שהאתר פתוח: +357 25 934250", lat: 34.6641, lng: 32.8856 },
    { id: "d2-lunch", ta: "https://www.tripadvisor.com/Restaurant_Review-g190382-d2221890-Reviews-Chris_Blue_Beach-Limassol_City_Limassol.html", day: 2, start: "13:45", dur: 90, type: "food", title: "צהריים – Chris Blue Beach", notes: "חוף קוריון, פתוחה 8:30–22:30.", lat: 34.6658863, lng: 32.8771663 },
    { id: "d2-spa", book: true, ta: "https://www.tripadvisor.com/Hotel_Review-g3359582-d243531-Reviews-Royal_Apollonia-Germasogeia_Limassol.html", day: 2, start: "16:00", dur: 120, type: "rest", soft: true, title: "ספא או מנוחה במלון", notes: "ספא פתוח 9:00–20:00. כדאי טיפול זוגי עם ג׳קוזי.", reserve: "לשריין טיפול זוגי מראש", lat: 34.6974038, lng: 33.0949755, radius: 300 },
    { id: "d2-shop", ta: "https://www.tripadvisor.com/Search?q=Agiou%20Andreou%20Limassol", day: 2, start: "18:30", dur: 60, type: "shop", title: "אגיו אנדראו – קניות ומתנות", notes: "העיר העתיקה, כחצי שעה למתנות.", lat: 34.6764937, lng: 33.0475766 },
    { id: "d2-dinner", book: true, ta: "https://www.tripadvisor.com/Restaurant_Review-g190382-d2369481-Reviews-Meze_Taverna_Restaurant-Limassol_City_Limassol.html", day: 2, start: "19:30", dur: 100, type: "food", fixed: true, closedDays: ["2026-11-29"], title: "ארוחת ערב – MEZE Taverna", notes: "אגיו אנדראו 209. פתוחה עד 22:00, סגורה בראשון.", reserve: "חובה להזמין: +357 25 367333", lat: 34.6764937, lng: 33.0475766 },

    { id: "d3-bf", ta: "https://www.tripadvisor.com/Hotel_Review-g3359582-d243531-Reviews-Royal_Apollonia-Germasogeia_Limassol.html", day: 3, start: "08:45", dur: 60, type: "food", fixed: true, title: "ארוחת בוקר במלון", notes: "", lat: 34.6974038, lng: 33.0949755, radius: 300 },
    { id: "d3-lefkara", ta: "https://www.tripadvisor.com/Tourism-g1900120-Pano_Lefkara_Larnaka_District-Vacations.html", day: 3, start: "11:00", dur: 135, type: "shop", daylight: true, title: "פאנו לפקארה – תחרה, כסף ומתנות", notes: "מוזיאון הפולקלור, כנסיית Timios Stavros, דוכני כפר חג המולד. כשעה לקניות לבנות. לבוש חם (650 מ׳). הדרך בתוך הכפר: בטאב 🗺.", lat: 34.8666, lng: 33.3028, radius: 600 },
    { id: "d3-lunch", book: true, ta2: "https://www.tripadvisor.com/Restaurant_Review-g1900120-d33049687-Reviews-To_Piperi_Tavern-Pano_Lefkara_Larnaka_District.html", ta: "https://www.tripadvisor.com/Restaurant_Review-g1900120-d27781720-Reviews-Iason_Tavern-Pano_Lefkara_Larnaka_District.html", day: 3, start: "13:15", dur: 90, type: "food", open: "12:00", close: "18:30", title: "צהריים – Iason Tavern (גיבוי: To Piperi)", notes: "ראשון 12:00–18:30. To Piperi: 11:30–17:00.", reserve: "אולי להזמין: +357 99 668930", lat: 34.8672, lng: 33.3033, radius: 400 },
    { id: "d3-olive", ta: "https://www.tripadvisor.com/Attraction_Review-g1900120-d14134973-Reviews-Terra_Oliva-Pano_Lefkara_Larnaka_District.html", day: 3, start: "14:50", dur: 30, type: "sight", title: "חוות הזיתים האורגנית Terra Oliva", lat: 34.873001, lng: 33.293633, radius: 300, notes: "החווה כקילומטר מהכפר: Isaac and Solomou Road 12, פאנו לפקארה (olivaterra.eu). כניסה חופשית, חנות עם טעימות. ביקור מלא נמשך בדרך כלל כשעה וחצי, ואנחנו מקצים 30 דק׳.", reserve: "שעות חורף לפי אתר צד שלישי: 8:00–17:00. כדאי לוודא באתר לפני" },
    { id: "d3-view", day: 3, start: "15:30", dur: 30, type: "sight", daylight: true, title: "נקודת תצפית", notes: "נוסעים עוד כ-6 ק״מ מחוות הזיתים לכיוון הכפר Vavatsinia (פחות מ-10 דקות לפי המפה), עד שרואים סככת תצפית מצד ימין. שביל עפר קצר מהכביש הראשי מוביל למצפור." },
    { id: "d3-rest", ta: "https://www.tripadvisor.com/Hotel_Review-g3359582-d243531-Reviews-Royal_Apollonia-Germasogeia_Limassol.html", day: 3, start: "17:00", dur: 130, type: "rest", soft: true, title: "מנוחה במלון", notes: "לחזור לפני החשכה.", lat: 34.6974038, lng: 33.0949755, radius: 300 },
    { id: "d3-dinner", book: true, ta: "https://www.tripadvisor.com/Restaurant_Review-g190382-d26223615-Reviews-Kai_Sushi_Bar_Limassol-Limassol_City_Limassol.html", day: 3, start: "20:00", dur: 90, type: "food", fixed: true, title: "ארוחת ערב – Kai Sushi", notes: "קראון פלאזה, 18:00–23:00.", reserve: "הזמנה דרך המלון: +357 25 851515", lat: 34.688916, lng: 33.0711665 },

    { id: "d4-bf", ta: "https://www.tripadvisor.com/Hotel_Review-g3359582-d243531-Reviews-Royal_Apollonia-Germasogeia_Limassol.html", day: 4, start: "08:30", dur: 45, type: "food", fixed: true, title: "ארוחת בוקר", notes: "", lat: 34.6974038, lng: 33.0949755, radius: 300 },
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
  ] },
  { id: "m4", list: "todo", add: [
    { id: "m4-a", t: "💡 רעיון לערב: The Old Neighbourhood Fish Tavern (טברנת דגים), ליד טירת לימסול. אווירה רומנטית ושקטה, מבחר יינות קפריסאיים. טלפון: 25376082. אפשר לשלב עם סיבוב ברחוב סריפולו התוסס. לבדוק שעות פתיחה והזמנה לפני" }
  ] },
  { id: "m6", list: "todo", remove: ["m4-a"] }
];

// טאב 🗺 (לקריאה בלבד): הדרך בתוך הכפר פאנו לפקארה. places: מקומות שנפתחים במפות לפי שם החיפוש.
window.PLAN.guide = {
  title: "🗺 הדרך בתוך פאנו לפקארה",
  links: [["🚶 המסלול ברגל בגוגל מפות (כולל תמונה של החנייה)", "https://www.google.com/maps/d/viewer?mid=19LTVg8HXpBJkUVPbzYdKvGzETE0YEnY&ll=34.86572910184462%2C33.30560476771263&z=15"]],
  stops: [
    { name: "כניסה לכפר", text: "חונים בכניסה לכפר (ליד המשטרה) והולכים ברגל למרכז.",
      links: [["🅿️ החנייה", "https://maps.app.goo.gl/X1mTNXGMt9N4bfyY6"]] },
    { name: "הרחוב הראשי", text: "חנות Rouvis Lace and Silver, ובפינה בית הקפה Neo Kafe (מבנה צהבהב).",
      places: [["Rouvis Lace and Silver", "Rouvis Lace and Silver Pano Lefkara"], ["Neo Kafe", "Neo Kafe Pano Lefkara"]] },
    { name: "המוזיאון המקומי", text: "בפינת Neo Kafe פונים ימינה ועולים בסמטה. אחרי Hotel Lazaro פונים שמאלה למוזיאון הקטן, עם עבודות יד של תחרה וכסף שיצרו בנות ובני הכפר." },
    { name: "גלריית MOLA", text: "משם לגלריית האמנות MOLA Culture Factory.",
      places: [["MOLA Culture Factory", "MOLA Culture Factory Pano Lefkara"]] },
    { name: "הסמטאות עד הכנסייה", text: "יורדים בסמטאות האבן, ובתחתית ממשיכים בשיטוט עד כנסיית הצלב הקדוש. חוזרים דרך חנויות התחרה, ואפשר לעצור גם ב-Lefkara Handicraft Centre.",
      places: [["Lefkara Handicraft Centre", "Lefkara Handicraft Centre"]] }
  ]
};

// טאב 💡 אלטרנטיבות (לקריאה בלבד): מקומות שלא נכנסו לתוכנית ויכולים לשמש חלופה.
// kind: food | sight. fit: איפה אפשר להכניס. phone/ta/mapq אופציונליים. addTitle/addType/addDur ממלאים את חלון ההוספה.
window.PLAN.alternatives = [
  { id: "alt-oldnb", kind: "food", name: "The Old Neighbourhood Fish Tavern",
    about: "טברנת דגים קטנה, Agkyras 14, ליד טירת לימסול. לפי הטיפ: אווירה רומנטית ושקטה יותר מרחוב סריפולו התוסס, עם מבחר רחב של יינות קפריסאיים. ב-TripAdvisor: 4.4 מ-50 ביקורות, מצוינת על דגים טריים. כמה ביקורות מציינות שהיא יקרה. כדאי להזמין מראש, כי היא קטנה.",
    fit: "במקום ארוחת ערב ב-Mazema (שישי 20:00) או ב-Kai Sushi (ראשון 20:00)",
    phone: "25376082", lat: 34.673822, lng: 33.041595, mapq: "The Old Neighbourhood Fish Tavern Limassol", ta: "https://www.tripadvisor.com/Restaurant_Review-g190382-d5062041-Reviews-The_Old_Neighborhood_Taverna-Limassol_City_Limassol.html",
    addTitle: "ארוחת ערב – The Old Neighbourhood Fish Tavern", addType: "food", addDur: 90, addNotes: "טלפון: 25376082. לבדוק שעות פתיחה והזמנה" },
  { id: "alt-garden", kind: "food", name: "The Garden",
    about: "מסעדה וקוקטייל בר עם גינה ירוקה ואווירה נעימה, Vasileos Georgiou 48A, Germasogeia. כ-700 מטר מהמלון, בערך 10 דקות הליכה. לפי TripAdvisor: מטבח איטלקי ויפני, 4.2 מ-542 ביקורות, אווירה 4.6, פתוחה עד חצות. ביקורות מציינות יין וקוקטיילים, ושירות איטי לפעמים. המחירים בינוניים-גבוהים, והאוכל פחות קפריסאי ויותר בינלאומי.",
    fit: "קוקטייל ליד המלון בערב עייף, למשל בראשון אחרי יום לפקארה, בלי לנסוע לעיר העתיקה",
    phone: "25101212", lat: 34.694611, lng: 33.088639, mapq: "The Garden Restaurant Vasileos Georgiou 48A Germasogeia Limassol", ta: "https://www.tripadvisor.com/Restaurant_Review-g3359582-d3540323-Reviews-The_Garden_Restaurant-Germasogeia_Limassol.html", check: "לוודא שזו המסעדה שהמליצו עליה",
    addTitle: "קוקטייל ב-The Garden (ליד המלון)", addType: "food", addDur: 60, addNotes: "טלפון: 25101212. פתוחה עד חצות. כ-10 דקות הליכה מהמלון" }
];
