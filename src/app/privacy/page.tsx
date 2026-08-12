import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description: "Madrid Cricket Club privacy notice — how we collect, use and protect your personal data.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-16 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="container-content px-4">
          <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-5xl font-display font-bold text-white mb-4">Privacy Notice</h1>
          <p className="text-slate-400">Last updated: August 2026</p>
        </div>
      </section>

      <section className="section bg-slate-950 pt-0">
        <div className="container-content px-4">
          <div className="glass-dark p-8 md:p-12 prose max-w-none">
            <div className="space-y-8 text-slate-300 leading-relaxed">

              <div>
                <h2 className="text-2xl font-display font-bold text-white mb-3">1. Who we are</h2>
                <p>
                  Madrid Cricket Club ("the Club", "we", "us") is an amateur sports club based in Madrid, Spain. We are affiliated to Cricket España, the national governing body for cricket in Spain.
                </p>
                <p className="mt-2">
                  Our contact email for data-related enquiries is{" "}
                  <a href="mailto:secretary@madridcricketclub.es" className="text-brand-400 hover:text-brand-300">
                    secretary@madridcricketclub.es
                  </a>
                  .
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold text-white mb-3">2. What data we collect</h2>
                <p>When you apply for membership we collect:</p>
                <ul className="mt-3 space-y-1 ml-4 list-disc list-outside marker:text-brand-400">
                  {[
                    "Full legal name and preferred name",
                    "Date of birth and nationality",
                    "Gender (as required by Cricket España)",
                    "Identity document type and number (DNI/NIE/Passport)",
                    "Residential address",
                    "Mobile number and email address",
                    "Emergency contact name, relationship and phone number",
                    "Relevant medical information and dietary requirements",
                    "Playing information (role, previous clubs, kit size)",
                    "Photo and media consent",
                    "Parent/guardian details for members under 18",
                  ].map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="mt-3">
                  We also collect usage data when you use the members' platform (availability responses, payment declarations, etc.).
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold text-white mb-3">3. Why we collect it (legal basis)</h2>
                <div className="space-y-3">
                  <div className="glass p-4 rounded-xl">
                    <p className="font-semibold text-white">Contract performance</p>
                    <p className="text-sm mt-1">To manage your membership, collect fees and administer club activities.</p>
                  </div>
                  <div className="glass p-4 rounded-xl">
                    <p className="font-semibold text-white">Legal obligation</p>
                    <p className="text-sm mt-1">To register you with Cricket España for insurance purposes as required by the national governing body.</p>
                  </div>
                  <div className="glass p-4 rounded-xl">
                    <p className="font-semibold text-white">Legitimate interests</p>
                    <p className="text-sm mt-1">To run our club, communicate with members, and maintain historical records.</p>
                  </div>
                  <div className="glass p-4 rounded-xl">
                    <p className="font-semibold text-white">Consent</p>
                    <p className="text-sm mt-1">For photography and media use where you have given explicit consent.</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold text-white mb-3">4. Who we share it with</h2>
                <p>
                  <strong className="text-white">Cricket España:</strong> We share your registration data with Cricket España annually for insurance and affiliation purposes. This is sent as a secure, encrypted file. We maintain a disclosure log of all data shared.
                </p>
                <p className="mt-2">
                  We do not sell, rent or otherwise share your personal data with third parties for marketing or commercial purposes.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold text-white mb-3">5. How long we keep it</h2>
                <p>
                  At the start of each membership year, sensitive identity data (identity document numbers, date of birth, medical information) from the previous year is deleted. You will be asked to provide this again at renewal. Your name, contact details and club history are retained indefinitely to support re-joining and historical records.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold text-white mb-3">6. Your rights</h2>
                <p>Under the GDPR and Spanish data protection law (LOPDGDD) you have the right to:</p>
                <ul className="mt-3 space-y-1 ml-4 list-disc list-outside marker:text-brand-400">
                  <li>Access a copy of the personal data we hold about you</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data (subject to our retention obligations)</li>
                  <li>Object to or restrict our processing</li>
                  <li>Data portability</li>
                  <li>Lodge a complaint with the Spanish data protection authority (AEPD) at www.aepd.es</li>
                </ul>
                <p className="mt-3">To exercise any of these rights, contact us at secretary@madridcricketclub.es.</p>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold text-white mb-3">7. Data security</h2>
                <p>
                  We use industry-standard security practices: passwords are stored using a computationally-hard hashing algorithm (argon2id), sensitive data is encrypted at rest and in transit, and access to personal data is restricted by role. Two-factor authentication is mandatory for all administrators.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
