# Cadans — Solution Build Plan

What to build next, in what order, and why. Scope is the offering that is **not**
yet client-ready: GEO, Support, Collect, Automation, Voice, Books.

Out of scope — already deliverable today:
- **WhatsApp PA** (`agents/personal-assistant`, running on NanoClaw)
- **Websites / webapps** (proven by cadans.ai)

---

## 0. The constraint that shapes everything

The margin in this business is not in building solutions. It is in building the
*second* instance of a solution cheaply.

Per `BUSINESS-STRATEGY.md`, COGS is €28-52/client/month against €250-500 revenue —
84-90% gross margin. That number only survives if delivery time collapses after the
first client. A solution that takes five days to install every time is a job. The
same solution installed in four hours is a product.

`docs/client-intake-guide.md` is proof this works: it turns a PA install into a
scripted 60-minute call with a fixed post-call checklist. Every solution below needs
its own equivalent, and §2 makes producing one a non-optional part of building.

---

## 1. Sequencing

Ranked by return per unit of build effort, not by revenue alone.

| # | Solution | Demand | Build effort | Revenue | Verdict |
|---|---|---|---|---|---|
| 1 | **GEO** | Very high | **Low** | €1.5-4k + €300-800/mo | Fastest to cash |
| 2 | **Support** | High | **Low** | +€300-800/mo | Best margin per hour |
| 3 | **Collect** | High | Medium | +€150-300/mo | Best demo-to-close |
| 4 | **Automation** | High | Medium-high | Project + retainer | Needs scope discipline |
| 5 | **Voice** | High | **High** | €5-10k + €500-1k/mo | Highest ticket, hardest |
| 6 | **Books** | Medium | High | +€200-500/mo | Defer — liability |

### Why GEO first

It is the only item on the list that is **mostly not software**. A GEO engagement is
an audit, a set of schema/content changes, and a monitoring loop. That means revenue
in weeks rather than months, and the build cost is writing a repeatable process plus
one small tracking tool.

It also already has demand infrastructure: `/geo` and `/bureaus` exist on the live
site. `/bureaus` matters more than it looks — it targets *agencies*, which is a
reseller channel. One agency relationship can carry ten end clients without ten sales
cycles.

Risk: low barrier to entry means competition. The defence is verifiable measurement
(§3.1), not being first.

### Why Support second

It runs on infrastructure that already exists. The PA is deployed per client on
NanoClaw; Support is another agent against the same runtime, the same WhatsApp
channel, the same deployment path. Marginal infrastructure work is close to zero, and
`agents/support/` already has `skills/faq_automation.md` and four templates.

It is also the **highest vertical upsell** (€300-800/mo) sold to clients who already
trust you. No acquisition cost. That combination — highest price, lowest build,
warmest audience — is why it beats Collect despite Collect having the better demo.

### Why Voice fifth despite the highest ticket

Voice is the only item here that can fail *publicly and audibly*. Dutch STT quality,
sub-800ms round-trip latency, barge-in handling, and graceful failure when the model
is unsure are genuine engineering problems, not prompt engineering. A PA that
mishandles an email is a private annoyance; a voice agent that mishandles a booking
call loses a restaurant a covered table and gets discussed.

Build it when there is margin to absorb the iteration — and evaluate buying the
telephony/STT layer rather than building it (§3.5).

### Why Books last

Bookkeeping errors create **client liability**, not just dissatisfaction. A
misclassified BTW entry is a tax problem with your name on it. It also needs the
deepest integrations (Exact Online, Moneybird) and the strictest audit trail. High
effort, high risk, mid revenue — it is last on every axis that matters.

---

## 2. The delivery-playbook skill

**Problem it solves:** the knowledge that makes the second install cheap — which
questions to ask, which values to collect, which integration steps have a gotcha,
what to test before handover — exists only during the first build, and evaporates
within days of finishing.

**Design:** a Claude skill invoked at the *start* of building any new solution, which
runs as a companion to development and captures the playbook at defined checkpoints,
while decisions are fresh. Not a documentation pass afterwards — that's the thing
that never happens.

### Output contract

Each solution build must produce `agents/<solution>/WORKFLOW.md`, modelled on
`docs/client-intake-guide.md`:

