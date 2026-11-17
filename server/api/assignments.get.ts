/** GET /api/assignments?variant=cost|makespan|all — results for the bundled sample dataset. */
export default defineEventHandler(async (event) => {
  const variants = parseVariantQuery(getQuery(event).variant)

  if (!variants) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid variant', message: 'variant must be cost, makespan or all.' })
  }

  return solveAssignments(event, variants)
})
