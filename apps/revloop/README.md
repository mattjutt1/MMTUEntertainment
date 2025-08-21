# Revenue Loop MVP 🎯

**Digital Andon + Double-Entry Posting Rules for Payment/Fulfillment Integrity**

A Toyota Production System (TPS) inspired revenue monitoring system that combines real-time checkout funnel anomaly detection with double-entry bookkeeping validation.

## 🚀 Overview

The Revenue Loop MVP implements two high-leverage primitives for revenue protection:

### 1. Digital Andon (TPS Jidoka)
Real-time checkout funnel monitoring with statistical process control:
- **Normal** (🟢): <2σ from baseline - standard operations
- **Attention** (🟡): 2-3σ deviation - enhanced monitoring  
- **Stop** (🔴): >3σ deviation - immediate intervention required

### 2. Double-Entry Posting Rules  
hledger-inspired validation engine ensuring payment/fulfillment integrity:
- **Core Principle**: Debits must equal credits for every transaction
- **Revenue Recognition**: Proper timing of revenue vs. fulfillment obligations
- **Business Rules**: Payment processing, cross-border, and compliance validation

## 📊 Quick Start

### Run the Demo
```bash
# Install dependencies
pnpm install

# Run the Revenue Loop demonstration
cd apps/revloop
pnpm run demo

# Start the monitoring API server
pnpm run dev
```

### Test Double-Entry Validation
```typescript
import { validateRevenueTransaction, AccountType } from '@mmtu/ledger-core';

const payment = [
  {
    accountCode: '1100', // Cash
    accountType: AccountType.ASSET,
    amount: 149.99,
    description: 'Customer payment received'
  },
  {
    accountCode: '4000', // Revenue  
    accountType: AccountType.REVENUE,
    amount: 149.99,
    description: 'Product sale revenue'
  }
];

const result = await validateRevenueTransaction(payment);
console.log(result.isValid ? '✅ Valid' : '❌ Invalid', result.errors);
```

## 🏗️ Architecture

```
apps/revloop/               # Digital Andon monitoring service
├── src/
│   ├── andon/             # TPS Jidoka implementation
│   │   └── monitor.ts     # Statistical process control engine
│   ├── api/               # REST API for dashboard integration
│   │   └── server.ts      # Express server with monitoring endpoints  
│   ├── types/             # TypeScript definitions
│   │   └── andon.ts       # Andon states, alerts, and configuration
│   ├── simulation/        # Testing and demo utilities
│   │   └── funnel-simulator.ts  # Realistic checkout event generation
│   ├── dashboard/         # UI copy and user experience
│   │   └── copy.ts        # Professional dashboard language
│   └── demo/              # End-to-end demonstration
│       └── revenue-loop-demo.ts  # Complete system showcase
└── docs/
    └── incident-response-runbook.md  # TPS-based response procedures

packages/ledger-core/       # Double-Entry validation engine
├── src/
│   ├── types/             # Core accounting types
│   │   └── posting.ts     # Posting entries, account types, validation results
│   ├── validation/        # Validation engine and business rules
│   │   ├── engine.ts      # hledger-inspired balance validation
│   │   └── revenue-rules.ts  # Revenue Loop specific posting rules
│   └── index.ts           # Public API and quick-start functions
```

## 🎯 Key Features

### Digital Andon Monitoring
- **Statistical Process Control**: 3-sigma control limits for anomaly detection
- **Real-time Alerting**: Immediate notification when thresholds exceeded
- **TPS Response Protocols**: Stop, attention, and normal state workflows
- **Revenue Impact Tracking**: Automated calculation of drop-off costs

### Double-Entry Validation  
- **Balance Validation**: Core principle that debits must equal credits
- **Multi-Currency Support**: Handle foreign exchange and conversion fees
- **Revenue Recognition**: Proper timing of revenue vs. fulfillment obligations
- **Business Rule Engine**: Configurable validation for payment processing scenarios

### Professional Dashboard
- **Clear Status Indicators**: Traffic light system (🟢🟡🔴) for immediate comprehension
- **Actionable Alerts**: Specific recommendations based on anomaly severity
- **Incident Response**: Integrated runbook with escalation procedures
- **Analytics Integration**: Funnel performance metrics and trend analysis

