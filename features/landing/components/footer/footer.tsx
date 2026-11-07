import Link from "next/link";

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
      { label: "Github", href: "https://github.com/tier3guy/Queryline" },
      { label: "Support", href: "mailto:avinashgupta.works@gmail.com" },
      { label: "Creator", href: "https://tier3guy.com" }
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
    <footer className="border-t border-black/[0.08] px-6 py-12 md:px-12">
      <div className="mx-auto max-w-[1100px]">
        <div className="grid gap-12 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-[#f36b3f] text-lg font-bold text-white">
                q
              </div>

              <span className="text-lg font-semibold tracking-tight">
                queryline
              </span>
            </Link>

            <p className="mt-4 max-w-[250px] text-xs leading-6 text-neutral-500">
              A more natural way to connect with, understand, and query your
              data.
            </p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="mb-5 text-xs font-semibold">{group.title}</h3>

              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-neutral-500 transition-colors hover:text-[#f36b3f]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col justify-between gap-3 border-t border-black/[0.08] pt-6 text-[11px] text-neutral-400 sm:flex-row">
          <p>© 2026 Queryline. All rights reserved.</p>
          <p>Built for people who work with data.</p>
        </div>
      </div>
    </footer>
  );
};
