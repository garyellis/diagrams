# Architecture Diagrams

Interactive animated diagrams exploring infrastructure failure scenarios and resilience strategies.

Each scenario is presented as a problem/solution pair — the problem demonstrates a failure mode, and the solution shows the mitigation architecture.

**Live site:** https://garyellis.github.io/diagrams/

## Diagrams

**Cloudflare Proxy & Dashboard/API Failure**

- [Problem: API & Proxy Failure](cf-api-proxy-failure.html) — Cloudflare outage traps traffic when Edge and API go down simultaneously, preventing DNS failover.
- [Solution: Cloudflare CNAME/Partial Setup](cf-api-proxy-solution.html) — Delegating DNS to an external provider enables bypassing Cloudflare during an outage.

## How it works

Diagrams are built with a config-driven engine (`diagram-engine.js` + `diagram-engine.css`). Each diagram is a standalone HTML file containing:

1. A **config object** defining nodes, connections, DNS cards, and layout
2. A **scenario function** scripting the animated sequence

```
index.html                  Landing page
cf-api-proxy-failure.html   Problem diagram
cf-api-proxy-solution.html  Solution diagram
diagram-engine.js           Rendering engine
diagram-engine.css           Shared styles
components/                  SVG node icons
```

## Adding a new diagram

1. Create a new HTML file (see existing diagrams for the config format)
2. Define nodes, connections, and an async scenario function
3. Add a link to `index.html`
