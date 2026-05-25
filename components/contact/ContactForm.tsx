"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // No backend mailer is wired yet — acknowledge and reset.
    setSent(true);
    toast.success("Thanks! We'll get back to you soon.");
  }

  if (sent) {
    return (
      <div className="mt-4 rounded-2xl bg-leaf-50 p-6 text-center text-sm text-leaf-800">
        Your message has been noted. Our team will reply by email shortly. 🌿
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input placeholder="Your name" required />
        <Input type="email" placeholder="Email" required />
      </div>
      <Input placeholder="Subject" />
      <Textarea rows={5} placeholder="How can we help?" required />
      <Button type="submit" size="lg" className="w-full">
        <Send className="h-4 w-4" /> Send message
      </Button>
    </form>
  );
}
