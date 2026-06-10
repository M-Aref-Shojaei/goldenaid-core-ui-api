import { useCallback, useState } from "react";
import { sendManualSms } from "../api/admin";

export function useBulkSms() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState("");

  const toggleSelect = useCallback((phone: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(phone) ? next.delete(phone) : next.add(phone);
      return next;
    });
  }, []);

  const selectMany = useCallback((phones: string[]) => setSelected(new Set(phones)), []);
  const selectOne = useCallback((phone: string) => setSelected(new Set([phone])), []);
  const clearAll = useCallback(() => setSelected(new Set()), []);

  const send = useCallback(async () => {
    if (!message.trim() || selected.size === 0) return;
    setSending(true);
    setResult("");
    try {
      const res = await sendManualSms(Array.from(selected), message);
      setResult(`ارسال شد: ${res.sent} | ناموفق: ${res.failed}`);
      setMessage("");
      setSelected(new Set());
    } catch {
      setResult("خطا در ارسال پیامک");
    } finally {
      setSending(false);
    }
  }, [message, selected]);

  return { selected, toggleSelect, selectMany, selectOne, clearAll, message, setMessage, sending, result, send };
}
