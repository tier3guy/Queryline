"use client";

import { motion } from "motion/react";

const steps = [
  {
    number: "01",
    title: "Connect",
    description:
      "Bring your existing database into Queryline. Configure your connection and test it.",
    detail: "DATABASE CONNECTION",
  },
  {
    number: "02",
    title: "Ask",
    description:
      "Describe what you want to know in plain English. No need to remember SQL syntax.",
    detail: "NATURAL LANGUAGE",
  },
  {
    number: "03",
    title: "Explore",
    description:
      "Review generated queries, execute them, and explore the results in your workspace.",
    detail: "QUERY & RESULTS",
  },
];

export default function Workflow() {
  return (
    <section
      id="workflow"
      className="border-b border-neutral-200 bg-white px-6 py-24 md:px-12 md:py-32"
    >
      <div className="mx-auto max-w-[1440px] border-neutral-200">
        <div className="grid gap-10 border-b border-neutral-200 px-6 pb-12 md:grid-cols-[1fr_1fr] md:items-end md:gap-16 md:px-12 md:pb-16">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="mb-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[1.5px] text-neutral-500"
            >
              <span className="size-2 bg-[#f36b3f]" />
              A simpler workflow
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-4xl font-semibold leading-[1.08] tracking-[-2px] text-neutral-950 md:text-6xl md:tracking-[-3px]"
            >
              From question
              <br />
              to <span className="text-neutral-400">insight.</span>
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-[440px] border-l border-neutral-300 pl-5 text-sm leading-7 text-neutral-500"
          >
            Three simple steps between you and the answers hidden in your data.
          </motion.p>
        </div>

        <div className="grid border-l border-neutral-200 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.article
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              className="group relative flex min-h-[280px] flex-col border-b border-r border-neutral-200 p-6 md:min-h-[320px] md:p-8"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center border border-neutral-200 font-mono text-xs font-medium text-neutral-600 transition-colors group-hover:border-[#f36b3f] group-hover:bg-[#f36b3f] group-hover:text-white">
                  {step.number}
                </span>

                <span className="font-mono text-[10px] tracking-[1px] text-neutral-400">
                  STEP {step.number}
                </span>
              </div>

              <div className="mt-auto pt-16">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[1.2px] text-[#f36b3f]">
                  {step.detail}
                </p>

                <h3 className="text-2xl font-semibold tracking-[-0.7px] text-neutral-950">
                  {step.title}
                </h3>

                <p className="mt-3 max-w-[300px] text-sm leading-7 text-neutral-500">
                  {step.description}
                </p>
              </div>

              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#f36b3f] transition-all duration-300 group-hover:w-full" />
            </motion.article>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-neutral-200 px-6 py-4 md:px-12">
          <span className="text-[10px] font-medium uppercase tracking-[1.2px] text-neutral-400">
            Queryline workflow
          </span>
          <span className="font-mono text-[10px] text-neutral-400">
            01 — 03
          </span>
        </div>
      </div>
    </section>
  );
};
