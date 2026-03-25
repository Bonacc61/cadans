# Cadans

**AI agents that keep your business in rhythm.**

A consultancy business that deploys personal AI assistants to Dutch MKB owners via WhatsApp, built on the NanoClaw framework.

## Structure

```
cadans/
├── README.md                    # This file
├── templates/                   # 5-file deployment system (pending)
│   ├── CLAUDE.md.template       # 200+ line persona template
│   ├── client-config.example.yaml
│   ├── deploy.sh                # One-command deployment
│   └── README.md
│
├── clients/                     # Per-client deployments (pending)
│   └── example-client/
│       ├── config/
│       ├── data/
│       └── nanoclaw/            # Git clone per client
│
├── scripts/                     # Business operations (pending)
│   ├── monthly-report.sh
│   ├── cost-dashboard.sh
│   └── deploy-client.sh
│
├── docs/                        # Documentation ✓
│   ├── README.md                # Documentation index
│   └── technical/               # Technical implementation
│       ├── MODEL-ROUTING.md     # Complete reference
│       ├── MODEL-ROUTING-SUMMARY.md  # Executive summary
│       └── DEPLOYMENT-EXAMPLE.md     # Client walkthrough
│
└── brand/                       # Brand identity (pending)
    ├── colors.css
    ├── logo.svg
    └── voice-guidelines.md
```

## Status

**Phase 1: Setup** ✓
- Model routing implemented in NanoClaw
- Cost optimization: 67% savings on simple tasks
- Target margin: 75%+ gross margin

**Phase 2: Templates** (Next)
- Build CLAUDE.md.template (200+ lines)
- Create deploy.sh (one-command deployment)
- Client config YAML structure

## Tech Stack

- **Framework**: [NanoClaw](../NanoClaw) (with model routing)
- **Models**: Claude Haiku 4.5 + Sonnet 4.6
- **Interface**: WhatsApp Business API
- **Infrastructure**: Hetzner VPS (EU-hosted)
- **Compliance**: GDPR-ready, EU AI Act minimal risk

## Business Model

- **TAM**: 350K Dutch SMEs → €86M ARR
- **SAM**: 80K digitally literate MKB owners → €24M ARR
- **SOM Y1**: 40 clients → €120K ARR
- **SOM Y2**: 120 clients → €360K ARR

## Pricing

| Plan | Setup | Monthly | Year 1 Value |
|------|-------|---------|--------------|
| PA Standard | €2,500 | €250 | €5,500 |
| PA Plus | €4,000 | €350 | €8,200 |
| PA Enterprise | €6,000 | €500 | €12,000 |

## Quick Start

```bash
# Deploy first beta client
cd templates
./deploy.sh configs/beta-client.yaml

# Monitor costs
./scripts/monthly-report.sh client-slug

# Test model routing
cd ../NanoClaw/container/agent-runner
npx tsx src/test-model-router.ts
```

## Documentation

- [Documentation Index](docs/README.md) - All Cadans documentation
- [Model Routing](docs/technical/MODEL-ROUTING.md) - Cost optimization system
- [Model Routing Summary](docs/technical/MODEL-ROUTING-SUMMARY.md) - Executive overview
- [Deployment Example](docs/technical/DEPLOYMENT-EXAMPLE.md) - Real client walkthrough
- Sprint Document - `/root/NanoClaw/Documents/cadans-sprint-v5 (1).pdf`

---

**Built with**: [NanoClaw](https://github.com/your-repo/nanoclaw) | **Target Market**: Netherlands → EU
