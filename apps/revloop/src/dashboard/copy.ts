/**
 * Dashboard UI Copy - Revenue Loop MVP
 * 
 * Professional UX copy for Digital Andon dashboard and incident management
 * Following clear, actionable, and non-alarmist language principles
 */

import { AndonState } from '../types/andon.js';

export const DASHBOARD_COPY = {
  // Page titles and headers
  pageTitle: 'Revenue Loop Monitor',
  subtitle: 'Real-time checkout funnel health monitoring',
  
  // Navigation
  navigation: {
    dashboard: 'Dashboard',
    alerts: 'Active Alerts',
    analytics: 'Funnel Analytics', 
    settings: 'Configuration',
    runbook: 'Incident Response'
  },

  // Status indicators
  status: {
    [AndonState.NORMAL]: {
      label: 'All Systems Normal',
      description: 'Checkout funnel operating within expected parameters',
      actionText: 'Continue monitoring',
      icon: '🟢'
    },
    [AndonState.ATTENTION]: {
      label: 'Attention Required', 
      description: 'Unusual patterns detected - enhanced monitoring active',
      actionText: 'Review funnel performance',
      icon: '🟡'
    },
    [AndonState.STOP]: {
      label: 'Critical Issue Detected',
      description: 'Significant funnel disruption - immediate action required',
      actionText: 'Begin incident response',
      icon: '🔴'
    },
    [AndonState.UNKNOWN]: {
      label: 'Insufficient Data',
      description: 'Gathering baseline metrics for analysis', 
      actionText: 'Allow data collection',
      icon: '⚪'
    }
  },

  // Alert messages
  alerts: {
    titles: {
      new: 'New Alert',
      active: 'Active Alerts',
      resolved: 'Recently Resolved',
      none: 'No Active Alerts'
    },
    actions: {
      acknowledge: 'Acknowledge',
      escalate: 'Escalate',
      resolve: 'Mark Resolved',
      investigate: 'Start Investigation',
      viewDetails: 'View Details'
    },
    states: {
      pending: 'Response Pending',
      acknowledged: 'Acknowledged',
      investigating: 'Under Investigation', 
      resolved: 'Resolved'
    }
  },

  // Funnel stage descriptions
  stages: {
    landing: {
      name: 'Landing Page',
      description: 'Initial visitor arrival and engagement',
      healthyRange: '10-20% exit rate',
      criticalThreshold: '>30% exit rate'
    },
    product: {
      name: 'Product Pages',
      description: 'Product discovery and consideration',
      healthyRange: '5-12% exit rate', 
      criticalThreshold: '>20% exit rate'
    },
    cart: {
      name: 'Shopping Cart',
      description: 'Cart review and modification',
      healthyRange: '8-15% exit rate',
      criticalThreshold: '>25% exit rate'
    },
    checkout: {
      name: 'Checkout Process',
      description: 'Customer information and shipping',
      healthyRange: '3-8% exit rate',
      criticalThreshold: '>15% exit rate'
    },
    payment: {
      name: 'Payment Processing',
      description: 'Payment method and transaction completion',
      healthyRange: '1-4% failure rate',
      criticalThreshold: '>8% failure rate'
    }
  },

  // Incident response
  incidents: {
    priorities: {
      p1: {
        label: 'P1 - Critical',
        description: 'Revenue-impacting outage requiring immediate response',
        sla: 'Response: 15 minutes, Resolution: 1 hour',
        color: '#dc2626'
      },
      p2: {
        label: 'P2 - High',
        description: 'Significant performance degradation affecting conversions',
        sla: 'Response: 1 hour, Resolution: 4 hours',
        color: '#ea580c'
      },
      p3: {
        label: 'P3 - Medium',
        description: 'Elevated drop-off rates requiring investigation',
        sla: 'Response: 4 hours, Resolution: 24 hours',  
        color: '#ca8a04'
      },
      p4: {
        label: 'P4 - Low',
        description: 'Minor anomalies for analysis and optimization',
        sla: 'Response: 24 hours, Resolution: 1 week',
        color: '#16a34a'
      }
    },
    
    actionLabels: {
      assess: 'Assess Impact',
      isolate: 'Isolate Root Cause',
      mitigate: 'Apply Mitigation',
      communicate: 'Update Stakeholders',
      resolve: 'Confirm Resolution',
      postmortem: 'Schedule Postmortem'
    }
  },

  // Analytics and metrics  
  metrics: {
    conversionRate: {
      name: 'Conversion Rate',
      description: 'Percentage of visitors completing purchase',
      format: 'percentage'
    },
    averageOrderValue: {
      name: 'Average Order Value', 
      description: 'Mean purchase amount per transaction',
      format: 'currency'
    },
    dropoffRate: {
      name: 'Drop-off Rate',
      description: 'Percentage abandoning at each funnel stage',
      format: 'percentage'
    },
    revenueImpact: {
      name: 'Revenue Impact',
      description: 'Estimated revenue loss from anomalies',
      format: 'currency'
    },
    responseTime: {
      name: 'Page Response Time',
      description: 'Average page load time affecting user experience',
      format: 'duration'
    }
  },

  // Help and guidance
  help: {
    gettingStarted: {
      title: 'Getting Started',
      steps: [
        'Monitor the overall system status indicator',
        'Review active alerts requiring attention',
        'Investigate any critical anomalies immediately',
        'Follow incident response procedures for P1/P2 issues',
        'Analyze trends in funnel analytics for optimization'
      ]
    },
    
    interpretingAlerts: {
      title: 'Understanding Alerts',
      guidelines: [
        'Green: Normal operations within statistical control limits',
        'Yellow: Attention required - elevated but manageable anomalies', 
        'Red: Critical issues requiring immediate intervention',
        'Alerts use statistical process control (3-sigma methodology)',
        'Historical baselines adapt automatically to normal variations'
      ]
    },

    bestPractices: {
      title: 'Monitoring Best Practices',
      recommendations: [
        'Acknowledge alerts promptly to prevent escalation',
        'Document all incident response actions for learning',
        'Review resolved incidents for process improvements',
        'Maintain accurate stakeholder contact information',
        'Conduct regular monitoring system health checks'
      ]
    }
  },

  // Error states and empty states
  emptyStates: {
    noAlerts: {
      title: 'All Clear',
      message: 'No active alerts. Checkout funnel operating normally.',
      action: 'View analytics for optimization opportunities'
    },
    noData: {
      title: 'Collecting Data',
      message: 'Gathering baseline metrics. Check back in a few minutes.',
      action: 'Review system configuration'
    },
    loadingError: {
      title: 'Loading Error',
      message: 'Unable to load monitoring data. Please refresh or contact support.',
      action: 'Refresh Dashboard'
    }
  },

  // Button and action labels
  actions: {
    // Primary actions
    acknowledge: 'Acknowledge',
    escalate: 'Escalate',
    resolve: 'Resolve',
    investigate: 'Investigate',
    
    // Secondary actions  
    viewDetails: 'View Details',
    exportData: 'Export Data',
    shareReport: 'Share Report',
    refreshData: 'Refresh',
    
    // Navigation actions
    backToDashboard: 'Back to Dashboard',
    viewAllAlerts: 'View All Alerts',
    openRunbook: 'Open Runbook',
    
    // Configuration actions
    updateSettings: 'Update Settings',
    testAlert: 'Test Alert System',
    viewLogs: 'View System Logs'
  },

  // Time formatting
  timeFormats: {
    lastUpdated: 'Last updated: {time}',
    alertAge: 'Alert active for {duration}',
    nextUpdate: 'Next update in {time}',
    incidentDuration: 'Incident duration: {duration}'
  },

  // Accessibility labels
  a11y: {
    statusIndicator: 'System status: {status}',
    alertCount: '{count} active alerts requiring attention',
    stageHealth: '{stage} health: {status}',
    metricValue: '{metric}: {value}',
    actionButton: 'Action: {action}',
    navigationLink: 'Navigate to {page}'
  }
};

