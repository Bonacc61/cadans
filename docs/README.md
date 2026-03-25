# Cadans Documentation

Documentation for the Cadans AI agent consultancy business.

## Directory Structure

```
docs/
├── README.md                    # This file
├── technical/                   # Technical implementation docs
│   ├── MODEL-ROUTING.md         # Cost optimization system
│   ├── MODEL-ROUTING-SUMMARY.md # Executive summary
│   └── DEPLOYMENT-EXAMPLE.md    # Real client walkthrough
│
├── business/                    # (Coming soon) Business operations
│   ├── discovery-call.md        # Client intake process
│   ├── pricing-calculator.md    # ROI calculations
│   └── monthly-optimization.md  # Client retention process
│
└── brand/                       # (Coming soon) Brand guidelines
    ├── voice-guide.md           # Dutch/English communication style
    └── client-communications.md # Email templates, proposals
```

## Quick Links

### Technical Documentation

- **[Model Routing](technical/MODEL-ROUTING.md)** - Complete reference for the cost optimization system
  - 100% pattern accuracy on Dutch/English messages
  - 67% cost savings on simple tasks
  - Three modes: rules, classifier, hybrid

- **[Model Routing Summary](technical/MODEL-ROUTING-SUMMARY.md)** - Executive overview
  - Performance metrics
  - Business impact
  - Integration guide

- **[Deployment Example](technical/DEPLOYMENT-EXAMPLE.md)** - Real-world client walkthrough
  - Jan de Vries case study
  - Cost tracking examples
  - Margin calculations
  - Monthly optimization workflow

### Implementation Status

| Component | Status | Location |
|-----------|--------|----------|
| Model Router | ✅ Complete | `/root/NanoClaw/container/agent-runner/src/model-router.ts` |
| Test Suite | ✅ Complete | `/root/NanoClaw/container/agent-runner/src/test-model-router.ts` |
| Documentation | ✅ Complete | `docs/technical/MODEL-ROUTING*.md` |
| Deployment Templates | ⏳ Pending | `../templates/` |
| Client Configs | ⏳ Pending | `../clients/` |
| Business Scripts | ⏳ Pending | `../scripts/` |

## Next Steps

1. **Build Deployment System** (Section 12 of sprint doc)
   - Create `CLAUDE.md.template` (200+ lines)
   - Build `deploy.sh` script
   - Create `client-config.example.yaml`

2. **First Beta Client**
   - Run discovery call
   - Deploy using templates
   - Monitor for 30 days
   - Tune patterns based on real usage

3. **Business Operations**
   - Monthly report script
   - Cost dashboard
   - Margin tracking
   - Client retention checklist

## Reference

- **Sprint Document**: `/root/NanoClaw/Documents/cadans-sprint-v5 (1).pdf`
- **Framework**: [NanoClaw](../../NanoClaw/README.md)
- **Tech Stack**: Claude Haiku 4.5 + Sonnet 4.6, WhatsApp Business API, Hetzner VPS

---

Last updated: March 22, 2026
