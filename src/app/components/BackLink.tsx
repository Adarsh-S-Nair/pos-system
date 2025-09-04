import Link from "next/link";

export default function BackLink() {
  return (
    <Link
      href="/"
      aria-label="Back to home"
      className="absolute left-4 top-4 inline-flex items-center text-[var(--color-fg)]/80 hover:text-[var(--color-fg)]"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </Link>
  );
}


