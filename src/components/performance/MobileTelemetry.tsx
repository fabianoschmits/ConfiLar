"use client";
import { useEffect } from "react";
import { canMeasure, metricRoute } from "@/lib/mobile-metrics";
export function MobileTelemetry() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || navigator.doNotTrack === "1")
      return;
    let disposed = false;
    let queue: {
      name: string;
      value: number;
      route: string;
      mobile: boolean;
    }[] = [];
    const flush = () => {
      if (!canMeasure()) {
        queue = [];
        return;
      }
      if (!queue.length || !navigator.onLine) return;
      const body = new Blob(
        [JSON.stringify({ metrics: queue.splice(0, 10) })],
        { type: "application/json" },
      );
      navigator.sendBeacon("/api/telemetry", body);
    };
    const report = (name: string, value: number) => {
      if (disposed || !canMeasure() || queue.length >= 10) return;
      queue.push({
        name,
        value: Math.round(value * 1000) / 1000,
        route: metricRoute(window.location.pathname),
        mobile: window.innerWidth < 768,
      });
    };
    void import("web-vitals").then(({ onLCP, onINP, onCLS }) => {
      if (disposed) return;
      // Core Web Vitals belong to the initial document, not later SPA routes.
      const route = metricRoute(window.location.pathname);
      const vital = (metric: { name: string; value: number }) => {
        report(metric.name, metric.value);
        if (queue.length) queue[queue.length - 1].route = route;
      };
      onLCP(vital);
      onINP(vital);
      onCLS(vital);
    });
    const error = () => report("ERROR", 1);
    const rejection = () => report("REJECTION", 1);
    const visibility = () => {
      if (document.hidden) flush();
    };
    const timer = setInterval(flush, 15000);
    window.addEventListener("error", error);
    window.addEventListener("unhandledrejection", rejection);
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      disposed = true;
      clearInterval(timer);
      window.removeEventListener("error", error);
      window.removeEventListener("unhandledrejection", rejection);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return null;
}
