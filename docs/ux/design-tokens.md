# Design Tokens (Minimal)

## 1. Colors
**Philosophy**: "Academic Authority meet Modern Clarity". Use reliable, deep tones for structure and warm tones for highlights.

| Token Name | Value (Hex) | Usage |
| :--- | :--- | :--- |
| `color-primary-main` | `#0F172A` | Backgrounds, Strong Text (Deep Blue/Slate). |
| `color-primary-light` | `#334155` | Secondary Text, Borders. |
| `color-accent-main` | `#D97706` | CTAs, Highlights (Academic Gold/Amber). |
| `color-accent-subtle` | `#FEF3C7` | Background highlights, Tooltips. |
| `color-success` | `#10B981` | Correct answers, "Mastered" nodes. |
| `color-error` | `#EF4444` | Incorrect answers, "Weak" nodes, Errors. |
| `color-bg-canvas` | `#F8FAFC` | Page background (Off-white, easy on eyes). |
| `color-bg-surface` | `#FFFFFF` | Cards, Modals. |

## 2. Typography
**Philosophy**: "Serif for Headlines (Book feel), Sans for Body (UI clarity)".

| Token Name | Font Family | Size / Line-Height | Usage |
| :--- | :--- | :--- | :--- |
| `font-serif` | `Merriweather`, `Georgia`, serif | - | Headlines, "Book Quote" text. |
| `font-sans` | `Inter`, `system-ui`, sans-serif | - | UI elements, buttons, chat text. |
| `text-h1` | `font-serif` | 32px / 1.2 | Page Titles. |
| `text-h2` | `font-serif` | 24px / 1.3 | Section Headers. |
| `text-body` | `font-sans` | 16px / 1.5 | Standard reading text. |
| `text-small` | `font-sans` | 14px / 1.5 | Captions, Citations, UI Labels. |

## 3. Spacing & Shape
**Grid Base**: 4px.

| Token Name | Value | Usage |
| :--- | :--- | :--- |
| `space-1` | 4px | Tight grouping. |
| `space-2` | 8px | Standard icon/text gap. |
| `space-4` | 16px | Standard padding. |
| `space-6` | 24px | Section separation. |
| `radius-sm` | 4px | Buttons, Inputs. |
| `radius-md` | 8px | Cards, Modals. |
| `radius-full` | 999px | Pills, Status indicators. |

## 4. Shadows & Depth
| Token Name | Usage |
| :--- | :--- |
| `shadow-sm` | Subtle card borders/lift. |
| `shadow-md` | Dropdowns, Popovers. |
| `shadow-lg` | Modals, Sticky elements. |
