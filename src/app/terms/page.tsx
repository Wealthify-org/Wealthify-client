import { getTranslations } from "next-intl/server";
import { LegalLayout } from "@/components/Legal/LegalLayout/LegalLayout";

interface SectionData {
  title: string;
  body: string;
}

export const metadata = {
  title: "Terms of service — Wealthify",
};

export default async function TermsPage() {
  const t = await getTranslations("legal.terms");

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
