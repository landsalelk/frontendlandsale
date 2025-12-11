# implementation_plan.md

## UI/UX Audit & Enhancement Plan

This plan outlines the steps to audit the current "LandSale.lk" application, identify UI/UX gaps, and implement necessary fixes and enhancements.

## 1. Audit Methodology
We will conduct a heuristic evaluation based on:
*   **Consistency**: Visual language, spacing, typography (Inter/Tailwind defaults).
*   **Responsiveness**: Mobile-first approach verification.
*   **Usability**: Navigation flow, Form interactions, Feedback mechanisms.
*   **Accessibility**: Color contrast, Focus states, Semantic HTML.

## 2. Identified Key Areas for Improvement (Preliminary)

### A. Homepage
*   **Hero Section**: Ensure the search bar is the focal point. Improve the "Property Type" dropdown styling to match the custom input.
*   **Featured Section**: Ensure cards have consistent height and image aspect ratios. Code already handles this, but visual verification is needed.

### B. Property Details Page
*   **Map**: Replace static text with a better visual placeholder or a lightweight map component (e.g., Leaflet or Google Maps Embed).
*   **Images**: Ensure the gallery grid handles varying numbers of images gracefully (currently 1 + 3 grid).
*   **Sidebar**: On mobile, ensure the "Price" and "Contact" info is easily accessible (e.g., sticky bottom bar).

### C. Search Page
*   **Filters**: Currently limited. We need to assess if a sidebar filter or a top-bar filter is better.
*   **Results**: infinite scroll or pagination? currently just a list.

### D. Dashboard (Post Ad)
*   **Form UX**: The multi-step form is good. We need to ensure validation errors are clear and scrolling happens automatically to errors.

## 3. Execution Plan

### Phase 1: Fixes & Polish
1.  **Style Refinements**: Update `globals.css` or Tailwind config if consistent colors are missing.
2.  **Component Tweaks**:
    *   Update `PropertyCard` (Search/Home) to be identical/consistent.
    *   Update `PropertyPage` to handle empty states (no agent image, no phone).

### Phase 2: Missing Pages
1.  Create `src/app/about/page.tsx`
2.  Create `src/app/contact/page.tsx`
3.  Create `src/app/privacy/page.tsx`

### Phase 3: Mock Data Generation
1.  Create a script `src/scripts/seed.ts` (or similar) to insert ~10 varied properties into Supabase for robust testing of filters and layout.

### Phase 4: Final Verification
1.  Run through the "Task List" (`task.md`) and check off items.
2.  Final browser walkthrough recording.
