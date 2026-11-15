# Tappy — public product demonstration

An isolated, browser-only demonstration of Tappy's Electric Lime loyalty experience. All members, balances, rewards, and operations are fictional. No account is needed.

## Included

- Responsive marketing homepage, product explanation and planned USD 32/month subscription, plus applicable taxes.
- Interactive STAMPS, POINTS and BOTH simulation. Nine qualifying purchases unlock a stamp reward; redeeming is a separate tenth visit.
- Card design with readable contrast fallback, fictional alias enrollment, sample membership art, transaction history, and a location management preview.
- English, Arabic RTL, Turkish, French and Spanish. Only language preference is persisted; sample data resets when the page reloads.
- Google Wallet requirements explained honestly. No real pass issuance, scanning credential, authentication, payment or customer API is available.

## Security boundary

This repository is for the public static demo ONLY. Do not add the private Tappy application, Prisma schema, SQLite data, environment files, service-account credentials, private keys, sessions, QR secrets, or real customer information. The content security policy blocks API connections and form submissions. Do not enter real personal data in demo forms.

## Deployment

Static files use relative URLs and hash navigation, so they work under the GitHub Pages project path `/Tappy-Demo/`. The `pages.yml` workflow copies only the six listed public files into the deployment artifact. Select **GitHub Actions** as the Pages source. No package installation or backend is required.

The original `ahmethaithem/Saas` repository and website are independent and remain untouched.

## Local development within the original workspace

Run `node --test demo/tests/demo.test.mjs` and `node demo/build.mjs` from the Tappy workspace. Serve `demo/site/` with any local static web server. Never serve the original application directory publicly.
