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
