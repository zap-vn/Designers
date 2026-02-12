---
name: customer-management
description: Skill for managing customer profiles, fetching details, and mapping customer data to the ZAP Design Engine.
---

# Customer Management Skill

This skill provides expertise in handling customer-related operations and data structures.

## Core Concepts

- **Identity-First Fetching**: Always use the unique `_id` (e.g., `Customer/1`) to retrieve specific detail records.
- **Resource Mapping**: Map complex API fields (`BussinessTypeId`, `LanguageId`) to human-readable labels or UI components.
- **Consistency**: Ensure customer information (Logo/Avatar, Name) is consistent across the entire application header and profile pages.

## Triggers

- When the user asks to "fetch customer info", "show profile", or "link customer data".
- When implementing onboarding flows that require pre-filling data from the customer detail.
- When debugging issues related to customer ID encoding or GET request parameters.

## Reference Patterns

- **Task Group**: `task-groups/customer/*.md`
- **Workflow**: `workflows/customer/*.md`
- **Rules**: `rules/customer/*.md`
