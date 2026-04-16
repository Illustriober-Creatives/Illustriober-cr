/**
 * Enquiry Page
 * Contact form for project inquiries with theme support
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { SectionWrapper } from "@/components/SectionWrapper";
import { FormInput } from "@/components/FormInput";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";

export default function EnquiryPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    projectType: "",
    budget: "",
    timeline: "",
    description: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          name: "",
          email: "",
          company: "",
          projectType: "",
          budget: "",
          timeline: "",
          description: "",
        });
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col w-full bg-background">
      {/* Hero Section - Theme aware */}
      <section className="relative overflow-hidden bg-background py-20 lg:py-32">
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient orbs - theme responsive */}
            <div className="absolute -top-40 -right-40 h-80 w-80 bg-accent/5 rounded-full blur-3xl dark:opacity-100 light:opacity-50" />
            <div className="absolute -bottom-40 -left-40 h-80 w-80 bg-accent/3 rounded-full blur-3xl dark:opacity-75 light:opacity-40" />
          </div>

          <Container className="relative z-10">
            <div className="max-w-3xl mx-auto text-center">
            <p className="inline-block mb-6 px-4 py-2 rounded-full bg-accent-soft border border-accent/20 text-accent text-sm font-medium uppercase tracking-wider">
              Let&apos;s Connect
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-semibold leading-tight tracking-tight mb-6 text-foreground">
              Ready to start a <span className="text-accent italic">project?</span>
            </h1>
            <p className="text-lg md:text-xl text-foreground/60 leading-relaxed">
              Tell us about your vision and we&apos;ll help you bring it to life.
              We&apos;re excited to learn about your project.
            </p>
          </div>
        </Container>
      </section>

      {/* Contact Form Section */}
      <SectionWrapper>
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Form */}
            <div>
              <h2 className="text-3xl font-display font-semibold text-foreground mb-8">
                Get in Touch
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormInput
                    type="text"
                    label="Name"
                    placeholder="Your name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                  <FormInput
                    type="email"
                    label="Email"
                    placeholder="your@email.com"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <FormInput
                  type="text"
                  label="Company"
                  placeholder="Your company (optional)"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  disabled={loading}
                />

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">
                      Project Type
                    </label>
                    <select
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="form-input appearance-none cursor-pointer"
                    >
                      <option value="">Select a project type</option>
                      <option value="web">Web Application</option>
                      <option value="mobile">Mobile App</option>
                      <option value="design">Design System</option>
                      <option value="consulting">Consulting</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">
                      Budget Range
                    </label>
                    <select
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      disabled={loading}
                      className="form-input appearance-none cursor-pointer"
                    >
                      <option value="">Select budget range</option>
                      <option value="under-10k">Under $10k</option>
                      <option value="10-50k">$10k - $50k</option>
                      <option value="50-100k">$50k - $100k</option>
                      <option value="100k-plus">$100k+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">
                    Timeline
                  </label>
                  <select
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleChange}
                    disabled={loading}
                    className="form-input appearance-none cursor-pointer"
                  >
                    <option value="">Select timeline</option>
                    <option value="asap">ASAP</option>
                    <option value="1-month">Within 1 month</option>
                    <option value="2-3-months">2-3 months</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">
                    Project Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={5}
                    disabled={loading}
                    placeholder="Tell us about your project, goals, and any specific requirements..."
                    className="form-input resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  variant="primary"
                  disabled={loading}
                  className="w-full rounded-lg"
                >
                  {loading ? "Sending..." : "Send Inquiry"}
                  <Send className="w-5 h-5" />
                </Button>

                {submitted && (
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 dark:border-green-500/30 light:border-green-300/50 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-green-600 dark:text-green-400 light:text-green-700 text-sm">
                      Thank you! We&apos;ll get back to you within 24 hours.
                    </p>
                  </div>
                )}
              </form>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-display font-semibold text-foreground mb-8">
                Contact Information
              </h2>

              <div className="space-y-8">
                {/* Email */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1 p-2 rounded-lg bg-accent-soft">
                    <Mail className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Email</h3>
                    <p className="text-foreground/60">
                      <a
                        href="mailto:hello@illustriober.com"
                        className="hover:text-accent transition-colors"
                      >
                        hello@illustriober.com
                      </a>
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1 p-2 rounded-lg bg-accent-soft">
                    <Phone className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                    <p className="text-foreground/60">
                      <a
                        href="tel:+1234567890"
                        className="hover:text-accent transition-colors"
                      >
                        +1 (234) 567-890
                      </a>
                    </p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1 p-2 rounded-lg bg-accent-soft">
                    <MapPin className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Address</h3>
                    <p className="text-foreground/60">
                      123 Creative Street
                      <br />
                      Tech City, TC 12345
                      <br />
                      United States
                    </p>
                  </div>
                </div>

                {/* Response Time */}
                <div className="p-6 rounded-lg glass-card border-glass-border hover:border-accent/40 transition-all">
                  <h3 className="font-semibold text-foreground mb-3">
                    Response Time
                  </h3>
                  <p className="text-foreground/60">
                    We typically respond to all inquiries within 24 hours during
                    business days. For urgent matters, feel free to call us.
                  </p>
                </div>

                {/* Quick Response CTA */}
                <div className="p-6 rounded-lg border-2 border-accent/20 bg-accent-soft">
                  <h3 className="font-semibold text-foreground mb-3">
                    💡 Quick Proposals
                  </h3>
                  <p className="text-foreground/70">
                    Already have a budget and timeline in mind? Fill out our form
                    and we&apos;ll send you a proposal within 48 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </SectionWrapper>
    </main>
  );
}
