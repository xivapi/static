---
title: Ensuring Stability
sidebar:
  order: 2
---

explain why data is unstable, outline that optins are available for mitigating instability

## Game versions

outline version preservation, link to versions api doc (or endpoint? (or both?)), explain how to pin version with query param

## Schemas

outline schema pinning, explain how to utilise the canonical schema in responses as a value for pinning - note that schema pin only relevant for schema-ful endpoints? asset is a bit of a spanner

### exdschema

explain specifics of schema pinning format for exds (with note that using latest is usually fine enough). only need to document `2:` format, as non-2 will break in 7.2 so weh
