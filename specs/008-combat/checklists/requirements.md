# Specification Quality Checklist: Combate, condições, social, medo e insanidade (DtD 7.7a)

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-09-26
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- Escopo escolhido pelo usuário: dano + críticos automáticos; iniciativa, turnos, reações e o menu das 38 ações;
  condições, fadiga, morte e cura; combate social, medo e insanidade.
- Dados do inventário do cap. XVII extraído do PDF (pp. 416–452): 38 ações, 27 condições, 20 tabelas de críticos com
  100 entradas, Shock Table, Mental Traumas. Conferir as tabelas contra o PDF (modo `-table`) na implementação.
- Premissas candidatas a `/speckit-clarify`: Dodge/Parry somam metade à Static Defense (o livro se contradiz); linha do
  crítico pelo total acumulado; texto das ações vale sobre a tabela-resumo; sem fórmula de cura por Medicae.
