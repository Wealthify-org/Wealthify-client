import { ReactNode } from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { ROUTES } from "@/lib/routes";
import StartHeader from "@/components/UI/StartHeader/StartHeader";
import { Footer } from "@/components/UI/Footer/Footer";

import classes from "./LegalLayout.module.css";

interface LegalSectionData {
  title: string;
  body: string;
}

interface Props {
  /** Заголовок страницы (Privacy / Terms / Refund). */
  title: string;
  /** Дата последнего обновления — текстом, готовая к выводу. */
  lastUpdated: string;
  /** Краткое summary в виде bullet-points (необязательно). */
  summary?: string[];
  /** Основные секции документа: title + body. */
  sections: LegalSectionData[];
  /** Кастомный контент (если нужно вместо `sections` — например, кастомное оформление). */
  children?: ReactNode;
}

export async function LegalLayout({
  title,
  lastUpdated,
  summary,
  sections,
  children,
}: Props) {
  const t = await getTranslations("legal.common");

  return (
    <div className={classes.page}>
      <StartHeader />

      <main className={classes.main}>
        <div className={classes.container}>
          {/* Breadcrumb */}
          <nav className={classes.breadcrumb} aria-label="Breadcrumb">
            <Link href={ROUTES.ROOT} className={classes.breadcrumbLink}>
              {t("breadcrumbHome")}
            </Link>
            <span className={classes.breadcrumbSep} aria-hidden>
              /
            </span>
            <span className={classes.breadcrumbCurrent}>{title}</span>
          </nav>

          {/* Header */}
          <h1 className={classes.title}>{title}</h1>
          <p className={classes.dates}>
            {t("lastUpdated")}: {lastUpdated}
          </p>

          {/* Уведомление о применимом праве и приоритете RU-версии */}
          <p className={classes.bindingNotice}>{t("bindingNotice")}</p>

          {/* Summary */}
          {summary && summary.length > 0 && (
            <aside
              className={classes.summaryCard}
              aria-label={t("summaryHeading")}
            >
              <h2 className={classes.summaryHeading}>{t("summaryHeading")}</h2>
              <ul className={classes.summaryList}>
                {summary.map((point, i) => (
                  <li key={i} className={classes.summaryItem}>
                    {point}
                  </li>
                ))}
              </ul>
            </aside>
          )}

          {/* Sections */}
          <article className={classes.article}>
            {sections.map((s, i) => (
              <section key={i} className={classes.section}>
                <h2 className={classes.sectionTitle}>{s.title}</h2>
                <p className={classes.sectionBody}>{s.body}</p>
              </section>
            ))}
            {children}
          </article>

          {/* Contact */}
          <aside className={classes.contactCard}>
            <h3 className={classes.contactTitle}>{t("contactTitle")}</h3>
            <p className={classes.contactBody}>
              {t("contactBody")}{" "}
              <a
                href="mailto:support@wealthify.app"
                className={classes.contactLink}
              >
                support@wealthify.app
              </a>
            </p>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
