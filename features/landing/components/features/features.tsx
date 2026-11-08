"use client";

import { motion } from "motion/react";

const features = [
  {
    number: "01",
    title: "Talk to your data",
    description:
      "Ask questions in natural language. Queryline translates your intent into database queries.",
    symbol: "Aa",
    className: "md:col-span-2",
  },
  {
    number: "02",
    title: "Your schema, understood",
    description:
      "Automatically explore tables, columns, relationships, and database structure.",
    symbol: "⌘",
    className: "",
  },
  {
    number: "03",
    title: "Queries you can inspect",
    description:
      "See generated SQL, understand what will run, and inspect the results.",
    symbol: "</>",
    className: "",
  },
  {
    number: "04",
    title: "One place for your databases",
    description:
      "Keep your database connections and conversations organized in one workspace.",
    symbol: "◫",
    className: "md:col-span-2",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="border-b border-neutral-200 bg-[#fafafa] px-6 py-24 md:px-12 md:py-32"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-12 border-neutral-200 px-6 md:grid-cols-[1fr_1fr] md:gap-16 md:px-12">
          <div className="max-w-[600px]">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="mb-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[1.5px] text-neutral-500"
            >
              <span className="size-2 bg-[#f36b3f]" />
              What makes Queryline different
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-4xl font-semibold leading-[1.08] tracking-[-2px] text-neutral-950 md:text-6xl md:tracking-[-3px]"
            >
              Less querying.
              <br />
              <span className="text-neutral-400">More discovering.</span>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-end"
          >
            <p className="max-w-[470px] border-l border-neutral-300 pl-5 text-sm leading-7 text-neutral-500">
              Everything you need to understand and work with your databases,
              without getting lost in the complexity.
            </p>
          </motion.div>
        </div>

        <div className="mt-16 grid border-l border-t border-neutral-200 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.article
              key={feature.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className={`group relative flex min-h-[260px] flex-col justify-between border-b border-r border-neutral-200 bg-white p-6 transition-colors duration-200 hover:bg-neutral-50 md:p-8 ${feature.className}`}
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-[11px] text-neutral-400">
                  / {feature.number}
                </span>

                <span className="flex size-10 items-center justify-center border border-neutral-200 font-mono text-sm text-neutral-500 transition-colors duration-200 group-hover:border-[#f36b3f] group-hover:bg-[#f36b3f] group-hover:text-white">
                  {feature.symbol}
                </span>
              </div>

              <div className="mt-16">
                <h3 className="text-xl font-semibold tracking-[-0.5px] text-neutral-950">
                  {feature.title}
                </h3>

                <p className="mt-3 max-w-[390px] text-sm leading-6 text-neutral-500">
                  {feature.description}
                </p>
              </div>

              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#f36b3f] transition-all duration-300 group-hover:w-full" />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
