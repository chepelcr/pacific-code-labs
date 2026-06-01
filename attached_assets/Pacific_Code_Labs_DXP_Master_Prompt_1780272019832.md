# Pacific Code Labs - Digital Experience Platform (DXP)

## Purpose

Build a complete Digital Experience Platform (DXP) for Pacific Code Labs consisting of:

- Public Website
- Administration Panel
- CMS Layer
- Translation Layer
- Theme Layer
- Media Library
- Future Product Expansion Support

---

# Business Context

## Company

Pacific Code Labs

### Positioning

Technology built in Costa Rica to solve real business problems.

### Core Areas

- Software Engineering
- Artificial Intelligence
- Business Automation
- Cloud Architecture
- Technical Support

---

# Product Ecosystem

## Tsuru

Tagline:

Conectando producción, comunidad y comercio.

Description:

Platform designed for cooperatives, associations, productive organizations, social economy initiatives and SMEs.

Modules:

- POS
- Electronic Invoicing
- Inventory
- Customers
- Orders
- Analytics
- Digital Stores

## FireCode CR

AI assistant for:

- Fire Protection Engineering
- Electrical Regulations
- Technical Compliance
- NFPA Standards
- Costa Rican Regulations

## Future Products

The platform must support unlimited future products without structural changes.

---

# Cultural Identity Requirements

The platform must be inspired by Costa Rican indigenous worldviews.

IMPORTANT:

Do NOT create a folkloric website.
Do NOT create a museum website.
Do NOT use stereotypical indigenous imagery.

Instead, draw inspiration from:

- Knowledge sharing
- Community
- Collective growth
- Sustainability
- Harmony
- Creation
- Stewardship
- Wisdom

Visual inspiration:

- Ocean movement
- Cacao
- River flows
- Connected systems
- Geometric patterns
- Network structures
- Indigenous geometry interpreted through a modern SaaS lens

The final result must feel like:

"Modern technology inspired by ancestral principles."

---

# Brand System

## Colors

Midnight Navy: #0F172A
Tech Blue: #2563EB
Electric Cyan: #06B6D4
Emerald Accent: #10B981

Background: #F8FAFC

## Typography

- Inter
- Geist

---

# Technology Stack

- React
- TypeScript
- Vite
- TailwindCSS
- shadcn/ui
- React Query
- React Hook Form
- Zod
- Framer Motion
- React Router
- i18next

---

# Architecture

```text
src/

├── modules/
├── shared/
├── services/
├── repositories/
├── contracts/
├── content/
├── admin/
├── website/
├── translations/
├── themes/
└── assets/
```

---

# Mandatory Architecture Rules

1. No hardcoded business content.
2. Landing page must consume services only.
3. Admin panel must consume the same contracts.
4. Repository pattern required.
5. Future storage engine must be replaceable.
6. Translation support required.
7. Theme support required.

---

# Public Website Modules

- Hero
- Products
- Services
- Technical Support
- Case Studies
- Philosophy
- About
- FAQ
- Contact
- Footer

---

# Philosophy Section

## Knowledge

Technology should democratize access to information.

## Community

Technology should strengthen human collaboration.

## Sustainable Growth

Technology should create long-term value.

---

# Administration Panel

Route:

/admin

## Layout

Collapsible Sidebar

### Business

- Dashboard
- Products
- Services
- Case Studies
- FAQ
- Contact
- SEO
- Navigation
- Footer

### CMS

- Languages
- Themes
- Media Library
- Content Versions
- Import Content
- Export Content
- System Settings

### Platform

- Content Explorer
- Contract Inspector
- Diagnostics

---

# Content Contracts

Every content entity must include:

```json
{
  "id": "",
  "slug": "",
  "status": "draft",
  "sortOrder": 0,
  "createdAt": "",
  "updatedAt": "",
  "translations": {
    "es": {},
    "en": {}
  }
}
```

---

# Initial JSON Structure

## products.json

```json
[
  {
    "id": "tsuru",
    "slug": "tsuru",
    "status": "active",
    "sortOrder": 1,
    "translations": {
      "es": {
        "name": "Tsuru",
        "tagline": "Conectando producción, comunidad y comercio."
      },
      "en": {
        "name": "Tsuru",
        "tagline": "Connecting production, community and commerce."
      }
    },
    "externalUrl": "https://tsuru.example.com"
  },
  {
    "id": "firecode",
    "slug": "firecode-cr",
    "status": "active",
    "sortOrder": 2,
    "translations": {
      "es": {
        "name": "FireCode CR"
      },
      "en": {
        "name": "FireCode CR"
      }
    },
    "externalUrl": "https://firecode.example.com"
  }
]
```

## hero.json

```json
{
  "translations": {
    "es": {
      "title": "Transformamos procesos empresariales en software inteligente.",
      "subtitle": "Desarrollamos productos tecnológicos y soluciones empresariales."
    },
    "en": {
      "title": "We transform business processes into intelligent software.",
      "subtitle": "We build technology products and business solutions."
    }
  }
}
```

## philosophy.json

```json
{
  "knowledge": {
    "es": "El conocimiento debe ser accesible.",
    "en": "Knowledge should be accessible."
  },
  "community": {
    "es": "La tecnología fortalece comunidades.",
    "en": "Technology strengthens communities."
  },
  "growth": {
    "es": "El crecimiento debe ser sostenible.",
    "en": "Growth should be sustainable."
  }
}
```

---

# Deliverables

Generate:

1. Complete website
2. Complete CMS
3. Admin Dashboard
4. Repository Layer
5. Service Layer
6. Content Contracts
7. Translation System
8. Theme System
9. Media Library
10. SEO Management
11. Product Management
12. Case Study Management
13. FAQ Management
14. Responsive Design
15. Accessibility Compliance
16. Production-ready Architecture

The final result must feel like a premium SaaS company inspired by Costa Rican identity and capable of supporting multiple products for many years without requiring structural redesign.
