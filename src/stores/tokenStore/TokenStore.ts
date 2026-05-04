import { makeAutoObservable, runInAction } from "mobx";
import { getTokenExpiry } from "@/lib/auth/jwt";

/**
 * Refresher — функция, которую AuthBootstrap прописывает извне.
 * Возвращает Promise успеха/неуспеха refresh'а. Возвращаемый Promise
 * нужен для **single-flight**: если в момент выполнения refresh'а
 * пришёл 401 от другого запроса, мы не дёргаем второй refresh, а
 * ждём результата первого.
 */
type Refresher = () => Promise<boolean>;

export class TokenStore {
  private _access: string | null = null;
  private refreshTimeoutId: number | null = null;
  // Promise активного refresh'а — используется для дедупа конкурентных
  // вызовов. Раньше при истечении токена 5 fetch'ей могли получить 401
  // и каждый дёргал refresh — гонка ротации могла оставить юзера без
  // валидного refresh-cookie на сервере. Теперь — один-в-один.
  private pendingRefresh: Promise<boolean> | null = null;

  // refresher задаётся в AuthBootstrap. Хранится как функция, которая
  // действительно делает HTTP-запрос — TokenStore сам управляет
  // дедупликацией.
  private refresher: Refresher | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get token(): string | null {
    return this._access;
  }

  get hasToken(): boolean {
    return !!this._access;
  }

  /**
   * Внешний код (AuthBootstrap) регистрирует функцию рефреша при
   * монтировании. Когда AuthBootstrap unmount'ится, refresher остаётся
   * установлен — следующий mount просто перезапишет его. Это лучше,
   * чем старый callback-подход, где между unmount/mount auto-refresh
   * терял связь и тихо умирал.
   */
  setRefresher(refresher: Refresher) {
    this.refresher = refresher;
  }

  setFromLogin(accessToken: string) {
    this._access = accessToken;
    this.setupAutoRefresh();
  }

  clear() {
    this._access = null;
    if (this.refreshTimeoutId !== null) {
      window.clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }
    // не сбрасываем pendingRefresh: возможно идёт refresh, и мы хотим
    // чтобы его resolve'нувшийся результат обработался корректно.
  }

  /**
   * Вызывается извне (interceptor 401 → refresh → retry). Если refresh
   * уже идёт — возвращает тот же promise. Если refresher не зарегистрирован,
   * сразу резолвится в false.
   */
  async refresh(): Promise<boolean> {
    if (this.pendingRefresh) return this.pendingRefresh;
    if (!this.refresher) return false;

    const p = (async () => {
      try {
        const ok = await this.refresher!();
        return ok;
      } catch {
        return false;
      } finally {
        runInAction(() => {
          this.pendingRefresh = null;
        });
      }
    })();
    this.pendingRefresh = p;
    return p;
  }

  private setupAutoRefresh() {
    if (typeof window === "undefined") return;
    if (!this.token) return;

    const expMs = getTokenExpiry(this.token);
    if (!expMs) return;

    const now = Date.now();
    const skew = 30_000; // обновляемся за 30 секунд до истечения
    // нижняя граница 5с — защита от того, что бэкенд выдал
    // практически просроченный токен (или у пользователя расфазированы
    // часы): иначе delay=0, refresh запускается до того как фронт
    // успел сделать с этим токеном хоть один полезный запрос, и мы
    // получаем шторм refresh'ей.
    const rawDelay = expMs - now - skew;
    const delay = Math.max(5_000, rawDelay);

    if (this.refreshTimeoutId !== null) {
      window.clearTimeout(this.refreshTimeoutId);
    }

    this.refreshTimeoutId = window.setTimeout(() => {
      this.refreshTimeoutId = null;
      void this.refresh();
    }, delay);
  }
}
