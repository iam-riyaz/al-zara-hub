"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Client Error Boundary Caught:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-4">
      <div className="h-16 w-16 rounded-full bg-red-50 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        Something went wrong
      </h1>
      <p className="text-sm text-zinc-500 max-w-md">
        An unexpected application error occurred. We apologize for the inconvenience.
      </p>
      <div className="flex items-center gap-3 pt-2">
        <Button onClick={() => reset()} variant="outline">
          Try Again
        </Button>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
