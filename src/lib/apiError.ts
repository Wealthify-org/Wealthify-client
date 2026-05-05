/**
 * Извлечение «человеческого» сообщения из ответа API.
 *
 * Бекенд (NestJS gateway) на бизнес-ошибках возвращает JSON вида
 * `{ statusCode: 4xx, code: "PORTFOLIO_EXISTS", message: "..." }`.
 * Раньше модалки делали `await res.text()` и показывали generic
 * «Не удалось …» — пользователь видел одно и то же независимо от
 * причины (имя занято / нет актива / цена 0 / прочее).
 *
 * Этот хелпер:
 *  1. Пытается распарсить body как JSON.
 *  2. Если есть `code` — ищет перевод в namespace `apiErrors`.
 *  3. Если перевода нет — fallback на `message` от бекенда.
 *  4. Если и его нет — fallback на переданный default.
 *
 * Безопасен к двойному чтению body (response клонируется).
 */

type Translator = (key: string) => string;

interface BackendErrorBody {
  code?: string;
  message?: string;
  statusCode?: number;
}

/**
 * @param response — Response, у которого `!ok`
 * @param tApiErrors — translator для namespace `apiErrors`
 *                    (например `useTranslations("apiErrors")`)
 * @param fallback — что показать, если backend не вернул ни code, ни message
 */
export async function extractApiError(
  response: Response,
  tApiErrors: Translator,
  fallback: string,
): Promise<string> {
  let body: BackendErrorBody | null = null;
  try {
    // НЕ res.json() напрямую — модалка-caller может захотеть прочитать
    // body для логов; клонируем, чтобы основной поток не «съедал» stream.
    const cloned = response.clone();
    const text = await cloned.text();
    if (text.trim().length === 0) {
      return fallback;
    }
    body = JSON.parse(text) as BackendErrorBody;
  } catch {
    return fallback;
  }

  if (body?.code) {
    // next-intl бросает при отсутствии ключа. Оборачиваем — если кода нет
    // в словаре, не падаем, а используем backend-message либо fallback.
    try {
      const translated = tApiErrors(body.code);
      // next-intl при missing-fallback возвращает ключ обратно — детектим
      if (translated && translated !== body.code) {
        return translated;
      }
    } catch {
      /* нет такого ключа — идём дальше */
    }
  }

  if (body?.message) {
    return body.message;
  }

  return fallback;
}
