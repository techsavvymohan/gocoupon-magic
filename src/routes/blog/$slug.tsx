/**
 * @file src/routes/blog/$slug.tsx
 * @description Single Blog Post Route Definition.
 */

import { createFileRoute, notFound } from "@tanstack/react-router";
import { createSeoHead } from "@/lib/seo";
import type { PostSection } from "@/data/posts";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const { getPostBySlug } = await import("@/data/posts");
    let post = getPostBySlug(params.slug);
    if (!post) {
      try {
        const res = await fetch(`/api/blogs/${params.slug}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const b = json.data;
            const { parseMarkdownToSections } = await import("@/lib/markdown");
            const parsedBody: PostSection[] = Array.isArray(b.body) && b.body.length > 0
              ? b.body
              : (b.content
                  ? parseMarkdownToSections(b.content)
                  : [{ type: "p" as const, text: b.shortDescription || b.excerpt || "" }]
                );

            post = {
              slug: b.slug,
              tag: b.category || b.tag || "General",
              date: b.date || (b.createdAt ? new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent"),
              title: b.title,
              excerpt: b.shortDescription || b.excerpt || "",
              read: b.readTime || b.read || "5 min read",
              author: b.author || "GoCoupon Editorial",
              cover: b.image || b.cover,
              body: parsedBody,
            };
          }
        }
      } catch {
        // network or server error fallback
      }
    }
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) return { meta: [{ title: "Post not found — goCoupon Blog" }] };
    return createSeoHead({
      title: `${post.title} — goCoupon Engineering & Deals Blog`,
      description: post.excerpt,
      path: `/blog/${post.slug}`,
      type: "article",
      keywords: `${post.tag.toLowerCase()}, buyhatke alternative, flash.co alternative, price tracker india, auto apply coupon extension, ${post.slug.split("-").join(" ")}`,
    });
  },
});
