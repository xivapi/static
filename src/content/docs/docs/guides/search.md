---
title: Searching Sheets
sidebar:
  order: 4
reference:
  href: /api/1/docs#tag/search
  description: OpenAPI specification for the search endpoint.
---

The search endpoint finds sheet rows that match a provided query, and sorts them
by relevance.

Much of the API surface of search is shared with the sheet endpoints. This page
focuses on search-specific behavior, please refer to the documentation for
[sheet endpoints] or the search [api reference] for more details.

[sheet endpoints]: /docs/guides/sheets/
[api reference]: /api/1/docs#tag/search

## Query

The `query` parameter is the core API for search, controlling both result
relevance and filtering. Queries are written in a powerful query language,
outlined below.

### Clauses

Clauses are the basic building block of queries, performing a comparison of a
field with an expected value. They take the basic form of
`[specifier][operation][value]`, i.e. `Name="Rainbow Drip"`.

<details>
<summary><code>query=Name="Rainbow Drip"</code></summary>

```json wrap "query=Name=\"Rainbow Drip\"" "Rainbow Drip"
// /api/1/search?sheets=Action&fields=Name&query=Name="Rainbow Drip"
{
  "results": [
    {
      "row_id": 34688,
      "fields": { "Name": "Rainbow Drip" }
    }
  ]
}
```

</details>

### Specifiers

Similar to [field filters], fields that are nested within structural fields can
be searched by specifying the full path to the field. Dot notation is used for
structs and relationships, and array access notation for arrays.

[field filters]: /docs/guides/sheets/#filtering

<details>
<summary><code>query=ClassJob.Abbreviation="PCT"</code></summary>

```json wrap "query=ClassJob.Abbreviation=\"PCT\""
// /api/1/search?sheets=Action&fields=Name&query=ClassJob.Abbreviation="PCT"
{
  "results": [
    {
      "row_id": 34650,
      "fields": { "Name": "Fire in Red" }
    },
    {
      "row_id": 34653,
      "fields": { "Name": "Blizzard in Cyan" }
    },
    // ...
  ]
}
```

</details>

<details>
<summary><code>query=BaseParam[].Name="Spell Speed"</code></summary>

```json wrap "query=BaseParam[].Name=\"Spell Speed\"" "Spell Speed"
// /api/1/search?sheets=Item&fields=Name,BaseParam[].Name&query=BaseParam[].Name="Spell Speed"
{
  "results": [
    {
      "row_id": 1973,
      "fields": {
        "Name": "Ul'dahn Wand",
        "BaseParam": [
          { "fields": { "Name": "Mind" } },
          { "fields": { "Name": "Vitality" } },
          { "fields": { "Name": "Spell Speed" } },
          { "fields": { "Name": "" } },
          { "fields": { "Name": "" } },
          { "fields": { "Name": "" } }
        ]
      }
    },
    {
      "row_id": 1989,
      "fields": {
        "BaseParam": [
          { "fields": { "Name": "Mind" } },
          { "fields": { "Name": "Vitality" } },
          { "fields": { "Name": "Spell Speed" } },
          { "fields": { "Name": "" } },
          { "fields": { "Name": "" } },
          { "fields": { "Name": "" } }
        ],
        "Name": "Serpent Officer's Wand"
      },
      // ...
    },
  ]
}
```

</details>

To search for values in a language other than the request-wide `language`
parameter, fields may be decorated with language.

<details>
<summary><code>query=Name@ja="天使の筆"</code></summary>

```json wrap "天使の筆" "Angel Brush"
// /api/1/search?sheets=Item&fields=Name&query=Name@ja="天使の筆"
{
  "results": [
    {
      "row_id": 42589,
      "fields": {
        "Name": "Angel Brush"
      }
    }
  ]
}
```

</details>

### Operations & Values

The examples above have been searching for fields using exact equality. To
tailor queries further, multiple operations are available that can perform
comparisons with type-aware semantics.

| Type | Example |
| --- | --- |
| String | `"value"` |
| Number | `1`, `-1`, `1.0` |
| Boolean | `true`, `false` |

| Operation | Type | Comparison |
| --- | --- | --- |
| `=` | any | Exact equality |
| `>=`, `>`, `<=`, `<` | number | Numeric comparison |
| `~` | string | Partial string comparison |

<details>
<summary><code>query=Name~"rainbow"</code></summary>

```json wrap "query=Name~\"rainbow\"" "Rainbow"
// /api/1/search?sheets=Action&fields=Name&query=Name~"rainbow"
{
  "results": [
    {
      "row_id": 34688,
      "fields": { "Name": "Rainbow Drip" }
    },
    {
      "row_id": 21474,
      "fields": { "Name": "Lunar Rainbow" }
    },
    {
      "row_id": 29388,
      "fields": { "Name": "Rainbow Gulal" }
    },
    {
      "row_id": 6288,
      "fields": {"Name": "Rainbow Dynamo" }
    }
  ]
}
```

</details>

<details>
<summary><code>query=Recast100ms>3000</code></summary>

```json wrap "Recast100ms>3000"
// /api/1/search?sheets=Action&fields=Name,Recast100ms&query=Recast100ms>3000
{
  "results": [
    {
      "row_id": 6,
      "fields": {
        "Name": "Return",
        "Recast100ms": 9000
      }
    },
    {
      "row_id": 30,
      "fields": {
        "Name": "Hallowed Ground",
        "Recast100ms": 4200
      }
    },
    // ...
  ]
}
```

</details>

---

---

---

---

---

---

### Multiple Clauses / scoring / something

space-separated clauses
outline must match at least one behavior, relevancy
NOTE that score is black box

### Filtering / compolex queries or something

grouping, must/mustnot

CAUTION that +/must needs to be urlescaped if typing as a url

<details open>
<summary><code>SHORT</code></summary>

```json wrap
// URL
JSON
```

</details>

## something about multiple sheets and field behavior in that case?

## Pagination

not sure where this should sit in the page body
