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
    <section id="features" className="px-6 py-28 md:px-12 md:py-36">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-14 max-w-[600px]">
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[2px] text-[#f36b3f]">
            What makes Queryline different
          </p>

          <h2 className="text-4xl font-semibold leading-tight tracking-[-2px] md:text-6xl">
            Less querying.
            <br />
            <span className="font-serif font-normal italic text-neutral-400">
              More discovering.
            </span>
          </h2>

          <p className="mt-5 max-w-[470px] text-sm leading-7 text-neutral-500">
            Everything you need to understand and work with your databases,
            without getting lost in the complexity.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.article
              key={feature.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className={`group min-h-[250px] rounded-xl border border-black/[0.08] bg-white p-7 transition-colors hover:border-[#f36b3f]/40 ${feature.className}`}
            >
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-medium tracking-wider text-neutral-400">
                  {feature.number}
                </span>

                <span className="flex size-11 items-center justify-center rounded-lg bg-[#faf3ef] font-mono text-sm text-[#f36b3f] transition-colors group-hover:bg-[#f36b3f] group-hover:text-white">
                  {feature.symbol}
                </span>
              </div>

              <div className="mt-12">
                <h3 className="text-xl font-semibold tracking-tight">
                  {feature.title}
                </h3>

                <p className="mt-3 max-w-[390px] text-sm leading-6 text-neutral-500">
                  {feature.description}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
