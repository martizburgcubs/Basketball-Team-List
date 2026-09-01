JUNIOR JOI TEAM LIST - COMPLETE SYSTEM

WHAT THIS PACKAGE DOES
1. Coaches open index.html / your public Cloudflare link.
2. They fill in the roster and click SEND TEAM LIST.
3. There is NO approval step.
4. The roster is immediately stored in your existing Supabase project.
5. You open /admin.html, sign in, see every submission, open it and PRINT / SAVE PDF.

FILES
index.html       - public coach form
styles.css       - public design
app.js           - public form logic and direct submission
admin.html       - private organiser dashboard
admin.css        - dashboard styling
admin.js         - dashboard login, list, view and print
config.js        - your existing Supabase Project URL + publishable/anon key
supabase-setup.sql
assets/

IMPORTANT
- Run supabase-setup.sql in the EXISTING Supabase project.
- Put your existing Supabase URL and publishable/anon key in config.js.
- In Supabase go to Authentication > Users and create ONE admin user for yourself.
- The public coach page cannot browse other schools' submissions.
- The admin page requires Supabase Authentication.

ADMIN URL AFTER CLOUDFLARE DEPLOYMENT
https://YOUR-SITE.pages.dev/admin.html
