"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Brain,
  Video,
  Users,
  User,
  LayoutDashboard,
  CreditCard,
} from "lucide-react";
import Image from "next/image";

const features = [
  {
    title: "Pre-Recorded Courses",
    description:
      "Upload video lectures and supporting materials (PDF, DOC, PPT). Preview via Youtube or host directly.",
    icon: Video,
    bg: "#EAFDFF",
    glow: "from-blue-400/40 to-blue-400",
  },
  {
    title: "AI-Powered Learning",
    description:
      "Let AI generate lecture summaries and multiple choice quizzes so students can self test instantly.",
    icon: Brain,
    bg: "#FFF2F8",
    glow: "from-pink-400/40 to-pink-400",
  },
  {
    title: "Live Classes & Webinars",

    description:
      "Schedule and host interactive live classes via zoom. Engage with students in real time.",
    icon: Users,
    bg: "#FFF0EE",
    glow: "from-red-400/40 to-orange-400",
  },
  {
    title: "1-on-1 Coaching",
    bg: "#3427771A",
    description:
      "Coaches can set hourly rates and let students book private sessions.",
    icon: User,
    glow: "from-purple-400/40 to-indigo-400",
  },
  {
    title: "Smart Dashboards",
    bg: "#FF46671A",
    description:
      "Tailored dashboards for students, instructors, and institutes with progress tracking and revenue insights.",
    icon: LayoutDashboard,
    glow: "from-rose-400/40 to-fuchsia-400",
  },
  {
    title: "Instant Payouts",
    bg: "#FFF7DA",
    description:
      "Stripe-powered automatic payouts. 80% of earning go directly to instructors and institutes, 20% is platform commission.",
    icon: CreditCard,
    glow: "from-yellow-400/40 to-yellow-600",
  },
];

export default function Core() {
  return (
    <section className="py-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-10 text-center">
        <h2 className="text-3xl font-bold">Core Features</h2>
        <p className="text-muted-foreground mt-2">
          Everything you need for smarter learning in one place
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <Card
              key={i}
              className="relative overflow-hidden rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition"
            >
              <div
                className={cn(
                  "absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-60",
                  "bg-gradient-to-br",
                  feature.glow
                )}
              />
              <CardContent className="relative  text-left">
                <div
                  className="w-[76px] h-[76px] mb-4 flex items-center justify-center rounded-full p-5"
                  style={{ backgroundColor: feature.bg }}

                >
                  <Image
                    src={`/CoreFeature/${i + 1}.svg`}
                    alt={feature.title}
                    width={48}
                    height={48}
                    className="object-contain w-full h-full"
                  />
                </div>
                <h3 className="text-[20px] font-bold">{feature.title}</h3>
                <p className="text-[16px] font-normal mt-2">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
