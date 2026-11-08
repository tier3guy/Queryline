"use client";

import { motion } from "motion/react";

const privacyPoints = [
  {
    number: "01",
    title: "Your credentials stay local",
    description:
      "Database credentials are saved in your browser's local storage. They are not stored in Queryline's backend or database.",
  },
  {
    number: "02",
    title: "Connect only when you need to",
    description:
      "Your connection details are sent to the Queryline server only when you initiate a database operation.",
  },
  {
    number: "03",
    title: "Your data stays yours",
    description:
      "Queryline doesn't maintain a copy of your database. Queries run against your connected database, and results are returned to your workspace.",
  },
];

export default function Privacy() {
  return (
    <section
      id="privacy"
      className="border-b border-neutral-200 bg-[#fafafa]"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 lg:px-12">
        <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-5 flex items-center gap-2">
              <span className="size-1.5 bg-[#f36b3f]" />
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-500">
                Privacy by design
              </span>
            </div>

            <h2 className="max-w-lg text-3xl font-semibold leading-tight tracking-tight text-neutral-950 sm:text-4xl">
              Your databases.
              <br />
              Your <span className="text-[#f36b3f]">credentials</span>.
              <br />
              <span className="text-neutral-400">Your control.</span>
            </h2>

            <p className="mt-6 max-w-md text-sm leading-7 text-neutral-500">
              Your database access should remain yours. Queryline is designed
              to keep your connection credentials in your browser instead of
              storing them in a central backend.
            </p>

            <div className="mt-10 flex items-center gap-3 border border-neutral-200 bg-white p-4">
              <div className="flex size-9 shrink-0 items-center justify-center border border-[#f36b3f]/30 bg-[#f36b3f]/5">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="size-4 text-[#f36b3f]"
                >
                  <rect x="4" y="10" width="16" height="11" rx="1" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  <path d="M12 14v3" />
                </svg>
              </div>

              <div>
                <p className="text-sm font-medium text-neutral-900">
                  Local-first credential storage
                </p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  No server-side credential database.
                </p>
              </div>
            </div>
          </motion.div>

          <div className="divide-y divide-neutral-200 border-neutral-200">
            {privacyPoints.map((point, index) => (
              <motion.div
                key={point.number}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="grid grid-cols-[44px_1fr] gap-4 py-7"
              >
                <span className="pt-1 font-mono text-xs text-[#f36b3f]">
                  {point.number}
                </span>

                <div>
                  <h3 className="text-base font-semibold tracking-tight text-neutral-950">
                    {point.title}
                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500">
                    {point.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
