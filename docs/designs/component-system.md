
**Component Library Reference**

**README Summary**: This document is a component reference sheet summarizing the reusable UI elements designed for Navin's frontend. It lists each component, its variants, and required interactive states (default, hover, active, disabled, loading). The work follows the design system established in Issue #1 and is intended to be used as a developer/design reference for implementing consistent UI components across the app.

**Design Reference**:
- **Task spec (design brief)**: https://docs.google.com/document/d/1kSLhvfNGSJbo23hIWkMIu_h0VuOaiGHKk-mbiseIlKk/edit?usp=sharing
- **Figma**: [Link here](https://www.drips.network/external/https%3A%2F%2Fwww.figma.com%2Ffile%2FQkQC037evEB8rRN7pz0ToS%3Fnode-id%3D280%3A7%26locale%3Den%26type%3Ddesign) — request edit access from the project owner for changes.)

**Overview**:
This sheet enumerates the components that must be available in the component library and explicitly documents the interactive states each component must support. Components should follow spacing, typography, color, and token rules from Issue #1's design system.

**Components & States**:
- **Buttons**: primary, secondary, ghost, danger — each shown in: default, hover, active, disabled, loading.
- **Input fields**: single-line text inputs — states: default, focus, error, disabled, with examples for placeholder and helper text.
- **Select dropdowns**: default, open (with list), hover over options, selected option, disabled, error.
- **Checkboxes**: unchecked, hover, checked, indeterminate, disabled.
- **Radio buttons**: unchecked, hover, checked, disabled.
- **Toggle switches**: off, on, hover, active, disabled.
- **Modals / Dialogs**: default modal, confirmation modal, with focus trap and keyboard interactions (Esc close), and disabled/readonly variants.
- **Badges / Status chips**: neutral, success, warning, danger — default and hover.
- **Cards**: default card, hovered card, raised/active card, disabled card — sections for header, body, actions.
- **Table rows / Data table**: default row, hover row, selected row, sorted column header, disabled row, responsive variants.
- **Tooltips**: default, with long content wrap, and accessibility (keyboard focus) examples.

**Visual Guidelines**:
- Show each component at standard sizes (sm, md, lg) where applicable.
- Demonstrate color usage for brand, semantic (success/warning/danger), and neutral states.
- Include token names for colors, spacing, and typography used in examples.

**Accessibility Notes**:
- All components must meet WCAG AA color-contrast for text and interactive elements.
- Keyboard focus states must be visible and included in the examples.
- Modals must include accessible labels and focus management.

**Acceptance Criteria (how to verify)**:
- Every component is shown with all interactive states (default, hover, active, disabled, loading where relevant).
- Components are consistent with the design system from Issue #1 (tokens, spacing, typography).
- The design document is present in `docs/designs/` and references the design brief and Figma.


**Implementation notes for developers**:
- Create atomic components first (`Button`, `Input`, `Select`, `Checkbox`, `Radio`, `Toggle`, `Tooltip`).
- Compose molecules and organisms (e.g., `Card`, `Modal`, `Table`) from atomic components to ensure consistency.
- Expose component props for states: `variant`, `size`, `disabled`, `loading`, `error`.
- Add Storybook stories or a visual example page to display each component and all states.

