# Architecture rules

- Short review URLs are resolved server-side against `convites_avaliacao`; never expose the persistent reservation review token in new public links.
- Review submission and invite consumption happen in one database transaction; public reviews require explicit admin approval.