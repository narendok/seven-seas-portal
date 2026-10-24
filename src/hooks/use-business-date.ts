import { useEffect, useState } from "react";
import { businessDate } from "@/lib/business-date";
/** Refresh on the calendar boundary and when a suspended browser regains focus. */
export function useBusinessDate(timeZone = "Asia/Kolkata") {
  const [day, setDay] = useState(() => businessDate(new Date(), timeZone));
  useEffect(() => {
    const refresh = () => setDay(businessDate(new Date(), timeZone));
    refresh();
    const timer = window.setInterval(refresh, 15000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [timeZone]);
  return day;
}
