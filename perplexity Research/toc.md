# Theory of Constraints (TOC) Implementation Checklist

## Purpose
Maximize system throughput by focusing improvement efforts on the current constraint using the Five Focusing Steps, with Drum-Buffer-Rope scheduling to synchronize flow.

## Inputs
- Process flow maps with capacity data
- Throughput, inventory, and operating expense metrics
- Work-in-process levels and queue sizes  
- Resource utilization and cycle time measurements
- Customer demand patterns and delivery requirements

## Outputs
- Current constraint identification and analysis
- Exploitation plan maximizing constraint utilization
- Subordination rules for non-constraint resources
- Elevation investments prioritized by throughput ROI
- POOGI (Process of Ongoing Improvement) schedule

## Automation Primitives
1. **Constraint Detection**: Analytics to identify system bottleneck through throughput analysis  
2. **Exploitation Scheduler**: Prioritize constraint work and minimize setups/changeovers
3. **Subordination Rules Engine**: Align non-constraint pace to constraint rhythm
4. **Elevation Planner**: Simulate ROI of capacity investments  
5. **POOGI Cadence**: Recurring constraint re-evaluation and improvement cycles

## Implementation Risks
- **Constraint Shift Blindness**: Continuing to focus on old constraint after it moves
- **Local Optimization**: Improving non-constraints while ignoring system bottleneck
- **Policy Constraints**: Missing organizational rules that limit throughput more than equipment
- **Elevation Without Exploitation**: Adding capacity before maximizing current constraint
- **Subordination Resistance**: Departments refusing to align with constraint needs

## First 3 Implementation Steps

### Step 1: Identify and Analyze Current Constraint (Five Focusing Steps #1)
- Map process flow with capacity and cycle time data for each resource
- Analyze throughput data to identify bottleneck (lowest capacity resource)
- Observe work-in-process accumulation and expediting activity patterns
- Validate constraint through operator interviews and demand vs capacity analysis

### Step 2: Exploit the Constraint (Five Focusing Steps #2)  
- Maximize constraint uptime (minimize breaks, changeovers, quality issues)
- Implement buffer management to ensure constraint never starves
- Prioritize constraint work by customer value or due date
- Implement preventive maintenance schedule during non-production hours

### Step 3: Subordinate Everything to Constraint (Five Focusing Steps #3)
- Implement Drum-Buffer-Rope system pacing all resources to constraint rhythm  
- Set upstream resources to produce only what constraint can consume
- Ensure downstream resources have capacity to handle constraint output
- Establish constraint-based priority system for all resource scheduling