export function wantANumber(
  query: string | string[] | undefined | null,
  alternative: number,
): number {
  return query
    ? typeof query === "string"
      ? Number.isNaN(+query)
        ? alternative
        : +query
      : alternative
    : alternative;
}

export function wantAString(
  query: string | string[] | undefined | null,
  alternative: string,
): string {
  return query
    ? typeof query === "string"
      ? query
      : alternative
    : alternative;
}