/**
 * Dynamic copy generation functions
 */
export const generateAlertCopy = (stage: string, severity: AndonState, metrics?: any) => {
  const stageInfo = DASHBOARD_COPY.stages[stage as keyof typeof DASHBOARD_COPY.stages];
  const statusInfo = DASHBOARD_COPY.status[severity];
  
  return {
    title: `${stageInfo?.name || stage} ${statusInfo.label}`,
    description: statusInfo.description,
    recommendation: getRecommendationForSeverity(severity),
    stageContext: stageInfo?.description || 'Funnel stage monitoring'
  };
};

export const generateIncidentCopy = (priority: string, stage: string) => {
  const priorityInfo = DASHBOARD_COPY.incidents.priorities[priority as keyof typeof DASHBOARD_COPY.incidents.priorities];
  const stageInfo = DASHBOARD_COPY.stages[stage as keyof typeof DASHBOARD_COPY.stages];
  
  return {
    title: `${priorityInfo?.label} - ${stageInfo?.name || stage} Issue`,
    urgency: priorityInfo?.sla || 'Standard response procedures',
    impact: `Affecting ${stageInfo?.description || 'customer experience'}`
  };
};

function getRecommendationForSeverity(severity: AndonState): string {
  switch (severity) {
    case AndonState.NORMAL:
      return 'Continue standard monitoring procedures';
    case AndonState.ATTENTION:
      return 'Review recent changes and monitor for escalation';
    case AndonState.STOP:
      return 'Initiate immediate incident response protocol';
    default:
      return 'Gather additional data for analysis';
  }
}