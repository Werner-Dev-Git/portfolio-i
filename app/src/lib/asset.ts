/** Resolve a shared-asset path against the deploy base, so the same build
 *  works at a domain root and under a project subpath. */
export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}${path}`.replace(/([^:]\/)\/+/g, '$1');
}
