import { MAX_QUERY_LENGTH } from "@/lib/database/query-constants";

const FORBIDDEN_SQL_PATTERN =
  /\b(insert|update|delete|drop|alter|create|truncate|replace|merge|grant|revoke|execute|call|copy|vacuum|attach|detach|pragma|into|outfile|dumpfile|load_file|pg_read_file|pg_write_file|dblink|lo_import|lo_export)\b/i;

const FORBIDDEN_COMMENT_PATTERN = /(--|\/\*|\*\/|#)/;

const FORBIDDEN_LOCK_PATTERN = /\bfor\s+(update|share)\b/i;

const FORBIDDEN_DELAY_PATTERN = /\b(pg_sleep|sleep)\s*\(/i;

export function validateReadOnlySQL(query: string): string {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    throw new Error("SQL query cannot be empty.");
  }

  if (normalizedQuery.length > MAX_QUERY_LENGTH) {
    throw new Error("SQL query exceeds the maximum allowed length.");
  }

  if (FORBIDDEN_COMMENT_PATTERN.test(normalizedQuery)) {
    throw new Error("SQL comments are not allowed.");
  }

  const withoutTrailingSemicolon = normalizedQuery.replace(/;$/, "");

  if (withoutTrailingSemicolon.includes(";")) {
    throw new Error("Only one SQL statement is allowed.");
  }

  if (!/^(select|with)\b/i.test(withoutTrailingSemicolon)) {
    throw new Error("Only SELECT queries are allowed.");
  }

  if (FORBIDDEN_SQL_PATTERN.test(withoutTrailingSemicolon)) {
    throw new Error("The query contains a forbidden SQL operation.");
  }

  if (FORBIDDEN_LOCK_PATTERN.test(withoutTrailingSemicolon)) {
    throw new Error("Locking queries are not allowed.");
  }

  if (FORBIDDEN_DELAY_PATTERN.test(withoutTrailingSemicolon)) {
    throw new Error("Time-delay functions are not allowed.");
  }

  return withoutTrailingSemicolon;
};
