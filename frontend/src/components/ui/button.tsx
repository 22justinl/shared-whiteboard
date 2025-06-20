export default function Button({children, onClick, className}: {children: React.ReactNode, onClick: ()=>void, className?: string}) {
    return (
          <button
            onClick={onClick}
            // className={`rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto ${className}`}
            className={`rounded-full border border-solid border-black transition-colors flex items-center justify-center bg-white text-black gap-2 hover:bg-gray-300 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto ${className}`}
          >
          {children}
          </button>
    );
}
