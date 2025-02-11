import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea"> & { icon: string }
>(({ icon, className, ...props }, ref) => {
  return (
    <div className="relative flex items-center">
      {icon && (
        <div className="absolute left-2 top-2">
          <img src={icon} alt="アイコン" className="w-8 h-8 rounded-full" />
        </div>
      )}
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2  text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          icon && "pl-10",
        )}
        ref={ref}
        {...props}
      />
    </div>
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
