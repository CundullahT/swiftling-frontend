import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="flex flex-col items-center">
          <img src="/assets/logo.png" alt="SwiftLing Logo" className="h-16 w-auto mb-4" />
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Terms of Service
          </h2>
          <div className="mt-4 flex justify-center space-x-4">
            <Button 
              className="bg-[#1dccbe] hover:bg-[#19b8ab] text-white border-0"
              asChild
            >
              <Link href="/signup">
                Sign Up
              </Link>
            </Button>
            <Button 
              className="bg-white border-[#1dccbe] border text-[#1dccbe] hover:bg-[#f0f9f8]"
              asChild
            >
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
              <h3 className="text-xl font-semibold text-gray-800">Acceptance of Terms</h3>
              <p>By accessing or using SwiftLing, you agree to these Terms of Service, which form a binding agreement between you and the individual developer of SwiftLing.</p>
            </section>
            
            <section className="space-y-3 mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Developer Account & Distribution</h3>
              <p>SwiftLing is published under a personal developer account on Google Play and Apple's App Store. You must comply with both platforms' distribution and content guidelines.</p>
            </section>
            
            <section className="space-y-3 mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Account Registration & Authentication</h3>
              <p>You register by providing your first name, last name, email address, and password. SwiftLing uses session cookies to maintain authentication state, CSRF tokens to secure requests, and localStorage/sessionStorage to store user preferences (e.g., theme, language).</p>
            </section>
            
            <section className="space-y-3 mb-6">
              <h3 className="text-xl font-semibold text-gray-800">User Conduct</h3>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6">
                <li>Violate applicable laws or third‑party rights.</li>
                <li>Interfere with SwiftLing's security or operation.</li>
                <li>Attempt unauthorized access to any account.</li>
              </ul>
            </section>
            
            <section className="space-y-3 mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Intellectual Property</h3>
              <p>All code, graphics, UI elements, and content are owned or licensed by the individual developer. You may not reproduce, distribute, or create derivative works without express written permission.</p>
            </section>
            
            <section className="space-y-3 mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Disclaimers & Limitation of Liability</h3>
              <p>SwiftLing is provided "as is" and "as available." To the fullest extent permitted by law, the developer disclaims all warranties and shall not be liable for any indirect, incidental, or consequential damages arising from your use of SwiftLing.</p>
            </section>
            
            <section className="space-y-3 mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Governing Law & Dispute Resolution</h3>
              <p>These Terms are governed by the laws of your country of residence. Any disputes will be resolved by binding arbitration in your jurisdiction, unless prohibited by local law.</p>
            </section>
            
            <section className="space-y-3 mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Changes to Terms</h3>
              <p>These Terms may be updated at any time. The "Effective Date" header reflects the most recent revision. Continued use constitutes acceptance of the updated Terms.</p>
            </section>
            
            <section className="space-y-3">
              <h3 className="text-xl font-semibold text-gray-800">Contact Information</h3>
              <p>For any questions regarding these Terms, contact:</p>
              <p>SwiftLing Support<br />Email: support@swiftlingapp.com</p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}