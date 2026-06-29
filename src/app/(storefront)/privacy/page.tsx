import { getStoreProfile } from "@/server/services/store";

export const metadata = { title: "Privacy policy" };

export default async function PrivacyPage() {
  const profile = await getStoreProfile();
  const storeName = profile.storeName ?? "ASPORTS ZONE";
  const email     = profile.email     ?? "asportszone@gmail.com";

  const sections: { h: string; body: string }[] = [
    {
      h: "What we collect",
      body: `We collect the information you give us to fulfil orders — name, email, shipping address and phone — plus order history and basic usage data needed to run the store. Payment details are handled directly by our payment providers (Razorpay / Stripe); we never store full card numbers.`,
    },
    {
      h: "How we use it",
      body: `Your data is used to process and ship orders, provide support, send order updates, run our loyalty and referral programs, and improve the store. We do not sell your personal data.`,
    },
    {
      h: "Sharing",
      body: `We share data only with the providers needed to operate: payment gateways, shipping/logistics, email/SMS notification services, and hosting. Each handles your data under their own terms.`,
    },
    {
      h: "Your rights",
      body: `You can export all of your data or delete your account at any time from your account page. Deleting removes your personal data; completed orders are retained in anonymized form for accounting and legal requirements.`,
    },
    {
      h: "Cookies",
      body: `We use essential cookies for sign-in sessions, your cart, and language/currency preferences. No third-party advertising cookies are set.`,
    },
    {
      h: "Contact",
      body: `Questions about your data or this policy? Email us at ${email}.`,
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Privacy policy</h1>
      <p className="mt-3 text-sm text-muted">How {storeName} handles your personal data.</p>

      <div className="mt-8 space-y-8">
        {sections.map(({ h, body }) => (
          <section key={h}>
            <h2 className="mb-2 text-lg font-semibold">{h}</h2>
            <p className="text-sm leading-relaxed text-muted">{body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
