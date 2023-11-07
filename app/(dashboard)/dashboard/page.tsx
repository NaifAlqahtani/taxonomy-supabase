import { EmptyPlaceholder } from "@/components/empty-placeholder"
import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import { createServerSupabaseClient } from "@/app/supabase-server"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  const cards = []

  return (
    <DashboardShell>
      <DashboardHeader heading="Posts" text="Create and manage posts.">
        <Button variant="outline">New</Button>
      </DashboardHeader>
      <div>
        {cards?.length ? (
          <div className="divide-y divide-border rounded-md border">
            {cards.map((post) => (
              <div>card</div>
            ))}
          </div>
        ) : (
          <EmptyPlaceholder>
            <EmptyPlaceholder.Icon name="post" />
            <EmptyPlaceholder.Title>No posts created</EmptyPlaceholder.Title>
            <EmptyPlaceholder.Description>
              You don&apos;t have any posts yet. Start creating content.
            </EmptyPlaceholder.Description>
            <Button variant="outline">New</Button>
          </EmptyPlaceholder>
        )}
      </div>
    </DashboardShell>
  )
}
