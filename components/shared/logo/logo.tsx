import Link from "next/link";

interface LogoProps {
  small?: boolean;
}

export default function Logo({ small }: LogoProps) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2">
      <div className="flex size-8 items-center justify-center border border-[#f36b3f] bg-[#f36b3f] text-lg font-bold text-white">
        q
        <span className="text-2xl">.</span>
      </div>

      {!small && <span className="text-[19px] font-semibold tracking-[-0.8px] text-neutral-950 pl-8">
        queryline
      </span>}
    </Link>
  );
}
