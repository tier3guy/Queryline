"use client";

import Link from "next/link";
import { motion } from "motion/react";

const databases = [
  "PostgreSQL",
  "MySQL",
  "MariaDB",
  "MongoDB",
  "SQLite",
  "SQL Server",
];

const recentChats = [
  "Revenue overview",
  "User activity",
  "Orders analysis",
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-neutral-200 bg-[#fafafa]">
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute inset-0 bg-[#fafafa]/70" />
      </div>

      <div className="relative mx-auto max-w-[1440px] border-x border-neutral-200">
        <div className="px-6 pb-20 pt-24 md:px-12 md:pb-28 md:pt-32">
          <div className="mx-auto max-w-[1100px]">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 flex items-center gap-3"
            >
              <span className="size-2 bg-[#f36b3f]" />
              <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-neutral-500">
                Meet your new database workspace
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1 }}
              className="max-w-[900px] text-[48px] font-semibold leading-[1.04] tracking-[-2.5px] text-neutral-950 sm:text-[64px] md:text-[82px] md:tracking-[-4.5px]"
            >
              Your data has answers.
              <br />
              <span className="text-[#f36b3f]">Just ask.</span>
            </motion.h1>

            <div className="mt-8 flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-[510px] text-[15px] leading-7 text-neutral-500 md:text-[16px]"
              >
                Connect your databases, ask questions in plain English, and
                explore meaningful insights without writing every query
                yourself.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap items-center gap-3"
              >
                <Link
                  href="/workspace"
                  className="group flex h-12 items-center gap-5 border border-neutral-950 bg-neutral-950 px-6 text-sm font-medium text-white transition-colors hover:border-[#f36b3f] hover:bg-[#f36b3f]"
                >
                  Start building
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                <Link
                  href="#workflow"
                  className="flex h-12 items-center border border-neutral-300 bg-transparent px-6 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-950 hover:bg-white"
                >
                  See how it works
                </Link>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-20"
            >
              <div className="overflow-hidden border border-neutral-300 bg-white text-left">
                <div className="flex h-12 items-center justify-between border-b border-neutral-200 px-4 sm:px-5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-6 items-center justify-center bg-neutral-950 text-xs font-bold text-white">
                      q
                    </div>
                    <span className="text-xs font-semibold text-neutral-900">
                      Queryline
                    </span>
                    <span className="text-xs text-neutral-400">
                      / Workspace
                    </span>
                  </div>

                  <span className="hidden text-[10px] font-medium uppercase tracking-[1.2px] text-neutral-400 sm:block">
                    Product preview
                  </span>
                </div>

                <div className="grid min-h-[360px] md:grid-cols-[220px_1fr]">
                  <aside className="hidden border-r border-neutral-200 bg-[#fafafa] p-4 md:block">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-[10px] font-semibold uppercase tracking-[1.2px] text-neutral-400">
                        Connections
                      </p>
                      <span className="text-[10px] text-neutral-400">01</span>
                    </div>

                    <div className="flex items-center gap-2 border border-neutral-200 bg-white px-3 py-2.5">
                      <span className="size-1.5 bg-emerald-500" />
                      <span className="text-xs font-medium text-neutral-800">
                        Production DB
                      </span>
                    </div>

                    <div className="mb-3 mt-8 flex items-center justify-between">
                      <p className="text-[10px] font-semibold uppercase tracking-[1.2px] text-neutral-400">
                        Recent chats
                      </p>
                      <span className="text-[10px] text-neutral-400">03</span>
                    </div>

                    {recentChats.map((item, index) => (
                      <div
                        key={item}
                        className={`border-l-2 px-3 py-2 text-xs ${
                          index === 0
                            ? "border-[#f36b3f] bg-neutral-100 font-medium text-neutral-900"
                            : "border-transparent text-neutral-500"
                        }`}
                      >
                        {item}
                      </div>
                    ))}
                  </aside>

                  <div className="flex min-w-0 flex-col p-5 sm:p-8">
                    <div className="mb-8 flex-1">
                      <div className="mb-8 flex justify-end">
                        <div className="max-w-[85%] border border-neutral-200 bg-neutral-50 px-4 py-3 text-xs leading-6 text-neutral-700 sm:max-w-[70%] sm:text-sm">
                          Show me the top 5 customers by total revenue this
                          year.
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex size-7 shrink-0 items-center justify-center bg-neutral-950 text-xs font-bold text-white">
                          q
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="mb-4 text-xs font-semibold text-neutral-900">
                            Here&apos;s your revenue breakdown.
                          </p>

                          <div className="overflow-hidden border border-neutral-200">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 bg-neutral-50 px-3 py-2">
                              <span className="text-[10px] font-semibold tracking-[1px] text-neutral-600">
                                SQL QUERY
                              </span>
                              <span className="flex items-center gap-1.5 text-[10px] text-emerald-700">
                                <span className="size-1.5 bg-emerald-500" />
                                Executed successfully
                              </span>
                            </div>

                            <pre className="overflow-x-auto p-3 text-[10px] leading-5 text-neutral-600 sm:text-xs">
                              <code>{`SELECT customer_name,
       SUM(total_amount) AS revenue
FROM orders
WHERE order_date >= '2026-01-01'
GROUP BY customer_name
ORDER BY revenue DESC
LIMIT 5;`}</code>
                            </pre>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-4">
                            <span className="border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700">
                              5 rows returned
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              124 ms
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 border border-neutral-300 px-4 py-3">
                      <span className="truncate text-xs text-neutral-400">
                        Ask anything about your database...
                      </span>
                      <span className="flex size-7 shrink-0 items-center justify-center bg-neutral-950 text-sm text-white">
                        ↑
                      </span>
                    </div>

                    <p className="mt-3 text-center text-[9px] uppercase tracking-[0.8px] text-neutral-400">
                      Preview illustration · Not connected to a live database
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="mt-12 grid grid-cols-2 border-l border-t border-neutral-200 sm:grid-cols-3 md:grid-cols-6">
              {databases.map((database) => (
                <div
                  key={database}
                  className="flex h-11 items-center justify-center border-b border-r border-neutral-200 text-[10px] font-medium uppercase tracking-[1px] text-neutral-500 sm:text-[11px]"
                >
                  {database}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