| Section | Content | Captured when |
|---|---|---|
| 1. Qualify | Who this is for, and the disqualifiers | Before building |
| 2. Discovery | The exact questions, in call order, with time budget | While defining scope |
| 3. Config values | Every per-client value, as a `client.env.example` block | While parameterising |
| 4. Integration steps | Auth/API setup, click by click, with screenshots where a UI moves | While first wiring it |
| 5. Customisation | Which skills/templates change per client, which never do | While templating |
| 6. Test script | What to verify before handover, with expected output | Before first handover |
| 7. Failure modes | What broke during the build and how it was diagnosed | Continuously |
| 8. Handover | What the client is told, and what they must never be promised | At handover |

Section 7 is the one that pays for the skill. Every hour lost to a non-obvious
failure during build one is an hour saved on every install afterwards — but only if
it is written down at the moment of frustration.

### Why a skill rather than a template

A template is a file you must remember to fill in. A skill is invoked, has a
checklist, and can refuse to call a build finished while sections are empty. The
enforcement is the point.

### Acceptance test

The skill works if a competent person who did **not** build the solution can install
it for a new client using only `WORKFLOW.md`. Until that has been demonstrated once,
assume the playbook is incomplete.

---

## 3. Per-solution plans

### 3.1 GEO — Generative Engine Optimization

**Sell:** audit €1,500-4,000, then €300-800/mo monitoring.

**Phase 1 — Define the measurable claim.**
GEO's central credibility problem is that "findable in ChatGPT" is unfalsifiable
unless you measure it. Fix that first: a fixed prompt set per client (20-40 buying-
intent queries in Dutch), run against ChatGPT/Gemini/Google AI overviews on a
schedule, recording whether the client is named, ranked, and cited. That baseline is
the product. Without it you are selling vibes and cannot prove renewal value.

**Phase 2 — The audit process.** Schema.org coverage, crawlability for AI agents,
entity consistency (NAP, KvK, sector terms), content gaps against the prompt set,
competitor citation analysis. Output: a fixed-format report.

**Phase 3 — The remediation playbook.** Structured-data templates per sector,
content briefs, and the changes most likely to move citation rate.

**Phase 4 — Monitoring loop.** Scheduled re-runs, month-over-month delta, a client
dashboard. This is what justifies the recurring fee.

**Build effort:** 2-3 weeks. Mostly process and one tracking tool.
**Key risk:** LLM outputs are non-deterministic — a single query proves nothing. Run
each prompt N times and report rates, not anecdotes.

### 3.2 Support — WhatsApp customer service

**Sell:** +€300-800/mo, upsold to existing PA clients.

