import React, { ReactNode } from "react";
import { Info } from "lucide-react";

export const InfoMessage = ({ children }: { children: ReactNode }) => {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-md shadow-md mt-2 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <Info size={20} className="text-amber-500" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-amber-800">{children}</p>
        </div>
      </div>
    </div>
  );
};
