# Architecture rules

- Short review URLs are resolved server-side against `convites_avaliacao`; never expose the persistent reservation review token in new public links.
- Review submission and invite consumption happen in one database transaction; public reviews require explicit admin approval.
- Share booking contact resolution through the brand module so support and reservation links use the same current contact without changing reservation calculations.