import Link from "next/link";

const navigation = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#workflow" },
  { label: "Github", href: "https://github.com/tier3guy/Queryline" },
];

export default function Header() {
  return (
    <header className="relative z-50 border-b border-black/[0.06]">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-6 md:px-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[#f36b3f] text-lg font-bold text-white">
            q
          </div>

          <span className="text-[19px] font-semibold tracking-[-0.8px]">
            queryline
          </span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
          {navigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[13px] font-medium text-neutral-500 transition-colors hover:text-neutral-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          {/* <Link
            href="/sign-in"
            className="hidden text-[13px] font-medium text-neutral-600 transition-colors hover:text-black sm:block"
          >
            Log in
          </Link> */}

          <Link
            href="/workspace"
            className="group flex h-10 items-center gap-3 rounded-full bg-[#171717] px-5 text-[13px] font-medium text-white transition-all hover:bg-[#f36b3f]"
          >
            Get started
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};
