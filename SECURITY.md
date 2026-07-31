# 🔒 Security Policy & Vulnerability Disclosure

At **SentryForm**, security and data privacy are core architectural requirements. As a behavioral biometrics and risk-scoring platform, we take the confidentiality, integrity, and availability of our engine and telemetry pipelines extremely seriously.

---

## 🛡️ Supported Versions

We actively maintain and issue security updates for the following components:

| Component | Version / Target | Supported |
| :--- | :--- | :--- |
| `apps/api` (FastAPI / ONNX Engine) | `1.x` | ✅ Active |
| `apps/web` (Next.js Application) | `1.x` | ✅ Active |
| Docker & Deployment Manifests | `latest` | ✅ Active |

---

## 🚨 Reporting a Vulnerability

> [!IMPORTANT]
> **Do NOT report security vulnerabilities through public GitHub issues or public discussions.**

If you believe you have discovered a security vulnerability in SentryForm, please disclose it responsibly via GitHub Security Advisories or direct email.

### Preferred Method:
1. Navigate to the **[Security Tab](https://github.com/KrishKamra/sentry-form/security/advisories/new)** of this repository.
2. Click **"Report a vulnerability"**.
3. Fill out the report form with step-by-step reproduction details, proof-of-concept payload, and impact assessment.

### Alternative Method:
* **Email:** Send details directly to `krishkamra@172.21.160.1` (or your dedicated security inbox).

---

## 📋 What to Include in Your Report

To help us evaluate and triage your report efficiently, please include:

* **Type of Vulnerability:** (e.g., WebSocket Denial of Service, Model Deserialization issue, Cross-Site Scripting, Insecure Dependencies).
* **Affected Subsystem:** (`apps/api`, `apps/web`, or infrastructure config).
* **Step-by-Step Reproduction:** Proof of Concept (PoC) script, HTTP/WebSocket request frame, or payload.
* **Potential Impact:** What an attacker could achieve by exploiting the flaw.

---

## ⏱️ Response & Disclosure Timeline

We adhere to a standard 90-day coordinated vulnerability disclosure policy:

1. **Acknowledgement:** We will acknowledge receipt of your report within **24-48 hours**.
2. **Assessment & Triage:** Our maintainers will validate the vulnerability within **5 business days**.
3. **Patch Development:** We will prepare and test a security fix.
4. **Public Advisory:** Once a patch is released to `main`, we will issue a public GitHub Security Advisory crediting your discovery.

---

## 🔒 Security Best Practices for Self-Hosting

When deploying SentryForm in production:

* **Enforce TLS / WSS:** Never expose raw unencrypted WebSocket (`ws://`) endpoints to public networks; terminate TLS using an NGINX or Cloudflare ingress proxy (`wss://`).
* **Non-Root Execution:** Always run Docker containers using the provided non-root system users (`sentry` / `nextjs`).
* **Rate Limiting:** Place an API gateway rate-limiter in front of `/ws/telemetry` and `/api/v1/evaluate` to defend against denial-of-service floods.