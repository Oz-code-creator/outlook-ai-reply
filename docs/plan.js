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
  windows: { 1: ["12:30", "22:00"], 2: ["09:45", "22:00"], 3: ["10:00", "22:00"], 4: ["08:00", "10:15"] },
  context: [
    "זוג, שתי בנות צעירות בבית — רוצים לקנות להן מתנות.",
    "מלון Royal Apollonia (חוף לימסול המזרחי, ~15 דקות מהעיר העתיקה).",
    "מזג אוויר: ~22°C ביום, ~17°C בלילה, שקיעה ~16:30–16:45. הים קריר.",
    "העדפות: יציאה בכל ערב, הפסקת התרעננות בחדר אחה״צ, ארוחות מסורתיות עם קצת גיוון, מחיר לא משנה.",
    "לפקארה ביום ראשון (לא בשבת). MEZE Taverna סגורה בראשון.",
    "טיסה חזרה 30/11 ב-14:40 מלרנקה; יציאה לשדה ~10:45.",
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
    { id: "d1-dinner", ta: "https://www.tripadvisor.com/Search?q=Mazema%20Limassol", day: 1, start: "20:00", dur: 90, type: "food", fixed: true, title: "ארוחת ערב – Mazema", notes: "", reserve: "לוודא הזמנת שולחן ל-20:00 ושהמסעדה פתוחה", lat: 34.673984, lng: 33.039054 },

    { id: "d2-bf", ta: "https://www.tripadvisor.com/Hotel_Review-g3359582-d243531-Reviews-Royal_Apollonia-Germasogeia_Limassol.html", day: 2, start: "08:30", dur: 60, type: "food", fixed: true, title: "ארוחת בוקר במלון", notes: "", lat: 34.6974038, lng: 33.0949755, radius: 300 },
    { id: "d2-kolossi", ta: "https://www.tripadvisor.com/Attraction_Review-g190382-d313647-Reviews-Kolossi_Castle-Limassol_City_Limassol.html", day: 2, start: "10:30", dur: 45, type: "sight", daylight: true, open: "08:30", close: "17:00", title: "טירת קולוסי", notes: "שעות חורף 8:30–17:00. אפשר לוותר כדי להשאיר זמן לספא.", lat: 34.6644, lng: 32.9306 },
    { id: "d2-kourion", ta: "https://www.tripadvisor.com/Attraction_Review-g190382-d527735-Reviews-Kourion-Limassol_City_Limassol.html", day: 2, start: "11:30", dur: 120, type: "sight", daylight: true, close: "17:00", title: "קוריון העתיקה", notes: "אמפיתיאטרון ופסיפסים.", reserve: "לאשר טלפונית שהאתר פתוח: +357 25 934250", lat: 34.6641, lng: 32.8856 },
    { id: "d2-lunch", ta: "https://www.tripadvisor.com/Restaurant_Review-g190382-d2221890-Reviews-Chris_Blue_Beach-Limassol_City_Limassol.html", day: 2, start: "13:45", dur: 90, type: "food", title: "צהריים – Chris Blue Beach", notes: "חוף קוריון, פתוחה 8:30–22:30.", lat: 34.6658863, lng: 32.8771663 },
    { id: "d2-spa", ta: "https://www.tripadvisor.com/Hotel_Review-g3359582-d243531-Reviews-Royal_Apollonia-Germasogeia_Limassol.html", day: 2, start: "16:00", dur: 120, type: "rest", soft: true, title: "ספא או מנוחה במלון", notes: "ספא פתוח 9:00–20:00. כדאי טיפול זוגי עם ג׳קוזי.", reserve: "לשריין טיפול זוגי מראש", lat: 34.6974038, lng: 33.0949755, radius: 300 },
    { id: "d2-shop", ta: "https://www.tripadvisor.com/Search?q=Agiou%20Andreou%20Limassol", day: 2, start: "18:30", dur: 60, type: "shop", title: "אגיו אנדראו – קניות ומתנות", notes: "העיר העתיקה, כחצי שעה למתנות.", lat: 34.6764937, lng: 33.0475766 },
    { id: "d2-dinner", ta: "https://www.tripadvisor.com/Restaurant_Review-g190382-d2369481-Reviews-Meze_Taverna_Restaurant-Limassol_City_Limassol.html", day: 2, start: "19:30", dur: 100, type: "food", fixed: true, closedDays: ["2026-11-29"], title: "ארוחת ערב – MEZE Taverna", notes: "אגיו אנדראו 209. פתוחה עד 22:00, סגורה בראשון.", reserve: "חובה להזמין: +357 25 367333", lat: 34.6764937, lng: 33.0475766 },

    { id: "d3-bf", ta: "https://www.tripadvisor.com/Hotel_Review-g3359582-d243531-Reviews-Royal_Apollonia-Germasogeia_Limassol.html", day: 3, start: "08:45", dur: 60, type: "food", fixed: true, title: "ארוחת בוקר במלון", notes: "", lat: 34.6974038, lng: 33.0949755, radius: 300 },
    { id: "d3-lefkara", ta: "https://www.tripadvisor.com/Tourism-g1900120-Pano_Lefkara_Larnaka_District-Vacations.html", day: 3, start: "11:00", dur: 135, type: "shop", daylight: true, title: "פאנו לפקארה – תחרה, כסף ומתנות", notes: "מוזיאון הפולקלור, כנסיית Timios Stavros, דוכני כפר חג המולד. כשעה לקניות לבנות. לבוש חם (650 מ׳).", lat: 34.8666, lng: 33.3028, radius: 600 },
    { id: "d3-lunch", ta2: "https://www.tripadvisor.com/Restaurant_Review-g1900120-d33049687-Reviews-To_Piperi_Tavern-Pano_Lefkara_Larnaka_District.html", ta: "https://www.tripadvisor.com/Restaurant_Review-g1900120-d27781720-Reviews-Iason_Tavern-Pano_Lefkara_Larnaka_District.html", day: 3, start: "13:15", dur: 90, type: "food", open: "12:00", close: "18:30", title: "צהריים – Iason Tavern (גיבוי: To Piperi)", notes: "ראשון 12:00–18:30. To Piperi: 11:30–17:00.", reserve: "אולי להזמין", lat: 34.8672, lng: 33.3033, radius: 400 },
    { id: "d3-rest", ta: "https://www.tripadvisor.com/Hotel_Review-g3359582-d243531-Reviews-Royal_Apollonia-Germasogeia_Limassol.html", day: 3, start: "16:30", dur: 160, type: "rest", soft: true, title: "מנוחה במלון", notes: "לחזור לפני החשכה.", lat: 34.6974038, lng: 33.0949755, radius: 300 },
    { id: "d3-dinner", ta: "https://www.tripadvisor.com/Restaurant_Review-g190382-d26223615-Reviews-Kai_Sushi_Bar_Limassol-Limassol_City_Limassol.html", day: 3, start: "20:00", dur: 90, type: "food", fixed: true, title: "ארוחת ערב – Kai Sushi", notes: "קראון פלאזה, 18:00–23:00.", reserve: "הזמנה דרך המלון: +357 25 851515", lat: 34.688916, lng: 33.0711665 },

    { id: "d4-bf", ta: "https://www.tripadvisor.com/Hotel_Review-g3359582-d243531-Reviews-Royal_Apollonia-Germasogeia_Limassol.html", day: 4, start: "08:30", dur: 45, type: "food", fixed: true, title: "ארוחת בוקר", notes: "", lat: 34.6974038, lng: 33.0949755, radius: 300 },
    { id: "d4-walk", day: 4, start: "09:15", dur: 45, type: "sight", title: "הליכה על החוף", notes: "", lat: 34.6974038, lng: 33.0949755, radius: 400 },
    { id: "d4-checkout", ta: "https://www.tripadvisor.com/Hotel_Review-g3359582-d243531-Reviews-Royal_Apollonia-Germasogeia_Limassol.html", day: 4, start: "10:15", dur: 30, type: "rest", fixed: true, title: "צ׳ק-אאוט", notes: "עד 12:00.", lat: 34.6974038, lng: 33.0949755, radius: 300 },
    { id: "d4-airport", day: 4, start: "10:45", dur: 60, type: "travel", fixed: true, title: "נסיעה לשדה לרנקה", notes: "~52 ק״מ. להיות בשדה 2.5–3 שעות לפני. מתנות אחרונות בשדה.", lat: 34.8751, lng: 33.6249, radius: 1500 },
    { id: "d4-flight", day: 4, start: "14:40", dur: 60, type: "travel", fixed: true, title: "טיסה חזרה", notes: "המראה 14:40, נחיתה 15:40 (שעות עשויות להשתנות).", lat: 34.8751, lng: 33.6249, radius: 1500 }
  ]
};
