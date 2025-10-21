import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import Navbar from "@/components/landing/Navbar";
import React from "react";

const TermsPage = () => {
  return (
    <div>
      <Navbar />
      <Header title="Terms of Service" />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-10 w-full py-16">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <div className="mb-12">
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <p className="text-gray-600 leading-relaxed">
              These Terms of Service ("Terms") govern your use of our learning 
              management system and related services. By accessing or using our 
              platform, you agree to be bound by these Terms. Please read them 
              carefully before using our services.
            </p>
          </div>

          {/* Acceptance of Terms */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By creating an account, accessing, or using our platform, you acknowledge 
              that you have read, understood, and agree to be bound by these Terms and 
              our Privacy Policy. If you do not agree to these Terms, you may not use 
              our services.
            </p>
          </section>

          {/* Eligibility */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Eligibility</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              To use our services, you must:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Be at least 13 years of age</li>
              <li>Have the legal capacity to enter into these Terms</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          {/* User Accounts */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">User Accounts</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              When you create an account with us, you agree to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information as necessary</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          {/* Platform Use */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Use and Restrictions</h2>
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Permitted Use</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                You may use our platform for legitimate educational purposes, including:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Enrolling in and completing courses</li>
                <li>Accessing educational content and materials</li>
                <li>Participating in discussions and forums</li>
                <li>Creating and sharing educational content (if authorized)</li>
              </ul>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Prohibited Activities</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Share your account credentials with others</li>
                <li>Upload malicious software or harmful content</li>
                <li>Infringe on intellectual property rights</li>
                <li>Engage in harassment or abusive behavior</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use our platform for commercial purposes without permission</li>
              </ul>
            </div>
          </section>

          {/* Content and Intellectual Property */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Content and Intellectual Property</h2>
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Content</h3>
              <p className="text-gray-600 leading-relaxed">
                All content on our platform, including courses, materials, text, graphics, 
                logos, and software, is owned by us or our licensors and is protected by 
                copyright, trademark, and other intellectual property laws.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">User Content</h3>
              <p className="text-gray-600 leading-relaxed">
                By submitting content to our platform, you grant us a non-exclusive, 
                worldwide, royalty-free license to use, modify, and display your content 
                in connection with our services. You retain ownership of your content 
                and are responsible for ensuring you have the right to share it.
              </p>
            </div>
          </section>

          {/* Payments and Refunds */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Payments and Refunds</h2>
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Course Purchases</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                When you purchase a course:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>All prices are listed in USD unless otherwise specified</li>
                <li>Payment is required before accessing course content</li>
                <li>You receive a lifetime license to access purchased content</li>
                <li>Prices may change without notice for future purchases</li>
              </ul>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Refund Policy</h3>
              <p className="text-gray-600 leading-relaxed">
                We offer a 30-day money-back guarantee for course purchases. 
                Refund requests must be submitted within 30 days of purchase 
                and may be subject to certain conditions and restrictions.
              </p>
            </div>
          </section>

          {/* Privacy and Data Protection */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy and Data Protection</h2>
            <p className="text-gray-600 leading-relaxed">
              Your privacy is important to us. Our collection, use, and protection 
              of your personal information is governed by our Privacy Policy, 
              which is incorporated into these Terms by reference.
            </p>
          </section>

          {/* Disclaimers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Disclaimers</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Our platform and services are provided "as is" and "as available" 
              without warranties of any kind. We disclaim all warranties, including:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Merchantability and fitness for a particular purpose</li>
              <li>Non-infringement of third-party rights</li>
              <li>Uninterrupted or error-free service</li>
              <li>Accuracy or completeness of content</li>
              <li>Security of data transmission</li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              To the maximum extent permitted by law, we shall not be liable for 
              any indirect, incidental, special, consequential, or punitive damages, 
              including but not limited to loss of profits, data, or use, arising 
              from your use of our platform.
            </p>
          </section>

          {/* Termination */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Termination</h2>
            <p className="text-gray-600 leading-relaxed">
              We may terminate or suspend your account and access to our services 
              at any time, with or without cause, and with or without notice. 
              You may also terminate your account at any time by contacting us. 
              Upon termination, your right to use our platform will cease immediately.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Changes to These Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will 
              notify you of material changes by posting the updated Terms on 
              our platform and updating the "Last updated" date. Your continued 
              use of our services after such changes constitutes acceptance of 
              the new Terms.
            </p>
          </section>

          {/* Governing Law */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms shall be governed by and construed in accordance with 
              the laws of [Your Jurisdiction], without regard to its conflict 
              of law provisions. Any disputes arising under these Terms shall 
              be subject to the exclusive jurisdiction of the courts in [Your Jurisdiction].
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-gray-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="text-gray-600">
              <p className="mb-2">Email: legal@dreamlms.com</p>
              <p className="mb-2">Phone: +1 (555) 123-4567</p>
              <p>Address: 123 Education Street, Learning City, LC 12345</p>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsPage;