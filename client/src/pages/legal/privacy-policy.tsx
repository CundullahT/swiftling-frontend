import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="flex flex-col items-center">
          <img src="/assets/logo.png" alt="SwiftLing Logo" className="h-16 w-auto mb-4" />
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Privacy Policy
          </h2>
          <div className="mt-4 flex justify-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/signup">
                Sign Up
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/login">
                Log In
              </Link>
            </Button>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <p className="text-lg font-medium text-gray-900 mb-6">Effective Date: May 18, 2025</p>
            
            <section className="space-y-3 mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Information We Collect</h3>
              <p><strong>User‑Provided:</strong> First name, last name, email address, password.</p>
              <p><strong>Automatically:</strong> Session cookies, CSRF tokens, localStorage/sessionStorage for interface preferences.</p>
            </section>
            
            <section className="space-y-3 mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Purpose of Processing</h3>
              <p>Your data is processed to:</p>
              <ul className="list-disc pl-6">
                <li>Authenticate and manage your account.</li>
                <li>Provide, maintain, and improve SwiftLing services.</li>
                <li>Communicate updates and support information.</li>
                <li>Comply with legal obligations.</li>
              </ul>
            </section>
            
            <section className="space-y-3 mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Cookies & Tracking Technologies</h3>
              <p>SwiftLing sets session cookies to maintain your login state and CSRF tokens to secure form submissions. LocalStorage/sessionStorage retain user preferences, such as theme and language.</p>
            </section>
            
            <section className="space-y-3 mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Data Security</h3>
              <p>Industry‑standard measures are in place—encryption in transit and at rest, access controls, and regular security assessments—to protect your personal data.</p>
            </section>
            
            <section className="space-y-3 mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Third‑Party Services</h3>
              <p>SwiftLing integrates with select third‑party services (e.g., analytics, email providers). All partners adhere to equivalent data protection standards.</p>
            </section>
            
            <section className="space-y-3 mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Data Retention</h3>
              <p>Personal data is retained only as long as necessary to provide services, comply with legal obligations, or resolve disputes.</p>
            </section>
            
            <section className="space-y-3 mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Your Rights</h3>
              <p>Subject to local law, you may: access, correct, or delete your data; restrict or object to processing; and receive a portable copy of your data. You may withdraw consent where processing is based on consent.</p>
            </section>
            
            <section className="space-y-3 mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Children's Privacy</h3>
              <p>SwiftLing is not directed to children under 13. The developer does not knowingly collect data from minors, and any such data discovered is promptly deleted.</p>
            </section>
            
            <section className="space-y-3 mb-6">
              <h3 className="text-xl font-semibold text-gray-800">International Transfers</h3>
              <p>Your data may be processed in countries outside your residence. Appropriate safeguards—such as standard contractual clauses—ensure adequate protection.</p>
            </section>
            
            <section className="space-y-3 mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Changes to This Policy</h3>
              <p>This Privacy Policy may be updated periodically. The "Effective Date" header indicates the latest version. Continued use implies acceptance of any updates.</p>
            </section>
            
            <section className="space-y-3">
              <h3 className="text-xl font-semibold text-gray-800">Contact Information</h3>
              <p>For privacy inquiries, contact:</p>
              <p>SwiftLing Privacy Team<br />Email: privacy@swiftling.com</p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}