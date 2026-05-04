"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { ROUTES } from "@/lib/routes";
import classes from "./Footer.module.css";

interface LinkItem {
  /** Translation key from `footer.links.*`. */
  key: string;
  href: string;
  /** External link → opens in new tab; href starting with `#` → smooth scroll. */
  external?: boolean;
}

interface LinkGroup {
  titleKey: "product" | "legal" | "contact";
  links: LinkItem[];
}

const GROUPS: LinkGroup[] = [
  {
    titleKey: "product",
    links: [
      { key: "home", href: ROUTES.HOME },
      { key: "goals", href: "/#goals" },
      { key: "pricing", href: "/#pricing" },
      { key: "signUp", href: ROUTES.SIGN_UP },
      { key: "signIn", href: ROUTES.SIGN_IN },
    ],
  },
  {
    titleKey: "legal",
    links: [
      { key: "privacy", href: ROUTES.PRIVACY },
      { key: "terms", href: ROUTES.TERMS },
      { key: "refund", href: ROUTES.REFUND },
    ],
  },
  {
    titleKey: "contact",
    links: [
      { key: "email", href: "mailto:support@wealthify.app", external: true },
      { key: "telegram", href: "https://t.me/wealthify_app", external: true },
    ],
  },
];

const smoothScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
  const href = e.currentTarget.getAttribute("href");
  if (!href || !href.startsWith("/#")) return;
  const target = document.getElementById(href.slice(2));
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: "smooth", block: "start" });
};

export const Footer = () => {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className={classes.footer}>
      <div className={classes.inner}>
        <div className={classes.top}>
          {/* Brand block */}
          <div className={classes.brand}>
            <Link href={ROUTES.ROOT} className={classes.brandRow}>
              <span className={classes.logoMark} aria-hidden>
                <LogoMarkIcon />
              </span>
              <span className={classes.brandName}>Wealthify</span>
            </Link>
            <p className={classes.tagline}>{t("tagline")}</p>
          </div>

          {/* Link groups */}
          <div className={classes.groups}>
            {GROUPS.map((group) => (
              <nav
                key={group.titleKey}
                className={classes.group}
                aria-label={t(`groups.${group.titleKey}`)}
              >
                <h4 className={classes.groupTitle}>
                  {t(`groups.${group.titleKey}`)}
                </h4>
                <ul className={classes.groupList}>
                  {group.links.map((link) => {
                    const label = t(`links.${link.key}`);
                    if (link.external) {
                      return (
                        <li key={link.key}>
                          <a
                            href={link.href}
                            className={classes.link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {label}
                          </a>
                        </li>
                      );
                    }
                    if (link.href.startsWith("/#")) {
                      return (
                        <li key={link.key}>
                          <a
                            href={link.href}
                            className={classes.link}
                            onClick={smoothScroll}
                          >
                            {label}
                          </a>
                        </li>
                      );
                    }
                    return (
                      <li key={link.key}>
                        <Link href={link.href} className={classes.link}>
                          {label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className={classes.divider} />

        <div className={classes.bottom}>
          <span className={classes.copyright}>
            {t("copyright", { year })}
          </span>
        </div>
      </div>
    </footer>
  );
};

const LogoMarkIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M4 16 L9 8 L14 14 L20 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="20" cy="6" r="1.6" fill="currentColor" />
  </svg>
);
