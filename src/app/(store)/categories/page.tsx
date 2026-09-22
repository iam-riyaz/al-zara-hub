import Link from "next/link";
import { CategoryService } from "@/features/categories/category.service";
import { ArrowRight, Layers } from "lucide-react";

export default async function CategoriesPage() {
  const tree = await CategoryService.getTree();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          All Departments & Categories
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
          Browse our structured collections spanning audiophile gear, minimalist apparel, modern workspaces, and smart living.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {tree.map((parent) => (
          <div
            key={parent.id}
            className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="space-y-1">
                <Link href={`/products?category=${parent.slug}`} className="hover:text-emerald-600 transition-colors">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Layers className="h-5 w-5 text-emerald-600" />
                    <span>{parent.name}</span>
                  </h2>
                </Link>
                <p className="text-xs text-zinc-500">{parent.description}</p>
              </div>
              <Link
                href={`/products?category=${parent.slug}`}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 shrink-0"
              >
                <span>View All ({parent._count?.products || 0})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Child subcategories */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {parent.children.map((child: any) => (
                <Link
                  key={child.id}
                  href={`/products?category=${child.slug}`}
                  className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all flex items-center justify-between group"
                >
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                      {child.name}
                    </h3>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{child._count?.products || 0} products</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-zinc-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
