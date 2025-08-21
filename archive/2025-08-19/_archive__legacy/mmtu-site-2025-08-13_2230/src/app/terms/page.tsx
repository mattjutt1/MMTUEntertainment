export default function Terms() {
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-muted-foreground text-lg mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using MMTU Entertainment&apos;s services, you accept and agree to be bound
            by the terms and provision of this agreement.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Services</h2>
          <p className="mb-4">
            MMTU Entertainment provides professional development tools and services including:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Custom software development</li>
            <li>GitHub automation tools</li>
            <li>DevOps and infrastructure consulting</li>
            <li>Technical consulting and support</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Client Responsibilities</h2>
          <p className="mb-4">
            Clients are responsible for:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Providing accurate project requirements and specifications</li>
            <li>Timely feedback and communication during project development</li>
            <li>Payment according to agreed terms</li>
            <li>Proper use of delivered software and services</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>
          <p className="mb-4">
            Upon full payment, clients receive ownership of custom-developed software and solutions,
            unless otherwise specified in the project agreement. MMTU Entertainment retains rights
            to general methodologies, techniques, and know-how.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Payment Terms</h2>
          <p className="mb-4">
            Payment terms are specified in individual project agreements. Generally:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Invoices are due within 30 days of issuance</li>
            <li>Late payments may incur additional fees</li>
            <li>Project work may be suspended for overdue payments</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
          <p className="mb-4">
            MMTU Entertainment&apos;s liability is limited to the amount paid for the specific service.
            We are not liable for indirect, incidental, or consequential damages.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Confidentiality</h2>
          <p className="mb-4">
            We maintain strict confidentiality regarding client projects and information.
            All sensitive information is protected and not disclosed to third parties.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
          <p className="mb-4">
            Either party may terminate services with appropriate notice as specified in
            individual project agreements. Outstanding work will be billed accordingly.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Governing Law</h2>
          <p className="mb-4">
            These terms are governed by the laws of the jurisdiction in which MMTU Entertainment
            operates, without regard to conflict of law principles.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
          <p className="mb-4">
            For questions about these Terms of Service, please contact us at:
          </p>
          <p className="mb-4">
            Email: legal@mmtuentertainment.com<br />
            Address: Remote-first company, EST timezone
          </p>
        </section>
      </div>
    </div>
  )
}