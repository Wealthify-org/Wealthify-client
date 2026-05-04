"use client";

import { memo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import classes from "./Markdown.module.css";

interface MarkdownProps {
  /** Сырой markdown-текст от LLM. */
  children: string;
  /**
   * Variant управляет внешним видом блока. Сейчас используется для тонких
   * различий в плотности (chat — компактнее, card — больше воздуха).
   */
  variant?: "chat" | "card";
  className?: string;
}

const components: Components = {
  // блочные ссылки открываем в новой вкладке + safe rel
  a: ({ children, href, ...rest }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={classes.link}
      {...rest}
    >
      {children}
    </a>
  ),

  // оборачиваем pre, чтобы добавить стиль скролла горизонтально
  pre: ({ children }) => <pre className={classes.pre}>{children}</pre>,

  // inline и block code различаем по наличию className (rehype проставляет
  // language-XXX для блочного кода — у inline её нет)
  code: ({ children, className: cn }) => {
    const isBlock = typeof cn === "string" && cn.startsWith("language-");
    if (isBlock) {
      return <code className={`${classes.codeBlock} ${cn ?? ""}`}>{children}</code>;
    }
    return <code className={classes.codeInline}>{children}</code>;
  },

  // таблицы — оборачиваем в скроллер, чтобы не ломать ширину контейнера
  table: ({ children }) => (
    <div className={classes.tableWrapper}>
      <table className={classes.table}>{children}</table>
    </div>
  ),

  // сделать первый/последний элемент без верхнего/нижнего отступа умеют CSS-селекторы,
  // ниже только маркируем сами элементы своими классами:
  h1: ({ children }) => <h1 className={classes.h1}>{children}</h1>,
  h2: ({ children }) => <h2 className={classes.h2}>{children}</h2>,
  h3: ({ children }) => <h3 className={classes.h3}>{children}</h3>,
  h4: ({ children }) => <h4 className={classes.h4}>{children}</h4>,
  p: ({ children }) => <p className={classes.p}>{children}</p>,
  ul: ({ children }) => <ul className={classes.ul}>{children}</ul>,
  ol: ({ children }) => <ol className={classes.ol}>{children}</ol>,
  li: ({ children }) => <li className={classes.li}>{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className={classes.blockquote}>{children}</blockquote>
  ),
  hr: () => <hr className={classes.hr} />,
  strong: ({ children }) => <strong className={classes.strong}>{children}</strong>,
  em: ({ children }) => <em className={classes.em}>{children}</em>,
};

const MarkdownInner = ({ children, variant = "chat", className }: MarkdownProps) => {
  return (
    <div
      className={`${classes.root} ${variant === "card" ? classes.variantCard : classes.variantChat} ${className ?? ""}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
};

/**
 * Тонкая обёртка над react-markdown с кастомными стилями под наш сайт.
 * Memoized — чтобы при streaming-обновлениях родителя не пере-рендерить
 * полностью при каждом дельте.
 */
export const Markdown = memo(MarkdownInner);
