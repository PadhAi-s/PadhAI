interface LogoProps {
  className?: string;
  withWordmark?: boolean;
}

/**
 * The signature element: an open book (the syllabus) with a small turmeric
 * spark rising off the spine (the moment a student asks PadhAI a question
 * and gets an answer). Reused wherever a loading/streak/"AI answered"
 * moment needs a mark, not just here in the header.
 */
export function Logo({ className = "", withWordmark = true }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 40 40"
        width="28"
        height="28"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M20 10C16 7.5 10.5 7 6 8v20c4.5-1 10 -0.5 14 2 4-2.5 9.5-3 14-2V8c-4.5-1-10-0.5-14 2Z"
          fill="currentColor"
          className="text-ink dark:text-paper"
        />
        <path d="M20 10v20" stroke="var(--color-paper)" strokeWidth="1" className="dark:stroke-ink" />
        <path
          d="M24 4c.5 2.5 2 4 4.5 4.5-2.5.5-4 2-4.5 4.5-.5-2.5-2-4-4.5-4.5C22 8 23.5 6.5 24 4Z"
          fill="var(--color-turmeric)"
        />
      </svg>
      {withWordmark && (
        <span className="font-sans font-semibold text-lg tracking-tight">
          Padh<span className="text-turmeric">AI</span>
        </span>
      )}
    </span>
  );
}
