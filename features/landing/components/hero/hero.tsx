"use client";

import Link from "next/link";
import { motion } from "motion/react";

export default function Hero() {
  return (
    <section className="relative px-6 pb-24 pt-24 md:px-12 md:pb-32 md:pt-32">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-0 h-[600px] w-[900px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(243,107,63,0.08),transparent_65%)]" />

      <div className="relative mx-auto max-w-[1100px] text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#f36b3f]/20 bg-[#f36b3f]/[0.06] px-4 py-2"
        >
          <span className="size-1.5 rounded-full bg-[#f36b3f]" />
          <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#c95631]">
            Meet your new database workspace
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="mx-auto max-w-[900px] text-[48px] font-semibold leading-[1.06] tracking-[-3px] sm:text-[64px] md:text-[82px] md:tracking-[-5px]"
        >
          Your data has
          <br />
          <span className="font-serif font-normal italic text-[#f36b3f]">
            answers.
          </span>{" "}
          Just ask.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-7 max-w-[570px] text-[15px] leading-7 text-neutral-500 md:text-[17px]"
        >
          Connect your databases, ask questions in plain English, and get
          meaningful insights without writing every query yourself.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href="/workspace"
            className="group flex h-12 items-center justify-center gap-4 rounded-full bg-[#f36b3f] px-7 text-sm font-semibold text-white transition-all hover:bg-[#df592f] hover:shadow-[0_8px_30px_rgba(243,107,63,0.25)]"
          >
            Start building
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>

          <Link
            href="#workflow"
            className="flex h-12 items-center justify-center rounded-full border border-black/10 px-7 text-sm font-medium transition-colors hover:border-black/30"
          >
            See how it works
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mx-auto mt-20 max-w-[1000px]"
        >
          <div className="overflow-hidden rounded-xl border border-black/10 bg-white text-left shadow-[0_30px_100px_rgba(0,0,0,0.09)]">
            <div className="flex h-12 items-center justify-between border-b border-black/[0.06] px-5">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#f36b3f]" />
                <span className="text-xs font-semibold">Queryline</span>
                <span className="text-xs text-neutral-400">/ Workspace</span>
              </div>

              <span className="hidden text-[10px] font-medium uppercase tracking-wider text-neutral-400 sm:block">
                Interactive preview
              </span>
            </div>

            <div className="grid min-h-[360px] md:grid-cols-[210px_1fr]">
              <aside className="hidden border-r border-black/[0.06] p-4 md:block">
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                  Connections
                </p>

                <div className="flex items-center gap-2 rounded-md bg-neutral-100 px-3 py-2">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium">Production DB</span>
                </div>

                <p className="mb-3 mt-8 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                  Recent chats
                </p>

                {["Revenue overview", "User activity", "Orders analysis"].map(
                  (item) => (
                    <div
                      key={item}
                      className="mb-1 rounded-md px-3 py-2 text-xs text-neutral-500"
                    >
                      {item}
                    </div>
                  ),
                )}
              </aside>

              <div className="flex flex-col p-5 sm:p-8">
                <div className="mb-8 flex-1">
                  <div className="mb-6 flex justify-end">
                    <div className="max-w-[85%] rounded-xl rounded-br-sm bg-neutral-100 px-4 py-3 text-xs leading-6 text-neutral-700 sm:max-w-[70%] sm:text-sm">
                      Show me the top 5 customers by total revenue this year.
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#f36b3f] text-xs font-bold text-white">
                      q
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="mb-3 text-xs font-semibold text-neutral-800">
                        Here&apos;s your revenue breakdown.
                      </p>

                      <div className="overflow-hidden rounded-lg border border-black/[0.08]">
                        <div className="flex items-center justify-between border-b border-black/[0.06] bg-neutral-50 px-3 py-2">
                          <span className="text-[10px] font-semibold text-neutral-600">
                            SQL QUERY
                          </span>
                          <span className="text-[10px] text-emerald-600">
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

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700">
                          5 rows returned
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          124 ms
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-lg border border-black/10 px-4 py-3">
                  <span className="truncate text-xs text-neutral-400">
                    Ask anything about your database...
                  </span>
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[#f36b3f] text-sm text-white">
                    ↑
                  </span>
                </div>

                <p className="mt-3 text-center text-[9px] text-neutral-400">
                  Preview illustration · Not connected to a live database
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[10px] font-medium uppercase tracking-[1.5px] text-neutral-400">
          <span>PostgreSQL</span>
          <span>MySQL</span>
          <span>MariaDB</span>
          <span>MongoDB</span>
          <span>SQLite</span>
          <span>SQL Server</span>
        </div>
      </div>
    </section>
  );
};
