"use client";

import { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";

import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { ROUTES } from "@/lib/routes";
import { useTokenStore } from "@/stores/tokenStore/TokenProvider";
import { useCurrentUserStore } from "@/stores/currentUser/CurrentUserProvider";

import {
  RiskBucket,
  RiskProfileResult,
  RiskQuestion,
  SubmitAnswer,
} from "./types";
import { RiskResultCard } from "./RiskResultCard";

import classes from "./RiskProfileTest.module.css";

type Stage = "intro" | "questions" | "submitting" | "result";

const CATEGORY_LABEL: Record<string, string> = {
  horizon: "Горизонт инвестирования",
  capacity: "Финансовая способность",
  tolerance: "Толерантность к риску",
  knowledge: "Опыт и знания",
  goals: "Цели",
};

export const RiskProfileTest = observer(() => {
  const router = useRouter();
  const tokenStore = useTokenStore();
  const currentUser = useCurrentUserStore();

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
        if (!cancelled) setError("Не удалось загрузить тест. Попробуйте позже.");
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
      const msg = e instanceof Error ? e.message : "Ошибка при отправке";
      setError(msg);
      setStage("questions");
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
    return (
      <section className={classes.root}>
        <header className={classes.heroHeader}>
          <p className={classes.eyebrow}>Risk profile assessment</p>
          <h1 className={classes.heroTitle}>
            Узнайте свой инвестиционный риск-профиль
          </h1>
          <p className={classes.heroSubtitle}>
            Ответьте на {totalQuestions} коротких вопросов — и мы определим,
            какой стиль управления портфелем вам подходит. На основе вашего
            профиля платформа будет давать персонализированные рекомендации.
          </p>
        </header>

        {existingProfile ? (
          <>
            <h3 className={classes.sectionTitle}>Ваш текущий профиль</h3>
            <RiskResultCard profile={existingProfile} variant="inline" />
            <div className={classes.heroActions}>
              <button
                type="button"
                className={`${classes.btn} ${classes.btnPrimary}`}
                onClick={startTest}
              >
                Пройти тест заново
              </button>
              <button
                type="button"
                className={`${classes.btn} ${classes.btnGhost}`}
                onClick={() => router.push(ROUTES.PORTFOLIOS)}
              >
                Перейти к портфелям
              </button>
            </div>
          </>
        ) : (
          <>
            <ul className={classes.featuresList}>
              <li>5 категорий вопросов: горизонт, опыт, толерантность, цели, финансовое положение</li>
              <li>Занимает 2–3 минуты</li>
              <li>Результаты сохраняются и используются для рекомендаций по портфелю</li>
            </ul>
            <div className={classes.heroActions}>
              <button
                type="button"
                className={`${classes.btn} ${classes.btnPrimary}`}
                onClick={startTest}
              >
                Начать тест
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
          <p className={classes.eyebrow}>Готово</p>
          <h1 className={classes.heroTitle}>Ваш риск-профиль</h1>
        </header>
        <RiskResultCard profile={latestResult} variant="standalone" />
        <div className={classes.heroActions}>
          <button
            type="button"
            className={`${classes.btn} ${classes.btnPrimary}`}
            onClick={() => router.push(ROUTES.PORTFOLIOS)}
          >
            Перейти к портфелям
          </button>
          <button
            type="button"
            className={`${classes.btn} ${classes.btnGhost}`}
            onClick={() => {
              setStage("intro");
            }}
          >
            Пройти заново
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
            Вопрос {stepIdx + 1} из {totalQuestions}
          </span>
          <span className={classes.progressCategory}>
            {CATEGORY_LABEL[currentQuestion.category] ?? currentQuestion.category}
          </span>
        </div>
        <div className={classes.progressBar}>
          <div
            className={classes.progressFill}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className={classes.questionCard}>
        <h2 className={classes.questionText}>{currentQuestion.text}</h2>
        {currentQuestion.hint && (
          <p className={classes.questionHint}>{currentQuestion.hint}</p>
        )}

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
                  <span className={classes.optionText}>{opt.text}</span>
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
          ← Назад
        </button>

        {!isLastQuestion ? (
          <button
            type="button"
            className={`${classes.btn} ${classes.btnPrimary}`}
            onClick={goNext}
            disabled={!selectedOptionId || stage === "submitting"}
          >
            Дальше →
          </button>
        ) : (
          <button
            type="button"
            className={`${classes.btn} ${classes.btnPrimary}`}
            onClick={submit}
            disabled={!allAnswered || stage === "submitting"}
          >
            {stage === "submitting" ? "Отправка..." : "Получить профиль"}
          </button>
        )}
      </div>

      {!isLastQuestion && (
        <p className={classes.hintFooter}>
          Можно вернуться к предыдущим ответам и изменить их в любой момент до
          отправки.
        </p>
      )}
    </section>
  );
});
