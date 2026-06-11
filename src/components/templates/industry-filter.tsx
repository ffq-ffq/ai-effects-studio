"use client";

import { industries } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export function IndustryFilter() {
  return (
    <div className="flex flex-wrap gap-2">
      {industries.map((industry) => (
        <Button key={industry} size="sm" variant="outline">
          {industry}
        </Button>
      ))}
    </div>
  );
}
