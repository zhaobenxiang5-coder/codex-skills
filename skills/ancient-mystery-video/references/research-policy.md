# Research policy

`sources.json` is an array of `{id,title,url,publisher,sourceType,publishedAt?,notes?}`.

Use `sourceType`: `museum`, `university`, `government`, `paper`, `archive`, or `explanation`. At least three sources are required and two must be authoritative.

`claims.json` is an array of `{id,text,factLevel,sourceIds}`. `factLevel` is:

- `verified`: directly supported by cited evidence.
- `disputed`: evidence exists but interpretation or strength is contested.
- `speculative`: hypothesis, legend, or unsupported popular claim.

Verified claims require at least one source. Never turn legends, curses, aliens, or internet rumors into facts. The spoken script must signal uncertainty using language such as “有研究认为”“尚不能证明”“缺少可靠证据”.
