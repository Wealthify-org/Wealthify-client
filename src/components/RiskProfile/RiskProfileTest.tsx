"use client";

import { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { ROUTES } from "@/lib/routes";
import { useTokenStore } from "@/stores/tokenStore/TokenProvider";
import { useCurrentUserStore } from "@/stores/currentUser/CurrentUserProvider";

import {
  RiskProfileResult,
  RiskQuestion,
  SubmitAnswer,
} from "./types";
import { RiskResultCard } from "./RiskResultCard";

import classes from "./RiskProfileTest.module.css";

type Stage = "intro" | "questions" | "submitting" | "result";

const CATEGORY_KEYS = ["horizon", "capacity", "tolerance", "knowledge", "goals"] as const;
type CategoryKey = (typeof CATEGORY_KEYS)[number];

export const RiskProfileTest = observer(() => {
  const router = useRouter();
  const tokenStore = useTokenStore();
  const currentUser = useCurrentUserStore();
  const t = useTranslations("riskProfile");
  const tQuestions = useTranslations("riskProfile.questions");

  const [stage, setStage] = useState<Stage>("intro");
  const [questions, setQuestions] = useState<RiskQuestion[] | null>(null);
  const [existingProfile, setExistingProfile] = useState<RiskProfileResult | null>(null);
  const [latestResult, setLatestResult] = useState<RiskProfileResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // выбранные ответы: questionId -> optionId
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [stepIdx, setStepIdx] = useState(0);

  const headers = useMemo(() => {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (tokenStore.token) h.Authorization = `Bearer ${tokenStore.token}`;
    return h;
  }, [tokenStore.token]);

  // редирект неавторизованных
  useEffect(() => {
    if (currentUser.hydrated && !currentUser.isAuthenticated) {
      router.replace(`${ROUTES.SIGN_IN}?from=${encodeURIComponent(ROUTES.RISK_PROFILE)}`);
    }
  }, [currentUser.hydrated, currentUser.isAuthenticated, router]);

  // первичная загрузка: вопросы + текущий профиль
  useEffect(() => {
    if (!tokenStore.token) return;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [qRes, mRes] = await Promise.all([
          fetch(API_ENDPOINTS.RISK_PROFILE_QUESTIONS, {
            method: "GET",
            cache: "no-store",
          }),
          fetch(API_ENDPOINTS.RISK_PROFILE_ME, {
            method: "GET",
            cache: "no-store",
            credentials: "include",
            headers,
          }),
        ]);

        if (!qRes.ok) throw new Error(`questions ${qRes.status}`);
        const qs = (await qRes.json()) as RiskQuestion[];
        const sortedQs = [...qs].sort((a, b) => a.order - b.order);

        let profile: RiskProfileResult | null = null;
        if (mRes.ok) {
          const text = await mRes.text();
          if (text.trim()) {
            try {
              const body = JSON.parse(text);
              profile =
                body && typeof body === "object" && body.id
                  ? (body as RiskProfileResult)
                  : null;
            } catch {
              profile = null;
            }
          }
        }

        if (cancelled) return;
        setQuestions(sortedQs);
        setExistingProfile(profile);
      } catch (e) {
        console.error("[RiskProfile] load error", e);
        if (!cancelled) setError(t("loadError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [headers, tokenStore.token]);

  const totalQuestions = questions?.length ?? 0;
  const currentQuestion = questions?.[stepIdx];
  const selectedOptionId = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isLastQuestion = stepIdx === totalQuestions - 1;
  const allAnswered =
    !!questions && questions.every((q) => !!answers[q.id]);

  const startTest = () => {
    setAnswers({});
    setStepIdx(0);
    setStage("questions");
    setError(null);
  };

  const selectOption = (optionId: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }));
  };

  const goNext = () => {
    if (!currentQuestion || !selectedOptionId) return;
    if (stepIdx < totalQuestions - 1) setStepIdx(stepIdx + 1);
  };

  const goBack = () => {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  };

  const submit = async () => {
    if (!questions || !allAnswered) return;
    setStage("submitting");
    setError(null);
    try {
      const payload: { answers: SubmitAnswer[] } = {
        answers: questions.map((q) => ({
          questionId: q.id,
          optionId: answers[q.id],
        })),
      };

      const res = await fetch(API_ENDPOINTS.RISK_PROFILE_SUBMIT, {
        method: "POST",
        cache: "no-store",
        credentials: "include",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `submit ${res.status}`);
      }

      const profile = (await res.json()) as RiskProfileResult;
      setLatestResult(profile);
      setExistingProfile(profile);
      setStage("result");
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("loadError");
      setError(msg);
      setStage("questions");
    }
  };

  const tryGetQuestionText = (questionId: string, fallback: string): string => {
    try {
      return tQuestions(`${questionId}.text` as never);
    } catch {
      return fallback;
    }
  };
  const tryGetQuestionHint = (questionId: string, fallback?: string): string | undefined => {
    try {
      return tQuestions(`${questionId}.hint` as never);
    } catch {
      return fallback;
    }
  };
  const tryGetOptionText = (questionId: string, optionId: string, fallback: string): string => {
    try {
      return tQuestions(`${questionId}.options.${optionId}` as never);
    } catch {
      return fallback;
    }
  };

  // ───── рендер ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <section className={classes.skeletonContainer}>
        <div className={classes.skeletonHeader} />
        <div className={classes.skeletonBody} />
      </section>
    );
  }

  if (error && stage === "intro") {
    return (
      <section className={classes.errorContainer}>
        <h2 className={classes.errorTitle}>{error}</h2>
      </section>
    );
  }

  if (stage === "intro") {
    const features = t.raw("testFeatures") as string[];
    return (
      <section className={classes.root}>
        <header className={classes.heroHeader}>
          <p className={classes.eyebrow}>{t("eyebrow")}</p>
          <h1 className={classes.heroTitle}>
            {t("heroTitle")}
          </h1>
          <p className={classes.heroSubtitle}>
            {t("heroSubtitle", { count: totalQuestions })}
          </p>
        </header>

        {existingProfile ? (
          <>
            <h3 className={classes.sectionTitle}>{t("currentProfile")}</h3>
            <RiskResultCard profile={existingProfile} variant="inline" />
            <div className={classes.heroActions}>
              <button
                type="button"
                className={`${classes.btn} ${classes.btnPrimary}`}
                onClick={startTest}
              >
                {t("takeAgain")}
              </button>
              <button
                type="button"
                className={`${classes.btn} ${classes.btnGhost}`}
                onClick={() => router.push(ROUTES.PORTFOLIOS)}
              >
                {t("goToPortfolios")}
              </button>
            </div>
          </>
        ) : (
          <>
            <ul className={classes.featuresList}>
              {features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
            <div className={classes.heroActions}>
              <button
                type="button"
                className={`${classes.btn} ${classes.btnPrimary}`}
                onClick={startTest}
              >
                {t("startTest")}
              </button>
            </div>
          </>
        )}
      </section>
    );
  }

  if (stage === "result" && latestResult) {
    return (
      <section className={classes.root}>
        <header className={classes.heroHeader}>
          <p className={classes.eyebrow}>{t("doneEyebrow")}</p>
          <h1 className={classes.heroTitle}>{t("doneTitle")}</h1>
        </header>
        <RiskResultCard profile={latestResult} variant="standalone" />
        <div className={classes.heroActions}>
          <button
            type="button"
            className={`${classes.btn} ${classes.btnPrimary}`}
            onClick={() => router.push(ROUTES.PORTFOLIOS)}
          >
            {t("goToPortfolios")}
          </button>
          <button
            type="button"
            className={`${classes.btn} ${classes.btnGhost}`}
            onClick={() => {
              setStage("intro");
            }}
          >
            {t("passAgain")}
          </button>
        </div>
      </section>
    );
  }

  // questions / submitting
  if (!currentQuestion) {
    return null;
  }

  const progressPct = ((stepIdx + 1) / totalQuestions) * 100;

  return (
    <section className={classes.root}>
      <div className={classes.progressShell}>
        <div className={classes.progressMeta}>
          <span>
            {t("questionOf", { current: stepIdx + 1, total: totalQuestions })}
          </span>
          <span className={classes.progressCategory}>
            {(CATEGORY_KEYS as readonly string[]).includes(currentQuestion.category)
              ? t(`categories.${currentQuestion.category as CategoryKey}`)
              : currentQuestion.category}
          </span>
        </div>
        <div className={classes.progressBar}>
          <div
            className={classes.progressFill}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className={classes.questionCard} key={currentQuestion.id}>
        <h2 className={classes.questionText}>{tryGetQuestionText(currentQuestion.id, currentQuestion.text)}</h2>
        {(() => {
          const hint = tryGetQuestionHint(currentQuestion.id, currentQuestion.hint ?? undefined);
          return hint ? <p className={classes.questionHint}>{hint}</p> : null;
        })()}

        <ul className={classes.optionsList} role="radiogroup">
          {currentQuestion.options.map((opt) => {
            const isSelected = opt.id === selectedOptionId;
            return (
              <li key={opt.id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => selectOption(opt.id)}
                  className={`${classes.option} ${
                    isSelected ? classes.optionSelected : ""
                  }`}
                >
                  <span className={classes.optionRadio} aria-hidden="true">
                    {isSelected && <span className={classes.optionRadioDot} />}
                  </span>
                  <span className={classes.optionText}>{tryGetOptionText(currentQuestion.id, opt.id, opt.text)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {error && <p className={classes.inlineError}>{error}</p>}

      <div className={classes.navRow}>
        <button
          type="button"
          className={`${classes.btn} ${classes.btnGhost}`}
          onClick={goBack}
          disabled={stepIdx === 0 || stage === "submitting"}
        >
          {t("navigation.back")}
        </button>

        {!isLastQuestion ? (
          <button
            type="button"
            className={`${classes.btn} ${classes.btnPrimary}`}
            onClick={goNext}
            disabled={!selectedOptionId || stage === "submitting"}
          >
            {t("navigation.next")}
          </button>
        ) : (
          <button
            type="button"
            className={`${classes.btn} ${classes.btnPrimary}`}
            onClick={submit}
            disabled={!allAnswered || stage === "submitting"}
          >
            {stage === "submitting" ? t("navigation.submitting") : t("navigation.submit")}
          </button>
        )}
      </div>

      {!isLastQuestion && (
        <p className={classes.hintFooter}>
          {t("navigation.footerHint")}
        </p>
      )}
    </section>
  );
});
