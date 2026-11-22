# בדיקות

`./tests/run-all.sh` מריץ הכול (כ-3 דקות). קבצים:

| קובץ | מה נבדק |
|---|---|
| logic.test.js | מנוע ההתאמה (docs/logic.js): העברות, איחור, אימות הצעות |
| worker-core.test.mjs | Worker: סנכרון חדרים, מנויי דחיפה, חתימת VAPID, "הספקתם?" |
| worker-reminders.test.mjs | Worker: הודעת בוקר, "צריך לצאת", הזמנות, שמות/שעות שהוחלפו |
| service-worker.test.mjs | docs/sw.js: התראות, כפתורים (2 או 3), נווט, אישור/דחייה |
| ui-*.js | ממשק בדפדפן (Playwright): סנכרון, קול, דילוג/ויתור, התראות, מזג אוויר/מידע, הזמנות, מיגרציות, עריכה, גרירה (עכבר ומגע), הצעות מהקבוצה |

`mock-sync-server.mjs` מריץ את קוד ה-Worker האמיתי מול KV בזיכרון, עם Claude ושליחת דחיפה מדומים.
`sync-worker.mjs` נוצר אוטומטית מ-`cyprus-worker/sync-worker.js` (לא נשמר ב-git).

## הערה: סידור שבת וראשון
בגרסה 57 הוחלפו תוכניות שבת וראשון. בדיקות המנגנונים (ui-*, worker-core/reminders) נכתבו על הסידור הישן, ולכן `prepare.mjs` (נקרא מ-`run-all.sh`) יוצר ב-`tests/.site` ו-`tests/sync-worker.mjs` עותקים עם הימים של 10 הפעילויות מוחזרים. כך שינויי תוכנית לא שוברים בדיקות של מנגנונים. `plan-live.test.js` ו-`logic.test.js` בודקים את התוכנית החיה עצמה.
