import http from "node:http";
import { Counter, Registry, collectDefaultMetrics } from "prom-client";

/**
 * Prometheus registry & counters for RevLoop Andon events.
 * Naming: domain_prefixed + *_total for counters; bounded labels. 
 * Ref: Prometheus metric/label naming best practices.
 */
export const registry = new Registry();
collectDefaultMetrics({ register: registry });

export const andonAttentionTotal = new Counter({
  name: "revloop_andon_attention_total",
  help: "Count of Andon ATTENTION events",
  labelNames: ["rule"] as const, // "sigma" | "weco"
  registers: [registry],
});

export const andonStopTotal = new Counter({
  name: "revloop_andon_stop_total",
  help: "Count of Andon STOP events",
  labelNames: ["rule"] as const,
  registers: [registry],
});

/** Record a single Andon event (bounded labels avoid cardinality blowups). */
export function recordAndon(event: "attention" | "stop", rule: "sigma" | "weco") {
  if (event === "attention") {
    andonAttentionTotal.labels(rule).inc();
  } else {
    andonStopTotal.labels(rule).inc();
  }
}

/** Optional embedded exporter for local/dev. Enable via METRICS_PORT. */
export function startMetricsServer(port: number) {
  const server = http.createServer(async (req, res) => {
    if (req.url === "/metrics") {
      const contentType = registry.contentType;
      res.writeHead(200, { "Content-Type": contentType });
      res.end(await registry.metrics());
      return;
    }
    res.writeHead(404); 
    res.end();
  });
  
  server.listen(port, () => {
    console.log(`📊 Metrics server listening on port ${port}`);
    console.log(`📊 Prometheus endpoint: http://localhost:${port}/metrics`);
  });
  
  return server;
}