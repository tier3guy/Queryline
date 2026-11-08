import Link from "next/link";

export default function CTA() {
  return (
    <section className="border-b border-neutral-200 bg-[#fafafa] px-6 py-24">
      <div className="mx-auto max-w-[1440px] border-neutral-200 px-6 md:px-12">
        <div className="relative overflow-hidden border border-neutral-800 bg-[#171717] text-white">
          <div className="pointer-events-none absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#737373_1px,transparent_1px),linear-gradient(to_bottom,#737373_1px,transparent_1px)] bg-[size:48px_48px]" />
          </div>

          <div className="pointer-events-none absolute right-0 top-0 size-[360px] translate-x-1/3 -translate-y-1/3 bg-[#f36b3f]/10 blur-[100px]" />

          <div className="relative grid md:grid-cols-[1fr_220px]">
            <div className="px-7 py-16 md:px-16 md:py-24">
              <p className="mb-7 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[1.5px] text-[#f58b68]">
                <span className="size-2 bg-[#f36b3f]" />
                Your next insight starts here
              </p>

              <h2 className="max-w-[700px] text-4xl font-semibold leading-[1.08] tracking-[-2px] md:text-6xl md:tracking-[-3px]">
                Stop wondering.
                <br />
                <span className="text-[#f58b68]">Start asking.</span>
              </h2>

              <p className="mt-7 max-w-[430px] text-sm leading-7 text-white/55">
                Bring your databases together and discover a more natural way
                to work with data.
              </p>

              <Link
                href="/workspace"
                className="group mt-9 inline-flex h-12 items-center gap-5 border border-[#f36b3f] bg-[#f36b3f] px-6 text-sm font-semibold text-white transition-colors hover:border-[#ff8058] hover:bg-[#ff8058]"
              >
                Get started with Queryline
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>

            <div className="hidden  md:flex md:flex-col md:justify-between">
              <div className="border-white/10 p-6">
                <span className="text-[10px] font-medium uppercase tracking-[1.5px] text-white/40">
                  Built for your data
                </span>
              </div>

              <div className="space-y-5 p-6">
                <div>
                  <p className="font-mono text-2xl font-medium text-white">
                    06
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[1px] text-white/40">
                    Database types
                  </p>
                </div>

                <div className="h-px bg-white/10" />

                <div>
                  <p className="font-mono text-2xl font-medium text-white">
                    NL
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[1px] text-white/40">
                    Natural language
                  </p>
                </div>
              </div>

              <div className="border-white/10 p-6">
                <span className="font-mono text-[10px] text-white/40">
                  QUERYLINE / 001
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
