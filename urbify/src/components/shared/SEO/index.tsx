import type { Metadata } from "next";

export function createSeo(title: string, description: string): Metadata {
  return { title, description };
}
