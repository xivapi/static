---
title: Important Concepts
description: Structures, terms, and ideas that underpin XIVAPI's functionality.
sidebar:
  order: 1
prev: false
---

There are many concepts and terms that have become core to the understanding of
FFXIV within the developer community. This pages serves to introduce and
describe a few that are important to understand when utilising XIVAPI.

## Versions

As a live service MMO, FFXIV receives "patches" and "hotfixes" regularly. In
many instances, these will require updates to the game client files. The
snapshot of the game files as of one of these updates is considered a
**version**.

While loose correlations may be drawn, it is best practice to consider that
_any_ update may result in _any_ change to client files. As such, a change of
game version should be considered a "major" update in
[semver](https://semver.org/) terms.

## Sheets

Like many applications, FFXIV stores a significant amount of its content and
data in a relational database. A sizeable portion of this data is included in
the game client files in a propriatary file format referred to as excel (no,
not the Microsoft product), or exd.

Within this data, a single data collection is known as a **sheet**, analogous to
a table in database terminology. It's important to note that, while _many_
concepts are similar to traditions RDBMS, it's not a perfect 1:1 match - excel
is specialised for its usage in FFXIV, and has a non-standard feature set as a
result.

### Fields

Keeping with the database analogy, sheets contain one or more columns, or
**fields**. Each field has a data type (string, number, boolean, and so forth)
which is consistent for all values for that field.

But that's about as far as the analogy will get us. In addition to the basic
("scalar") data types, fields are frequently grouped into collections such as
fixed-size arrays and structs, which exist within individual rows of the sheet.

### Relationships

Every sheet has a built-in ID field, the row ID, which acts as the sheet's
primary key. Some specialised sheets will additionally contain a _subrow_ ID.
When present, the combination of row and subrow ID acts as a composite primary
key.

Sheets will regularly contain fields that act akin to foreign keys, referencing
rows in other sheets by their ID. These links are known as **relationships**. In
many cases, the target sheet of these relationships can be one of multiple
distinct sheets - the manner in which the target sheet is chosen varies
field-to-field, and is ultimately decided by game logic outside the dataset
entirely.

### Editions & Localisations

The game client that connects to international data centres maintained by Square
Enix is referred to, for the sake of documentation, as the "global edition" of
FFXIV. The global edition ships with localisations in Japanese, English, German,
and French.

In addition to the global edition, seperate Korean and Chinese game editions are
available, each providing a localisation into their respective language.

All localisation in the game files make use of sheets, which offer the ability
to provide per-locale data on a sheet-by-sheet basis. Through this, access to
sheet data allows for full access to strings across all languages available in
an edition.

:::caution[Limitations of XIVAPI locale support]

At time of writing, XIVAPI only provides data available in the global game
client: Japanese, English, German, and French. Alternatives may be available for
other game editions - If you operate an API-compatible service, please contact
us so we can direct consumers looking for this data to you!

:::

### Transient Sheets

In some instances, sheets may contain a mix of both data that needs to be
readily available and frequently used, and data that is infrequently accessed
and/or is slow to load. To handle this, sheets are occasionally split into two
or more seperate sheets along that access-requirement line, with all sheets
sharing their row IDs.

By convention, _most_ of these splits result in the infrequent-access data being
moved to a sheet with the `Transient` suffix.

For a concrete example, the `Action` sheet contains a significant amount of
data, encapsulating the information required for the action to be viewed, cast,
placed on hotbars, and so forth. Tooltips, however, contain a fairly sizeable
amount of text explaining the effect of the action, which is only utilised when
actively hovering over the action's icon - so the description is instead stored
in the `ActionTransient` sheet. The data for the "Cure" action, can be found at
row ID `120` on both sheets.

## Schemas

Despite the descriptions of features and fields above, in reality, the game
files contain very little structural information about the sheets we use. Only
the names of the sheets, languages supported, and count and types of fields in
the sheets are statically known.

For everything else, ranging from field names and structures to the inter-sheet
relationships they represent, the community maintains **schemas**. These schemas
represent a best-effort attempt at defining meaning and semantics for data that
we don't control, and as such are not comprehensive, or always perfectly
accurate.

Schemas that are used by XIVAPI are listed on the [software](/docs/software/) page.
