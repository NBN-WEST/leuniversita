---
id: RISK-REG
title: Risk Register
owner: PM
status: active
created_at: 2025-12-18
updated_at: 2025-12-20
tags: [risks, management]
related: []
source_of_truth: true
mermaid: required
---

# Risks Register

### Visual Risk Matrix
```mermaid
quadrantChart
    title Risk Assessment
    x-axis Low Impact --> High Impact
    y-axis Low Likelihood --> High Likelihood
    quadrant-1 Monitor
    quadrant-2 Mitigate
    quadrant-3 Accept
    quadrant-4 Avoid
    "Hallucination": [0.8, 0.6]
    "API Costs": [0.6, 0.8]
    "Staleness": [0.7, 0.5]
    "Vendor Lock-in": [0.3, 0.8]
```


| ID | Description | Likelihood | Impact | Mitigation | Status |
| ID | Description | Likelihood | Impact | Mitigation | Status |
|----|-------------|------------|--------|------------|--------|
| R-001 | **Model Hallucination**: The AI might provide incorrect answers not supported by the documents. | Medium | High | Strict prompting ("answer only from context"), citation verification, and low temperature settings. | Active |
| R-002 | **API & Token Costs**: OpenAI usage for ingestion and chat might exceed budget. | High | Medium | Implement caching, usage tracking, and rate limiting in Edge Functions. | Monitored |
| R-003 | **Data Staleness**: University regulations change, rendering the KB obsolete. | Medium | High | Automated ingestion pipelines and versioning of source documents. | Planned |
| R-004 | **Vendor Lock-in**: Heavy reliance on Supabase proprietary features (Edge Functions, Auth). | High | Low | Acceptable trade-off for MVP speed. | Accepted |
