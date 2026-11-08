import Link from "next/link";
import Logo from "@/components/shared/logo/logo";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#workflow" },
      { label: "Workspace", href: "/workspace" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "GitHub", href: "https://github.com/tier3guy/Queryline" },
      { label: "Support", href: "mailto:avinashgupta.works@gmail.com" },
      { label: "Creator", href: "https://tier3guy.com" },
    ],
  },
  {
    title: "Account",
    links: [
      // { label: "Log in", href: "/sign-in" },
      { label: "Get started", href: "/workspace" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-b border-neutral-200 bg-white px-6 md:px-12">
      <div className="mx-auto max-w-[1440px] border-x border-neutral-200">
        <div className="grid gap-12 px-6 py-14 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] md:px-12 md:py-16">
          <div>
            <Logo />

            <p className="mt-5 max-w-[260px] text-xs leading-6 text-neutral-500">
              A more natural way to connect with, understand, and query your
              data.
            </p>

            <p className="mt-8 font-mono text-[10px] uppercase tracking-[1px] text-neutral-400">
              Database workspace / 001
            </p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="mb-5 border-b border-neutral-200 pb-3 text-[11px] font-semibold uppercase tracking-[1.2px] text-neutral-900">
                {group.title}
              </h3>

              <ul className="space-y-4">
                {group.links.map((link) => {
                  const isExternal = link.href.startsWith("https://");

                  return (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noreferrer" : undefined}
                        className="text-xs text-neutral-500 transition-colors hover:text-[#f36b3f]"
                      >
                        {link.label}
                        {isExternal && (
                          <span className="ml-1.5 text-[10px]">↗</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col justify-between gap-3 border-t border-neutral-200 px-6 py-5 text-[10px] font-medium uppercase tracking-[0.8px] text-neutral-400 sm:flex-row sm:items-center md:px-12">
          <p>© 2026 Queryline. All rights reserved.</p>
          <p>Built for people who work with data.</p>
        </div>
      </div>
    </footer>
  );
};
