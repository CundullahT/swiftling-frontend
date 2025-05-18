import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/signup" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="flex-1 text-center">
            <img src="/assets/logo.png" alt="SwiftLing Logo" className="h-10 w-auto inline-block" />
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-sm mb-8">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          <div className="text-gray-700 space-y-6">
            <p className="text-lg font-medium text-gray-900">Effective Date: May 18, 2025</p>
            
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-800">Information We Collect</h2>
              <p><strong>User‑Provided:</strong> First name, last name, email address, password.</p>
              <p><strong>Automatically:</strong> Session cookies, CSRF tokens, localStorage/sessionStorage for interface preferences.</p>
            </section>
            
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-800">Purpose of Processing</h2>
              <p>Your data is processed to:</p>
              <ul className="list-disc pl-6">
                <li>Authenticate and manage your account.</li>
                <li>Provide, maintain, and improve SwiftLing services.</li>
                <li>Communicate updates and support information.</li>
                <li>Comply with legal obligations.</li>
              </ul>
            </section>
            
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-800">Cookies & Tracking Technologies</h2>
              <p>SwiftLing sets session cookies to maintain your login state and CSRF tokens to secure form submissions. LocalStorage/sessionStorage retain user preferences, such as theme and language.</p>
            </section>
            
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-800">Data Security</h2>
              <p>Industry‑standard measures are in place—encryption in transit and at rest, access controls, and regular security assessments—to protect your personal data.</p>
            </section>
            
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-800">Third‑Party Services</h2>
              <p>SwiftLing integrates with select third‑party services (e.g., analytics, email providers). All partners adhere to equivalent data protection standards.</p>
            </section>
            
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-800">Data Retention</h2>
              <p>Personal data is retained only as long as necessary to provide services, comply with legal obligations, or resolve disputes.</p>
            </section>
            
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-800">Your Rights</h2>
              <p>Subject to local law, you may: access, correct, or delete your data; restrict or object to processing; and receive a portable copy of your data. You may withdraw consent where processing is based on consent.</p>
            </section>
            
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-800">Children's Privacy</h2>
              <p>SwiftLing is not directed to children under 13. The developer does not knowingly collect data from minors, and any such data discovered is promptly deleted.</p>
            </section>
            
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-800">International Transfers</h2>
              <p>Your data may be processed in countries outside your residence. Appropriate safeguards—such as standard contractual clauses—ensure adequate protection.</p>
            </section>
            
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-800">Changes to This Policy</h2>
              <p>This Privacy Policy may be updated periodically. The "Effective Date" header indicates the latest version. Continued use implies acceptance of any updates.</p>
            </section>
            
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-800">Contact Information</h2>
              <p>For privacy inquiries, contact:</p>
              <p>SwiftLing Privacy Team<br />Email: privacy@swiftling.com</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}