import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-4">
      <div className="h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
        <ShoppingBag className="h-8 w-8" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        404 - Page Not Found
      </h1>
      <p className="text-sm text-zinc-500 max-w-md">
        The merchandise, collection, or page you are searching for does not exist or has been relocated.
      </p>
      <div className="pt-2">
        <Link href="/" className={cn(buttonVariants({ size: "lg" }), "font-semibold")}>
          Return to Storefront
        </Link>
      </div>
    </div>
  );
}
