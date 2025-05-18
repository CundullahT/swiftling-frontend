import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
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
          <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
          <div className="text-gray-700 space-y-6">
            <p className="text-lg font-medium text-gray-900">Effective Date: May 18, 2025</p>
            
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-800">Acceptance of Terms</h2>
              <p>By accessing or using SwiftLing, you agree to these Terms of Service, which form a binding agreement between you and the individual developer of SwiftLing.</p>
            </section>
            
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-800">Developer Account & Distribution</h2>
              <p>SwiftLing is published under a personal developer account on Google Play and Apple's App Store. You must comply with both platforms' distribution and content guidelines.</p>
            </section>
            
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-800">Account Registration & Authentication</h2>
              <p>You register by providing your first name, last name, email address, and password. SwiftLing uses session cookies to maintain authentication state, CSRF tokens to secure requests, and localStorage/sessionStorage to store user preferences (e.g., theme, language).</p>
            </section>
            
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-800">User Conduct</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6">
                <li>Violate applicable laws or third‑party rights.</li>
                <li>Interfere with SwiftLing's security or operation.</li>
                <li>Attempt unauthorized access to any account.</li>
              </ul>
            </section>
            
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-800">Intellectual Property</h2>
              <p>All code, graphics, UI elements, and content are owned or licensed by the individual developer. You may not reproduce, distribute, or create derivative works without express written permission.</p>
            </section>
            
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-800">Disclaimers & Limitation of Liability</h2>
              <p>SwiftLing is provided "as is" and "as available." To the fullest extent permitted by law, the developer disclaims all warranties and shall not be liable for any indirect, incidental, or consequential damages arising from your use of SwiftLing.</p>
            </section>
            
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-800">Governing Law & Dispute Resolution</h2>
              <p>These Terms are governed by the laws of your country of residence. Any disputes will be resolved by binding arbitration in your jurisdiction, unless prohibited by local law.</p>
            </section>
            
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-800">Changes to Terms</h2>
              <p>These Terms may be updated at any time. The "Effective Date" header reflects the most recent revision. Continued use constitutes acceptance of the updated Terms.</p>
            </section>
            
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-800">Contact Information</h2>
              <p>For any questions regarding these Terms, contact:</p>
              <p>SwiftLing Support<br />Email: support@swiftling.com</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}