**Phase 1 — Harden the existing scaffold.** `agents/support/skills/faq_automation.md`
and the four templates exist. Turn them into a working agent against NanoClaw with a
real FAQ ingestion path (client's site + uploaded docs).

**Phase 2 — Escalation discipline.** The single highest-risk behaviour is confidently
answering something it should have escalated. Define refusal boundaries explicitly,
and make "I'll get a colleague to answer that" the cheap default. `agents/support/
templates/escalation_frustration.txt` already anticipates this.

**Phase 3 — Multi-tenant separation.** Support agents handle end-customer data, not
just the owner's. Verify tenant isolation in `platform/src/tenant-manager.ts` before
the first live deployment — a cross-client leak here is a GDPR incident, not a bug.

**Phase 4 — Handover metrics.** Deflection rate, escalation rate, response time. The
renewal conversation needs numbers.

**Build effort:** 2 weeks.
**Key risk:** GDPR. This processes *the client's customers'* personal data, making
Cadans a sub-processor. Needs a DPA with each client and a retention policy per
tenant before the first deployment.

### 3.3 Collect — invoice chasing

**Sell:** +€150-300/mo.

**Phase 1 — Accounting integration.** Exact Online and Moneybird cover most of the
Dutch MKB market. This is the actual work; the escalation logic is already designed
in `agents/collect/skills/reminder_workflow.md` (5-stage, Day 15/22/30/36/46, with
wettelijke rente and the €40 admin fee after the second reminder).

**Phase 2 — Human-in-the-loop gate.** The existing design puts a human checkpoint at
Day 36 before legal-toned language. Keep it. An agent that autonomously escalates to
legal threats against a client's best customer is an unrecoverable failure.

**Phase 3 — The demo.** Read-only connection to a prospect's accounting system,
showing real overdue totals and what recovery would look like. This is the strongest
sales asset in the entire portfolio — a specific euro figure the prospect recognises.

**Build effort:** 3-4 weeks, dominated by integration and OAuth review processes.
**Key risk:** tone. Dutch business culture is direct but relationship-preserving; an
over-aggressive reminder costs the client a customer and you the contract.

### 3.4 Automation — workflow flows

**Sell:** project fee + retainer.

The danger is that "workflow automation" is infinitely broad and every engagement
becomes bespoke — which destroys the margin model in §0.

**Phase 1 — Productise into 3-4 fixed packs**, e.g. quote-to-invoice, lead intake and
routing, document processing, recurring reporting. Fixed scope, fixed price, fixed
playbook. Anything outside a pack is quoted as custom consulting at a different rate.

**Phase 2 — Build the two most-requested packs only.** Do not build speculatively.

**Phase 3 — A reusable connector layer** so pack three is faster than pack two.

**Build effort:** 2 weeks per pack after the first.
**Key risk:** scope creep. If the first three sales are all "can you also just…",
the productisation failed and it needs re-scoping before continuing.

### 3.5 Voice — reservations and inbound

**Sell:** €5,000-10,000 setup, €500-1,000/mo.

**Phase 0 — Buy-versus-build decision, before any code.** Evaluate existing Dutch
voice platforms against building on Twilio/Voys plus an STT/TTS stack. If a platform
gets to 80% quality at 20% of the effort, integrate it and compete on the agent logic
and vertical fit rather than the telephony.

**Phase 1 — One vertical only.** Restaurant reservations, or clinic appointments —
not both. Narrow scope makes the failure modes enumerable.

**Phase 2 — Latency and failure budget.** Target sub-800ms round trip. Define what
happens on low confidence: transfer to a human, take a callback number, never guess.

**Phase 3 — Pilot with a friendly client** at a discount, in exchange for tolerance
of failure and honest feedback.

**Build effort:** 6-10 weeks. Genuinely hard.
**Key risk:** quality expectations set by consumer assistants. Sounding almost-human
but failing is worse than sounding obviously automated and working.

### 3.6 Books — bookkeeping

**Deferred.** Revisit once Collect has shipped and the accounting integrations built
there can be reused. The integration work overlaps substantially, which is the main
argument for this ordering — Collect pays for the plumbing Books would need.

**Precondition for starting:** a defined liability position. Who is responsible when
a BTW classification is wrong? Until that is answered in writing, do not sell it.

---

## 4. Cross-cutting work

| Item | Why | When |
|---|---|---|
| Multi-tenant isolation audit | Support and Books process third-party personal data | Before Support ships |
| DPA template for clients | You become a sub-processor the moment you touch customer data | Before Support ships |
| Per-solution retention policies | GDPR; mirrors the 12-month intake purge already live | With each solution |
| Rate limiting on public endpoints | The intake form currently bypasses Cloudflare | Before marketing push |
| KvK registration | Required once taking paid work; blocks the privacy-policy TODOs | Before Reddit launch |

---

## 5. Suggested order of execution

1. **Author the playbook skill** — one day, and it changes how everything after it is built
2. **GEO** — 2-3 weeks to first invoiceable engagement
3. **Support** — 2 weeks, sold into the existing PA base
4. **Collect** — 3-4 weeks, builds accounting integrations
5. **Automation** — 2 packs, scoped tightly
6. **Voice** — after a buy-vs-build decision
7. **Books** — reusing Collect's integrations, once liability is settled

The first two items produce revenue inside a month without touching the hard
engineering. That funds the rest.

---

## 6. Open questions

- Is there an existing GEO client or pilot, or is this cold?
- Which accounting package do current PA clients actually use? That decides whether
  Exact or Moneybird is built first.
- Is `platform/src/tenant-manager.ts` production-grade, or scaffolding? Support
  cannot ship until that is known.
- Does the `/bureaus` agency channel have any traction yet? If so, GEO should be
  packaged for resale rather than direct delivery.
