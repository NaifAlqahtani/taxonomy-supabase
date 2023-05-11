import { cookies, headers } from "next/headers"
import { createRouteHandlerSupabaseClient } from "@supabase/auth-helpers-nextjs"
import * as z from "zod"

import { Database } from "@/types/db"
import { RequiresProPlanError } from "@/lib/exceptions"
import { getUserSubscriptionPlan } from "@/lib/subscription"
import { getPostsInfo } from "@/app/supabase-server"

const postCreateSchema = z.object({
  title: z.string(),
  content: z.string().optional(),
})

export async function GET() {
  const supabase = createRouteHandlerSupabaseClient<Database>({
    headers,
    cookies,
  })
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return new Response("Unauthorized", { status: 403 })
    }

    const user = session.user
    const posts = getPostsInfo()

    return new Response(JSON.stringify(posts))
  } catch (error) {
    return new Response(null, { status: 500 })
  }
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerSupabaseClient<Database>({
    headers,
    cookies,
  })
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return new Response("Unauthorized", { status: 403 })
    }

    const { user } = session
    const subscriptionPlan = await getUserSubscriptionPlan(user.id)

    // If user is on a free plan.
    // Check if user has reached limit of 3 posts.
    if (!subscriptionPlan?.isPro) {
      const { count } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("authorId", user.id)

      if (count && count >= 3) {
        throw new RequiresProPlanError()
      }
    }

    const json = await req.json()
    const body = postCreateSchema.parse(json)

    const { data: post } = await supabase
      .from("posts")
      .insert({
        title: body.title,
        content: body.content,
        author_id: session.user.id,
      })
      .select()

    return new Response(JSON.stringify(post))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    if (error instanceof RequiresProPlanError) {
      return new Response("Requires Pro Plan", { status: 402 })
    }

    return new Response(null, { status: 500 })
  }
}
