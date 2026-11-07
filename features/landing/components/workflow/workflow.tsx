"use client";

import { motion } from "motion/react";

const steps = [
  {
    number: "01",
    title: "Connect",
    description:
      "Bring your existing database into Queryline. Configure your connection and test it.",
  },
  {
    number: "02",
    title: "Ask",
    description:
      "Describe what you want to know in plain English. No need to remember SQL syntax.",
  },
  {
    number: "03",
    title: "Explore",
    description:
      "Review generated queries, execute them, and explore the results in your workspace.",
  },
];

export default function Workflow() {
  return (
    <section
      id="workflow"
      className="border-y border-black/[0.06] bg-[#f3f1ec] px-6 py-28 md:px-12 md:py-36"
    >
      <div className="mx-auto max-w-[1100px]">
        <div className="mx-auto mb-20 max-w-[620px] text-center">
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[2px] text-[#f36b3f]">
            A simpler workflow
          </p>

          <h2 className="text-4xl font-semibold tracking-[-2px] md:text-6xl">
            From question
            <br />
            to <span className="font-serif font-normal italic">insight.</span>
          </h2>

          <p className="mt-5 text-sm leading-7 text-neutral-500">
            Three simple steps between you and the answers hidden in your data.
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-3 md:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              className="relative"
            >
              <div className="mb-8 flex items-center gap-4">
                <span className="flex size-10 items-center justify-center rounded-full border border-[#f36b3f]/30 text-xs font-semibold text-[#f36b3f]">
                  {step.number}
                </span>

                {index !== 2 && (
                  <div className="hidden h-px flex-1 bg-black/10 md:block" />
                )}
              </div>

              <h3 className="text-2xl font-semibold tracking-tight">
                {step.title}
              </h3>

              <p className="mt-3 max-w-[300px] text-sm leading-7 text-neutral-500">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
