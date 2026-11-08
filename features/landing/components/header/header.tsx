import Link from "next/link";
import Logo from "@/components/shared/logo/logo";

const navigation = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#workflow" },
  { label: "GitHub", href: "https://github.com/tier3guy/Queryline" },
];

export default function Header() {
  return (
    <header className="relative z-50 border-b border-neutral-200 bg-white">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-stretch px-6 md:px-0">
        {/* Brand */}
        <div className="md:px-12 border-x border-neutral-200 flex items-center justify-center">
          <Logo />
        </div>

        {/* Navigation */}
        <nav className="absolute left-1/2 hidden h-full -translate-x-1/2 items-stretch md:flex">
          {navigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              target={item.href.startsWith("https://") ? "_blank" : undefined}
              rel={item.href.startsWith("https://") ? "noreferrer" : undefined}
              className="flex items-center border-l border-neutral-200 px-6 text-[13px] font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-950 last:border-r"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Primary action */}
        <div className="ml-auto flex items-center">
          <Link
            href="/workspace"
            className="group flex h-full items-center gap-4 border border-neutral-950 bg-neutral-950 px-5 text-[13px] font-medium text-white transition-colors hover:bg-[#f36b3f] hover:border-[#f36b3f]"
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
