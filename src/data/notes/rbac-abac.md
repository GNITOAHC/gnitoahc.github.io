---
title: RBAC vs. ABAC
date: 2025-01-07
description: Notes on Role-Based Access Control (RBAC) and Attribute-Based Access Control (ABAC).
readTime: 3 min read
tags: ['Backend', 'Security']
type: writing
---

# Navigating RBAC and ABAC in Access Control

When managing a digital environment, security professionals must answer two fundamental questions: **“Who are you?”** and **“What are you allowed to do?”**

- The first question is **authentication** (passkeys, passwords, SSO, MFA).
- The second question is **authorization**—and it is often the harder one to model correctly.

Two widely used authorization models are **Role-Based Access Control (RBAC)** and **Attribute-Based Access Control (ABAC)**.

Source video: [RBAC vs ABAC (YouTube)](https://youtu.be/rvZ35YW4t5k?si=I7a-JeHsuspD9FTB)

## The Simplicity of Roles (RBAC)

In a complex environment like a hospital, managing permissions for every employee individually can quickly become a “spaghetti” mess of hard-to-maintain rules.

**Role-Based Access Control (RBAC)** simplifies this by grouping permissions into roles, then assigning users to those roles.

Instead of assigning rights to each person, you define roles such as:

- **Doctors** might be allowed to read and write orders or lab requests.
- **Nurses** might be allowed to read orders and lab requests.
- **Lab technicians** might be the only ones allowed to write lab reports.

When a new employee joins, you assign them a role and they automatically inherit that role’s permissions.

Common RBAC benefits:

- Easier to reason about in organizations with clear job functions
- Centralized permission management (change the role once; it applies everywhere)
- Often simpler to audit

Common RBAC pain points:

- Roles can proliferate (“role explosion”) when you need many variations
- Roles alone may be too coarse-grained for contextual rules (time, location, ownership)

## The Precision of Attributes (ABAC)

RBAC works well for many hierarchical organizations, but some environments require more flexibility.

**Attribute-Based Access Control (ABAC)** makes access decisions based on attributes (properties) of the user, the resource, the action, and sometimes the environment.

Common attributes include:

- **Geography** (e.g., is the user in the US or Europe?)
- **Position and department** (e.g., are they a manager in Finance?)
- **Employment status** (e.g., full-time employee or contractor?)
- **Clearance level** (e.g., “Secret” or “Top Secret” access?)

For example, a high-security financial report might only be accessible if a user is a manager in the Finance department and holds a high clearance level. If any of these conditions are not met, access is denied.

ABAC is especially useful for rules like:

- “Users can access only their own records.”
- “Contractors can access this system only from the corporate VPN.”
- “Approvals require a manager in the same department.”

## How It Works: The Architecture of a Decision

In real systems, authorization is often described using a standard flow with two key components:

- **Policy Enforcement Point (PEP)**: the gatekeeper (API gateway, service middleware, reverse proxy) that intercepts the request.
- **Policy Decision Point (PDP)**: the brain that evaluates policies and returns a decision.

A common request flow:

1. The user requests access to a resource.
2. The **PEP** intercepts the request and asks the **PDP** whether access should be granted.
3. The **PDP** evaluates relevant policies (RBAC, ABAC, or a combination).
4. The **PDP** returns a decision to the **PEP**, which allows or blocks the request.

## RBAC vs. ABAC at a Glance

| Topic         | RBAC                                       | ABAC                                           |
| ------------- | ------------------------------------------ | ---------------------------------------------- |
| Primary input | Roles                                      | Attributes (user/resource/action/environment)  |
| Strength      | Simple and easy to administer              | Fine-grained, context-aware policies           |
| Weakness      | Can become too coarse or create many roles | Policy design can get complex                  |
| Best for      | Stable org structures and job functions    | Dynamic rules (ownership, context, compliance) |
| Auditability  | Often straightforward                      | Can be excellent, but depends on tooling       |

## Which One Should You Choose?

The right choice depends on your organization’s needs:

- Choose **RBAC** when your access rules map cleanly to job responsibilities and don’t depend heavily on context.
- Choose **ABAC** when you need more granular control based on identity and context, or when “who owns what” matters.

In practice, it is rarely an either/or decision. Many organizations use a **hybrid approach**:

- Use RBAC for broad access (e.g., “Finance Analyst”).
- Use ABAC for constraints (e.g., region, data classification, record ownership).

## Practical Tips

If you are implementing authorization rules, these usually help:

- Start simple (often RBAC) and evolve rules only when needed.
- Name policies and roles based on business concepts, not technical implementation.
- Avoid embedding authorization logic deep inside application code; centralize it when possible.
- Invest in observability: you want to answer “why was this request allowed/denied?” quickly.
