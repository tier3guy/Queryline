import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2 pr-8">
      <div className="flex size-8 items-center justify-center border border-[#f36b3f] bg-[#f36b3f] text-lg font-bold text-white">
        q
        <span className="text-2xl">.</span>
      </div>

      <span className="text-[19px] font-semibold tracking-[-0.8px] text-neutral-950">
        queryline
      </span>
    </Link>
  );
}
