"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Mail, Send, CheckCircle, Linkedin } from "lucide-react";

export default function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [submitError, setSubmitError] = useState("");
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    message: false,
  });

  const trimmedName = formData.name.trim();
  const trimmedEmail = formData.email.trim();
  const trimmedMessage = formData.message.trim();
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
  const isFormValid =
    trimmedName.length > 0 && isEmailValid && trimmedMessage.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid || submitStatus === "sending") return;

    try {
      setSubmitError("");
      setSubmitStatus("sending");

      const endpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;
      if (!endpoint) {
        throw new Error(
          "Contact form is not configured yet. Please add NEXT_PUBLIC_FORMSPREE_ENDPOINT."
        );
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          message: trimmedMessage,
        }),
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as {
          errors?: { message?: string }[];
        } | null;
        const formspreeMessage =
          errorPayload?.errors?.[0]?.message ??
          "Unable to send message right now. Please try again.";
        throw new Error(formspreeMessage);
      }

      setSubmitStatus("success");
      setFormData({ name: "", email: "", message: "" });
      setTouched({ name: false, email: false, message: false });
      setTimeout(() => setSubmitStatus("idle"), 3000);
    } catch (error) {
      setSubmitStatus("error");
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unexpected error. Please try again."
      );
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (submitStatus === "error") {
      setSubmitError("");
      setSubmitStatus("idle");
    }
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBlur = (field: "name" | "email" | "message") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <section
      id="contact"
      className="scroll-mt-8 md:scroll-mt-10 min-h-screen pt-12 md:pt-14 pb-8 md:pb-10 relative bg-[var(--bg-primary)]"
      ref={ref}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            <span className="gradient-text">Get In Touch</span>
          </h2>
          <div className="w-24 h-1 accent-gradient mx-auto mb-6" />
          <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
            Want to work together, have a question or just want to say hi?
            Feel free to reach out!
          </p>

          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-2xl font-semibold mb-6 text-gray-200">
                  Namasté!
                </h3>
                <p className="text-gray-400 leading-relaxed mb-8">
                  I&apos;m always up for a chat, work or otherwise. Drop a
                  message or reach out on my socials!
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <a
                    href="https://www.linkedin.com/in/aditya-paruchuri/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 glass rounded-lg hover:scale-110 transition-all duration-300 cursor-pointer"
                  >
                    <Linkedin className="w-6 h-6 accent-text" />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/aditya-paruchuri/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover-accent-text transition-colors duration-300"
                  >
                    https://www.linkedin.com/in/aditya-paruchuri/
                  </a>
                </div>

                <div className="flex items-center gap-4">
                  <a
                    href="mailto:saiaditya.paruchuri@gmail.com"
                    className="p-3 glass rounded-lg hover:scale-110 transition-all duration-300 cursor-pointer"
                  >
                    <Mail className="w-6 h-6 accent-text-secondary" />
                  </a>
                  <a
                    href="mailto:saiaditya.paruchuri@gmail.com"
                    className="text-gray-400 hover-accent-secondary-text transition-colors duration-300"
                  >
                    saiaditya.paruchuri@gmail.com
                  </a>
                </div>
              </div>

              <div className="hidden md:block">
                <div className="glass p-8 rounded-xl">
                  <p className="text-gray-300 italic">
                    &quot;The world will ask you who you are, and if you
                    don&apos;t know, the world will tell you.&quot;
                  </p>
                  <p className="text-gray-500 text-sm mt-2">- Carl Jung</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <p className="text-xs text-gray-500">* Required fields</p>
                <div>
                  <label
                    htmlFor="name"
                    className="block text-gray-300 mb-2 font-medium"
                  >
                    Name <span className="text-white/90 text-[0.85em]">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={() => handleBlur("name")}
                    required
                    className="w-full px-4 py-3 glass rounded-lg focus:outline-none accent-focus bg-white/5 text-gray-200 placeholder-gray-500 transition-all duration-300"
                    placeholder="Your Name"
                  />
                  {touched.name && trimmedName.length === 0 && (
                    <p className="mt-2 text-xs text-red-400">Name is required.</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-gray-300 mb-2 font-medium"
                  >
                    Email <span className="text-white/90 text-[0.85em]">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur("email")}
                    required
                    className="w-full px-4 py-3 glass rounded-lg focus:outline-none accent-focus bg-white/5 text-gray-200 placeholder-gray-500 transition-all duration-300"
                    placeholder="Your Email"
                  />
                  {touched.email && trimmedEmail.length === 0 && (
                    <p className="mt-2 text-xs text-red-400">Email is required.</p>
                  )}
                  {trimmedEmail.length > 0 && !isEmailValid && (
                    <p className="mt-2 text-xs text-amber-300">
                      Please enter a valid email address (e.g. name@example.com).
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-gray-300 mb-2 font-medium"
                  >
                    Message <span className="text-white/90 text-[0.85em]">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={() => handleBlur("message")}
                    required
                    rows={6}
                    className="w-full px-4 py-3 glass rounded-lg focus:outline-none accent-focus bg-white/5 text-gray-200 placeholder-gray-500 transition-all duration-300 resize-none"
                    placeholder="Your Message"
                  />
                  {touched.message && trimmedMessage.length === 0 && (
                    <p className="mt-2 text-xs text-red-400">Message is required.</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!isFormValid || submitStatus === "sending"}
                  className="w-full btn-primary flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitStatus === "success" ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Message Sent!
                    </>
                  ) : submitStatus === "sending" ? (
                    <>
                      <Send className="w-5 h-5" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
                {submitStatus === "error" && (
                  <p className="text-sm text-red-400">{submitError}</p>
                )}
              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="text-center mt-20 pt-8 border-t border-white/10"
      >
        <p className="text-gray-400">
          Designed & Built by{" "}
          <span className="gradient-text font-semibold">Aditya Paruchuri</span>
        </p>
        <p className="text-gray-500 text-sm mt-2">
          &copy; {new Date().getFullYear()} All rights reserved.
        </p>
      </motion.div>
    </section>
  );
}
