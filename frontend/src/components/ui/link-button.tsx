import Link from "next/link";

export default function LinkButton({text, link, className}: {text: string, link: string, className?: string}) {
    return (
          <Link
            className={`rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto ${className}`}
            href={link}
          >
          {text}
          </Link>
    );
}
