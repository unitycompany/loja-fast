# Admin Panel Overhaul Plan

## Goals

- Centralize content management for all storefront data (products, categories, brands, banners, security badges, SEO defaults).
- Ensure every asset uploaded through the admin is persisted in Supabase (database + storage) without requiring manual path edits.
- Provide guardrails so non-technical operators can complete required fields while advanced editors still have access to raw JSON when needed.
- Streamline data dependencies: slugs, category-path relationships, default SEO metadata, unit/measure bundles, brand associations.

## Scope Overview

| Module | Current pain points | Planned improvements |
| --- | --- | --- |
| Authentication Gate | Manual 64-char key prompt | Keep gate, add inline guidance & remember toggle |
| Dashboard | No quick summary | Add header summary (counts, last sync) |
| Brands | Manual path entry for logo, no validation | Drag & drop uploader (brands bucket), slug auto-fill, color picker, real-time preview |
| Banners | Requires pre-uploaded URLs | Support desktop/mobile uploads, enforce CTA fields, type presets |
| Products | Complex JSON, limited validation, no brand/category pickers | Multi-step wizard (Basics, Pricing/Units, Content, Media, SEO, Advanced), auto slug, dropdown pickers from Supabase, image uploader with reorder, FAQ/Properties editors |
| Categories | Raw JSON editing only | Visual tree editor with child management, hero image upload, icon selector, slug guard |
| Security Badges | Not manageable | New module with storage upload + ordering |
| SEO Defaults | Missing | New settings panel for site-wide SEO fallbacks |

## Data Dependencies

- **Supabase tables**: `products`, `brands`, `banners`, `categories`, `security`, `seo_defaults` (new).
- **Storage buckets**: `products`, `brands`, `banners`, `security` (proposed new) with public access for read.

## UX Principles

1. **Progressive disclosure**: present required fields first; advanced JSON editors stay accessible under expandable sections.
2. **Inline validation**: highlight missing required data with friendly copy; disable save until critical fields are filled.
3. **Live previews**: show image and SEO snippet previews while editing.
4. **Consistency**: shared components for form rows, uploaders, section headers.

## Component Architecture

- `AdminLayout`: wraps sidebar navigation, summary pills, and content slot.
- `AdminContext`: provides shared data loaders (brands, categories, storage helpers) with optimistic reload hooks.
- `MediaUploader`: handles drag/drop, previews, Supabase storage upload, returns bucket path.
- `FormSection`: collapsible section with title/description, optional required indicator.
- `FieldRow`: handles label+input layout with hint/validation text.

## Implementation Phases

1. **Foundation**
   - Create shared context + layout components.
   - Introduce summary header and toast notifications.
2. **Media tooling**
   - Build `MediaUploader` (drop area, progress bar, replace/remove actions).
   - Update brand + banner forms to use uploader.
3. **Product wizard**
   - Split form into tabs/steps.
   - Add slug auto-fill, category/brand selectors, units editor, SEO preview.
   - Preserve raw JSON override.
4. **Category tree & Security badges**
   - Build interactive tree editor for categories + hero uploads.
   - Add new security module with drag-to-reorder.
5. **Settings**
   - Introduce SEO defaults + global toggles.
6. **Polish**
   - Mobile adjustments, keyboard navigation, help tooltips.

## Open Questions

- Do we enforce brand/category references by ID or slug? (Plan: store slug, show both.)
- Should product units link to a centralized units table? (Future iteration.)
- Need email notifications on publish? (Out of scope for now.)

## Next Steps

- [ ] Implement shared admin components and context (Phase 1).
- [ ] Upgrade brand + banner modules to new uploader (Phase 2).
- [ ] Rebuild product editor as guided wizard (Phase 3).
- [ ] Deliver category tree + security badge management (Phase 4).
- [ ] Add SEO defaults settings page (Phase 5).
- [ ] QA with sample content + update README (Phase 6).
