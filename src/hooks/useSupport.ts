import { useMemo, useState } from "react";

/** Support FAQ category filter options. */
export type SupportCategory = "order" | "payment" | "product" | "account" | "other";

/** A single FAQ entry with question, answer, and category. */
export interface FaqItem {
  question: string;
  answer: string;
  category: SupportCategory;
}

/** Filters a static FAQ list by category and search query. */
export function useSupport(faqItems: FaqItem[]) {
  const [selectedCategory, setSelectedCategory] = useState<SupportCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFAQs = useMemo(
    () =>
      faqItems.filter((item) => {
        const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
        const matchesSearch =
          searchQuery === "" || item.question.includes(searchQuery) || item.answer.includes(searchQuery);
        return matchesCategory && matchesSearch;
      }),
    [faqItems, selectedCategory, searchQuery],
  );

  return { selectedCategory, setSelectedCategory, searchQuery, setSearchQuery, filteredFAQs };
}
