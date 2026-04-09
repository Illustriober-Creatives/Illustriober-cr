/**
 * Enquiry Page
 * Contact form for project inquiries
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { SectionHeader } from "@/components/SectionHeader";
import { SectionWrapper } from "@/components/SectionWrapper";
import { Mail, Phone, MapPin, Send } from "lucide-react";

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
    <main className="flex flex-col w-full bg-surface-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-black via-zinc-900 to-black py-20 lg:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 bg-orange-600/5 rounded-full blur-3xl" />
        </div>

        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <p className="inline-block mb-6 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-sm font-medium uppercase tracking-wider">
              Let's Talk
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6 text-white">
              Ready to start a <span className="text-orange-500">project?</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-300 leading-relaxed">
              Tell us about your vision and we'll help you bring it to life.
              We're excited to learn about your project.
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
              <h2 className="text-3xl font-bold text-white mb-8">Get in Touch</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none transition-colors"
                    placeholder="Your company"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Project Type *
                    </label>
                    <select
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-white focus:border-orange-500 focus:outline-none transition-colors"
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
                    <label className="block text-sm font-medium text-white mb-2">
                      Budget Range
                    </label>
                    <select
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-white focus:border-orange-500 focus:outline-none transition-colors"
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
                  <label className="block text-sm font-medium text-white mb-2">
                    Timeline
                  </label>
                  <select
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-white focus:border-orange-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select timeline</option>
                    <option value="asap">ASAP</option>
                    <option value="1-month">Within 1 month</option>
                    <option value="2-3-months">2-3 months</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Project Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none transition-colors resize-none"
                    placeholder="Tell us about your project, goals, and any specific requirements..."
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  variant="primary"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Sending..." : "Send Inquiry"}
                  <Send className="w-5 h-5" />
                </Button>

                {submitted && (
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400">
                    Thank you! We'll get back to you within 24 hours.
                  </div>
                )}
              </form>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-8">Contact Info</h2>

              <div className="space-y-8">
                <div className="flex gap-4">
                  <Mail className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-white mb-1">Email</h3>
                    <p className="text-zinc-400">
                      <a
                        href="mailto:hello@illustriober.com"
                        className="hover:text-orange-500 transition-colors"
                      >
                        hello@illustriober.com
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Phone className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-white mb-1">Phone</h3>
                    <p className="text-zinc-400">
                      <a
                        href="tel:+1234567890"
                        className="hover:text-orange-500 transition-colors"
                      >
                        +1 (234) 567-890
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <MapPin className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-white mb-1">Address</h3>
                    <p className="text-zinc-400">
                      123 Creative Street
                      <br />
                      Tech City, TC 12345
                      <br />
                      United States
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800">
                  <h3 className="font-bold text-white mb-3">Response Time</h3>
                  <p className="text-zinc-400">
                    We typically respond to all inquiries within 24 hours during
                    business days. For urgent matters, feel free to call us.
                  </p>
                </div>

                <div className="p-6 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <h3 className="font-bold text-white mb-3">Quick Response</h3>
                  <p className="text-zinc-400">
                    Already have a budget and timeline? Fill out our form and
                    we'll send you a proposal within 48 hours.
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
