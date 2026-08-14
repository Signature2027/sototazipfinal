# Sotota Attendance — Final Mobile UI

A dark, animated, mobile-first school attendance UI inspired by the supplied color direction.

## Includes
- Admin Login
- Teacher Login
- Play, Nursery, Class 1–5
- Admin: Dashboard, Students, Classes, Teachers, Reports
- Add/Edit/Deactivate Student
- Add Class
- Add Teacher + assigned class
- Teacher can only take attendance
- Present / Absent / Leave
- Dress / Shoes / Socks / ID Card checks
- Red animated mark for a uniform problem
- Responsive dark purple/blue professional UI
- Google Sheets Apps Script connector

## Demo accounts
Admin: `admin` / `1234`
Teacher: `teacher01` / `1234` (Class 5)

## GitHub Pages
Upload the files to a GitHub repository and enable:
Settings → Pages → Deploy from branch → main → /root.

## Google Sheets
1. Create a Google Sheet named `Sotota Attendance`.
2. Extensions → Apps Script.
3. Paste `apps-script.gs`.
4. Run `setup()` once and authorize.
5. Deploy → New deployment → Web app.
6. Execute as: Me.
7. Who has access: Anyone.
8. Copy the Web App URL.
9. Open `config.js` and put the URL in `WEB_APP_URL`.
10. Commit the updated `config.js` to GitHub.

Note: This is a working frontend starter. For production, replace demo login credentials with a real authentication system and server-side authorization before public deployment.
