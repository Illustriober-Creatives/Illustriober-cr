# Public Site Design System

## Positioning

Illustriober is a Nairobi digital product studio for growing teams with operational friction or a promising product idea. The site leads with the outcome—clearer, dependable digital products—then explains capabilities, delivery, and ways to engage.

Until client products are public, all portfolio entries must be labelled **Concept study** or **Concept build**. Concept work demonstrates product judgment and craft; it must never imply a real client, live deployment, testimonial, or measured commercial result.

## Visual direction

The public site uses a warm editorial system instead of the previous dark glass aesthetic:

- Canvas: `#F4EFE5`
- Paper: `#FFFDF8`
- Ink: `#171717`
- Forest: `#1F4D3D`
- Orange: `#F39314` for emphasis; `#D96800` for accessible small text on light surfaces
- Display type: the local editorial serif stack in `--font-display`
- Body type: the local system sans stack in `--font-body`

Large typography and asymmetric grids create character. Solid surfaces, thin ink borders, and restrained shadows keep the interface credible. Glass effects are reserved for the fixed navigation surface.

## Component rules

- Primary actions use ink backgrounds and warm-white text.
- Secondary actions are underlined text links with an arrow icon.
- Controls have at least a 44px touch target and a visible keyboard focus ring.
- Cards use 24–32px radii, consistent 1px borders, and content-led hierarchy.
- Motion is limited to small transforms and image scale. Reduced-motion settings collapse transitions.
- Public marketing pages stay in the warm light theme so brand colors and contrast remain predictable.

## Content hierarchy

1. State who the studio helps and the business outcome.
2. Show the kinds of systems it can shape and build.
3. Demonstrate judgment with clearly labelled concept studies.
4. Explain a transparent four-stage process.
5. Offer concrete engagement shapes and one direct project CTA.

## Research notes

The content model borrows established patterns without copying language or visual assets:

- thoughtbot leads with a high-stakes customer outcome, shows a case study early, groups services by client stage, and makes process transparency part of its credibility.
- Work & Co uses an unusually direct promise, keeps capability language compact, and explains a collaborative process built around senior teams, measurable goals, prototypes, and ongoing testing.
- Fletch's positioning page demonstrates the value of stating the audience, problem, deliverable, timeline, and next action explicitly.

For Illustriober, the honest substitute for unavailable client proof is a transparent combination of concept work, defined deliverables, visible process, and careful language about what is and is not live.

## Maintenance checklist

- Label non-client work clearly.
- Do not publish invented metrics, logos, quotes, or client relationships.
- Prefer an outcome-led headline over a list of technologies.
- Keep one primary CTA label: **Start a project**.
- Check 375px, 768px, 1024px, and 1440px layouts.
- Run lint, tests, production build, and a keyboard/contrast check before release.