## 📈 Monitoring Thresholds

### Funnel Stage Baselines
| Stage | Healthy Range | Critical Threshold |
|-------|---------------|-------------------|
| Landing | 10-20% exit | >30% exit |
| Product | 5-12% exit | >20% exit |
| Cart | 8-15% exit | >25% exit |
| Checkout | 3-8% exit | >15% exit |  
| Payment | 1-4% failure | >8% failure |

### Alert Response SLAs
| Priority | Threshold | Response Time | Resolution Target |
|----------|-----------|---------------|-------------------|
| P1 Critical | >3σ | 15 minutes | 1 hour |
| P2 High | 2-3σ | 1 hour | 4 hours |
| P3 Normal | <2σ | Standard monitoring | - |

## 🔧 Configuration

### Andon Monitor Settings
```typescript
const config: MonitoringConfig = {
  enabled: true,
  alertThresholds: {
    attention: 2.0,  // 2-sigma for attention alerts
    stop: 3.0        // 3-sigma for critical stops
  },
  sampleConfig: {
    minSampleSize: 10,      // Minimum events for statistical analysis
    lookbackHours: 1,       // Historical data window
    updateIntervalMs: 5000  // Real-time update frequency
  }
};
```

### Double-Entry Rules
```typescript
// Automatic validation with Revenue Loop rules
const validator = createRevenueLoopValidator();
await validator.validatePostings(entries);

// Custom business rules
validator.registerRule({
  id: 'custom-payment-rule',
  name: 'Custom Payment Validation',
  severity: 'error',
  validator: async (entries) => {
    // Custom validation logic
    return { isValid: true, message: '' };
  }
});
```

## 🧪 Testing & Simulation

### Simulation Scenarios
- **Normal Operations**: Baseline performance validation
- **Payment Outage**: Critical anomaly testing (8x failure rate increase)
- **Performance Degradation**: Gradual attention threshold testing
- **Multi-Stage Issues**: Complex cascading failure scenarios

### Run Specific Scenarios
```bash
# Test payment processor outage scenario
npm run simulate:payment-outage

# Test performance degradation scenario  
npm run simulate:slow-loading

# Test multi-stage cascading failures
npm run simulate:multi-stage
```

## 📚 Documentation

- **[Incident Response Runbook](./docs/incident-response-runbook.md)**: Complete TPS-based response procedures
- **[API Documentation](./docs/api.md)**: REST endpoints for dashboard integration
- **[Statistical Methods](./docs/statistics.md)**: SPC methodology and threshold calculations
- **[Integration Guide](./docs/integration.md)**: Connect with existing analytics and monitoring

## 🤝 Integration Points

### Analytics Platforms
- Event tracking for conversion funnel
- User session recording and replay
- Geographic and device segmentation

### Payment Processors
- Real-time transaction status
- Failure reason classification  
- Cross-border fee validation

### Monitoring & Alerting
- Dashboard embedding via REST API
- Slack/email notification integration
- Executive reporting and metrics

### Accounting Systems
- General ledger posting validation
- Revenue recognition automation
- Financial reporting integration

## 📊 Success Metrics

### Anomaly Detection
- **Detection Speed**: <5 minutes for 3σ anomalies
- **False Positive Rate**: <2% for critical alerts
- **Revenue Protection**: 95% of revenue-impacting issues caught

### Operational Excellence
- **Response Time**: 95% of P1 alerts acknowledged within 15 minutes
- **Resolution Time**: 90% of critical issues resolved within 1 hour
- **Process Improvement**: Monthly runbook updates based on learnings

---

## 🚀 Next Steps

1. **Enhanced Analytics**: Deeper integration with user behavior analytics
2. **Machine Learning**: Predictive anomaly detection and seasonal adjustments  
3. **Automated Mitigation**: Self-healing responses for common failure modes
4. **Compliance Integration**: SOX, PCI, and international regulation support

Built with ❤️ using Toyota Production System principles and modern TypeScript.