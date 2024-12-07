import { z } from 'zod'

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  is_active: z.boolean(),
  email: z.string()
})

export type User = z.infer<typeof userSchema>
