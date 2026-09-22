"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck, UserCheck, KeyRound, AlertCircle, ShoppingBag } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Invalid email or password");
      }

      if (data.data.role === "ADMIN" || data.data.role === "SUPER_ADMIN") {
        router.push("/admin");
      } else {
        router.push(redirectUrl);
      }
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            <ShoppingBag className="h-7 w-7" />
            <span>Al-Zara Hub</span>
          </Link>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Sign in to manage your orders, cart, and account</p>
        </div>

        <Card className="shadow-lg border-zinc-200 dark:border-zinc-800">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-semibold">Sign in</CardTitle>
            <CardDescription>Enter your email and password to access your account</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400 rounded-md border border-red-200 dark:border-red-900">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Email Address</label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Password</label>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" isLoading={isLoading}>
                Sign In
              </Button>
            </CardContent>
          </form>

          <CardFooter className="flex flex-col space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
            <div className="w-full">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Quick Demo Accounts:
              </p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs py-1 h-auto flex flex-col items-center gap-1"
                  onClick={() => handleDemoLogin("superadmin@alzara.com", "Admin@123456")}
                >
                  <KeyRound className="h-3.5 w-3.5 text-amber-500" />
                  <span>Super Admin</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs py-1 h-auto flex flex-col items-center gap-1"
                  onClick={() => handleDemoLogin("admin1@alzara.com", "Admin@123456")}
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Admin</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs py-1 h-auto flex flex-col items-center gap-1"
                  onClick={() => handleDemoLogin("alex.chen@example.com", "User@123456")}
                >
                  <UserCheck className="h-3.5 w-3.5 text-blue-500" />
                  <span>Customer</span>
                </Button>
              </div>
            </div>

            <p className="text-xs text-center text-zinc-500 dark:text-zinc-400">
              Don&apos;t have an account yet?{" "}
              <Link href="/register" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                Create an account
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
