# ADR-0001: Data standards (timestamps, languages, timezones, phone numbers)

**Status:** Accepted

**Decision:** Use RFC 3339 timestamps; BCP-47 language tags; IANA TZ IDs; E.164 phone format; ULID identifiers; JSON Schema 2020-12 via AJV.

**Rationale:** Interop and validation across connectors and automation.

**References:** RFC 3339; RFC 9557 (extension); MDN BCP-47; IANA TZ; ITU E.164; AJV docs.