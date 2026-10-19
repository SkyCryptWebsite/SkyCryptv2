<script lang="ts">
  import { Badge, type BadgeVariant } from "$ui/badge";

  let { status }: { status: "pending" | "approved" | "denied" | "revoked" } = $props();

  const styles: Record<typeof status, { label: string; variant: BadgeVariant }> = {
    pending: { label: "Pending", variant: "outline" },
    approved: { label: "Approved", variant: "secondary" },
    denied: { label: "Denied", variant: "destructive" },
    revoked: { label: "Revoked", variant: "destructive" }
  };
</script>

<Badge variant={styles[status].variant}>{styles[status].label}</Badge>
