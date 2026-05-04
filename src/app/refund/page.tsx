import { getTranslations } from "next-intl/server";
import { LegalLayout } from "@/components/Legal/LegalLayout/LegalLayout";

interface SectionData {
  title: string;
  body: string;
}

export const metadata = {
  title: "Refund policy — Wealthify",
};

export default async function RefundPage() {
  const t = await getTranslations("legal.refund");

  const summary = t.raw("summary") as string[];
  const sections = t.raw("sections") as SectionData[];

  return (
    <LegalLayout
      title={t("title")}
      lastUpdated={t("lastUpdated")}
      summary={summary}
      sections={sections}
    />
  );
}
