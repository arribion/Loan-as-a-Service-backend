# LAAS

## Configured dual-push destinations

```bash
origin  https://github.com/arribion/Loan-as-a-Service.git (fetch)
origin  https://github.com/arribion/Loan-as-a-Service.git (push)
origin  https://github.com/Host-Devs/LAAS.git (push)
```


Host Pro Limited is commissioning the design, architecture, and implementation of a highly scalable, multitenant Loan-as-a-Service (LaaS) platform

**Comprehensive technical architecture** for the Host Pro Limited **Enterprise Loan‑as‑a‑Service (LaaS) Platform**.

---

## Technical Architecture

### 1. **System Overview**

- **Core Goal:** Provide a **multi‑tenant, tier‑enforced loan lifecycle platform** for microfinance, SACCOs, and institutional lenders.
- **Interfaces:**
  - **Backend API Service** — centralized, high‑throughput, stateless microservices.
  - **Admin Dashboard (Web)** — this is for providers, loan officers, and compliance staff.
  - **Borrower Mobile Client** — lightweight, native‑feeling app for loan applications, repayments, and notifications.

---

### 2. **Architecture Layers**

|Layer|Components|Key Responsibilities|
|-------|------------|----------------------|
| **Presentation Layer** | Web Dashboard (React), Mobile Client | User interfaces, role‑based access, responsive design |
| **Application Layer** | API Gateway, Authentication Service, Loan Lifecycle Service | Business logic, tenant enforcement, loan origination, repayment scheduling |
| **Integration Layer** | HostPay API (C2B/B2C), SMS/Email Notification Service, External Credit Scoring APIs | Payment flows, communication triggers, external data enrichment |
| **Data Layer** | PostgreSQL (multi‑schema tenancy), Redis (queues), Object Storage (S3/Blob) | Persistent storage, caching, async processing, document storage |
| **Infrastructure Layer** | Kubernetes Cluster, Service Mesh (Istio/Linkerd), CI/CD Pipelines | Scalability, isolation, deployment automation, monitoring |

---

### 3. **Multi‑Tenant Subscription Enforcement**

- **Tenant Registry Service**: Tracks tier, limits, and usage.
- **Middleware Enforcement**: Every API call checks tenant tier before execution.
- **403 Forbidden Rule**: If limits exceeded, return structured JSON error payload.

Example:

```json
{
  "error": "Tier Limit Exceeded",
  "details": "Your current package allows max 2,500 active loans. Upgrade required."
}
```

---

### 4. **Loan Lifecycle Modules**

1. **Customer Onboarding**
   - KYC data capture, encrypted storage (AES‑256).
   - National ID validation via external APIs.
2. **Loan Origination**
   - Flat interest (Tier 1), reducing balance (Tier 2), restructuring models (Tier 3).
   - Rule‑based eligibility scoring.
3. **Repayment Scheduling**
   - Automated repayment schedules with penalties → interest → principal hierarchy.
   - Reminder queues (SMS/Email).
4. **Transactions**
   - Double‑entry ledger system.
   - HostPay webhook listener for C2B/B2C flows.
5. **Analytics & Reporting**
   - Portfolio health metrics (PAR, NPL).
   - Export to CSV/Excel.
   - Real‑time dashboards.

---

### 5. **Tiered Package Enforcement**

- **Tier 1 (Lite)**: Shared infra, manual underwriting, basic STK push.
- **Tier 2 (Growth)**: Logical schema isolation, automated payouts, reducing balance.
- **Tier 3 (Enterprise)**: Dedicated infra, advanced restructuring, multi‑wallet routing.

---

### 6. **Security & Compliance**

- **Data Protection**: Align with Kenya Data Protection Act.
- **Access Control**: JWT + RBAC.
- **Audit Logging**: Immutable logs for compliance.
- **Rate Limiting**: Prevent abuse across tenants.

---

### 7. **Scalability & Deployment**

- **Microservices**: Each module independently deployable.
- **Kubernetes**: Horizontal scaling per tenant tier.
- **CI/CD**: Automated testing, staging, and production pipelines.
- **Monitoring**: Prometheus + Grafana dashboards.

---

### 8. **Developer Workflow (Attachés & Interns)**

- **Week 1–2**: Environment setup, tenant registry, auth.
- **Week 3–5**: Loan lifecycle + HostPay integration.
- **Week 6–7**: Notifications + analytics.
- **Week 8–10**: Security hardening, QA, deployment.

---

## Key Design Principles

- **Tenant Isolation**: Logical schemas for Growth, physical infra for Enterprise.
- **API‑First**: Backend services exposed via REST/GraphQL.
- **Event‑Driven**: Async queues for payments, reminders, notifications.
- **Resilience**: Circuit breakers, retries, idempotency checks.

---

# frontend laas

- postman test

- LITE PLAN USER SAMPLE

```bash
{
  "businessName": "Tumaini SACCO",
  "fullName": "Jane Muthoni",
  "email": "admin@tumaini.co.ke",
  "phone": "0712345678",
  "password": "SecurePass123!",
  "plan": "lite"
}
```

- GROWTH PLAN

```bash
{
  "businessName": "PesaTech FinTech",
  "fullName": "Peter Ochieng",
  "email": "peter@pesatech.com",
  "phone": "0722334455",
  "password": "Growth@2026",
  "plan": "growth"
}
```

- ENTERPRISE

```bash
{
  "businessName": "Equity Microfinance Bank",
  "fullName": "Grace Wanjiru",
  "email": "grace@equitymicro.com",
  "phone": "0733445566",
  "password": "Enterprise#Secure",
  "plan": "enterprise"
}
```

## sample loan products

```bash
[
  {
    "reference_title": "School Fee Loan",
    "interest_calculation_type": "flat",
    "base_percentage": "12.5000",
    "fine_rules": {},
    "min_loan_amount": "500.00",
    "max_loan_amount": "25000.00",
    "max_term_days": 180
  },
  {
    "reference_title": "Business Expansion Loan",
    "interest_calculation_type": "reducing_balance",
    "base_percentage": "9.7500",
    "fine_rules": {
      "grace_days": 5,
      "daily_penalty_rate": 0.015
    },
    "min_loan_amount": "5000.00",
    "max_loan_amount": "100000.00",
    "max_term_days": 365
  },
  {
    "reference_title": "Home Improvement Loan",
    "interest_calculation_type": "flat",
    "base_percentage": "11.2500",
    "fine_rules": {
      "grace_days": 3,
      "daily_penalty_rate": 0.02,
      "max_penalty_cap": 500.00
    },
    "min_loan_amount": "2000.00",
    "max_loan_amount": "75000.00",
    "max_term_days": 240
  },
  {
    "reference_title": "Car Loan",
    "interest_calculation_type": "reducing_balance",
    "base_percentage": "8.5000",
    "fine_rules": {},
    "min_loan_amount": "10000.00",
    "max_loan_amount": "500000.00",
    "max_term_days": 720
  },
  {
    "reference_title": "Personal Loan",
    "interest_calculation_type": "compound",
    "base_percentage": "10.0000",
    "fine_rules": {
      "grace_days": 7,
      "daily_penalty_rate": 0.01
    },
    "min_loan_amount": "1000.00",
    "max_loan_amount": "30000.00",
    "max_term_days": 120
  },
  {
    "reference_title": "Emergency Loan",
    "interest_calculation_type": "flat",
    "base_percentage": "15.0000",
    "fine_rules": {},
    "min_loan_amount": "200.00",
    "max_loan_amount": "5000.00",
    "max_term_days": 90
  }
]
```
