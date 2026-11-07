import Link from "next/link";

export default function CTA() {
  return (
    <section className="px-6 py-28 md:px-12 md:py-36">
      <div className="relative mx-auto max-w-[1100px] overflow-hidden rounded-2xl bg-[#191919] px-7 py-20 text-center text-white md:px-16 md:py-28">
        <div className="pointer-events-none absolute -right-24 -top-40 size-[400px] rounded-full bg-[#f36b3f]/20 blur-[100px]" />

        <div className="relative">
          <p className="mb-6 text-[11px] font-semibold uppercase tracking-[2px] text-[#f58b68]">
            Your next insight starts here
          </p>

          <h2 className="mx-auto max-w-[700px] text-4xl font-semibold leading-tight tracking-[-2px] md:text-6xl">
            Stop wondering.
            <br />
            <span className="font-serif font-normal italic text-[#f58b68]">
              Start asking.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-[430px] text-sm leading-7 text-white/50">
            Bring your databases together and discover a more natural way to
            work with data.
          </p>

          <Link
            href="/workspace"
            className="group mt-9 inline-flex h-12 items-center gap-5 rounded-full bg-[#f36b3f] px-7 text-sm font-semibold text-white transition-all hover:bg-[#ff8058]"
          >
            Get started with Queryline
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};
