# /ship-artifact

**Command**: `/ship-artifact`
**Category**: Development & Deployment
**Purpose**: Produce concrete artifacts with PR/commit evidence and structured logging
**Wave-enabled**: false
**Performance-profile**: optimization

## Description

Create and deliver tangible artifacts (code, documents, designs, tools) with proper versioning, evidence logging, and deployment coordination. Ensures every deliverable is concrete, measurable, and properly documented.

## Artifact Categories

### Code Artifacts
- **Features**: New functionality with tests and documentation
- **Components**: Reusable UI/logic components with examples
- **APIs**: Endpoints with OpenAPI specs and integration tests
- **Tools**: CLI tools, scripts, utilities with usage documentation

### Business Artifacts
- **Pricing Matrices**: Competitive analysis with recommendations
- **Compare Pages**: Feature comparison with clear differentiation
- **Outreach Kits**: Email templates, pitch decks, sales materials
- **Landing Pages**: Conversion-optimized pages with A/B test setup

### Documentation Artifacts
- **Technical Specs**: Architecture decisions with implementation guidance
- **User Guides**: Step-by-step instructions with screenshots
- **API Documentation**: Complete reference with code examples
- **Runbooks**: Operational procedures with troubleshooting steps

### Design Artifacts
- **UI Components**: Design system components with usage guidelines
- **Mockups**: High-fidelity designs with interaction specifications
- **Brand Assets**: Logos, color schemes, typography with style guides
- **User Flows**: Journey maps with conversion optimization

## Delivery Process

### Phase 1: Planning (10%)
- **Requirements**: Clear specification with acceptance criteria
- **Scope**: Deliverable boundaries and success metrics
- **Timeline**: Realistic estimates with milestone checkpoints
- **Dependencies**: External requirements and approval gates

### Phase 2: Creation (70%)
- **Implementation**: Build artifact according to specifications
- **Quality Gates**: Testing, review, and validation checkpoints
- **Documentation**: Usage instructions and technical details
- **Integration**: Ensure compatibility with existing systems

### Phase 3: Delivery (20%)
- **Version Control**: Proper branching and commit messages
- **Deployment**: Staging and production deployment coordination
- **Evidence**: Proof of delivery with verification steps
- **Handoff**: Knowledge transfer and maintenance documentation

## Quality Standards

### Code Quality
- **Testing**: Unit tests (≥80% coverage), integration tests, E2E validation
- **Documentation**: README, API docs, inline comments for complex logic
- **Performance**: Load time <3s, bundle size optimization, accessibility compliance
- **Security**: Dependency scanning, secret management, input validation

### Business Quality
- **Data-Driven**: Metrics and analytics for all business artifacts
- **User-Tested**: Validation with target audience before release
- **Conversion-Optimized**: A/B testing framework and optimization strategy
- **Brand-Consistent**: Aligned with company voice, tone, and visual identity

### Documentation Quality
- **Completeness**: All necessary information for successful usage
- **Accuracy**: Up-to-date with current implementation and processes
- **Usability**: Clear structure, searchable, accessible to target audience
- **Maintenance**: Ownership and update procedures clearly defined

## Evidence Requirements

### Technical Evidence
- **Pull Request**: Code review, CI/CD pipeline success, merge confirmation
- **Deployment**: Production URL, staging environment, health checks
- **Testing**: Test results, coverage reports, performance benchmarks
- **Monitoring**: Error rates, performance metrics, user analytics

### Business Evidence
- **Usage Metrics**: Page views, conversion rates, user engagement
- **Feedback**: User testing results, stakeholder approval, peer review
- **Impact Assessment**: Business metrics improvement, goal achievement
- **Documentation**: Usage instructions, maintenance procedures, ownership

### Version Control
- **Branch Strategy**: Feature branches, pull request workflow, semantic versioning
- **Commit Messages**: Conventional commits with clear descriptions
- **Release Notes**: Change summaries with migration instructions
- **Rollback Plan**: Reversal procedures and dependency management

## Artifact Templates

### Feature Delivery
```markdown
# Feature: [Name]
**Type**: Code Artifact
**Owner**: Claude
**Status**: ✅ Shipped

## Deliverables
- [ ] Feature implementation with tests
- [ ] API documentation with examples  
- [ ] User interface with accessibility compliance
- [ ] Integration tests and E2E validation

## Evidence
- **PR**: #123 (merged)
- **Deployment**: https://staging.mmtu.com/feature-name
- **Tests**: 95% coverage, all passing
- **Docs**: /docs/features/feature-name.md

## Success Metrics
- **Performance**: <100ms response time
- **Quality**: Zero critical bugs in first week
- **Adoption**: 10+ users within 48 hours
```

### Business Asset
```markdown
# Asset: [Name]
**Type**: Business Artifact  
**Owner**: ChatGPT-5/Claude
**Status**: ✅ Delivered

## Deliverables
- [ ] Primary asset (pricing matrix, compare page, etc.)
- [ ] Supporting materials (templates, guidelines)
- [ ] Usage documentation and examples
- [ ] Analytics and tracking setup

## Evidence  
- **File**: /assets/business/asset-name/
- **Live URL**: https://www.mmtu.com/asset-path
- **Analytics**: Google Analytics events configured
- **Review**: Stakeholder approval documented

## Success Metrics
- **Engagement**: >5 min average time on page
- **Conversion**: >3% visitor-to-lead conversion
- **Quality**: >4.5/5 stakeholder rating
```

## Integration Points

### Development Workflow
- **Git Integration**: Automated PR creation and merge workflows
- **CI/CD Pipeline**: Automated testing, building, and deployment
- **Code Review**: Peer review requirements and approval gates
- **Release Management**: Semantic versioning and changelog generation

### Business Workflow  
- **Approval Process**: Stakeholder review and sign-off procedures
- **Brand Compliance**: Style guide and brand standard validation
- **Legal Review**: Terms of service, privacy policy, compliance checks
- **Marketing Coordination**: Launch timing and promotional material alignment

### Operations Workflow
- **Monitoring Setup**: Error tracking, performance monitoring, user analytics
- **Documentation**: Knowledge base updates and maintenance procedures
- **Support Preparation**: FAQ updates, troubleshooting guides, escalation procedures
- **Backup Procedures**: Data backup, rollback plans, disaster recovery

## Usage

```bash
/ship-artifact [type] [name] [scope]
```

Examples:
```bash
/ship-artifact "feature" "user-dashboard" "full"
/ship-artifact "business" "pricing-matrix" "competitive-analysis"  
/ship-artifact "docs" "api-reference" "complete"
/ship-artifact "design" "component-library" "core-components"
```

Produces concrete, measurable artifacts with proper evidence, version control, and quality validation for reliable delivery and maintenance.