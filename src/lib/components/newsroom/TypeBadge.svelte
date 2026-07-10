<script lang="ts" module>
  import type { PostType } from "$types";

  const TYPE_STYLES: Record<PostType, string> = {
    announcement: "bg-accent-4/15 text-accent-4 border border-accent-4/15",
    news: "bg-primary/15 text-primary border border-primary/15",
    update: "bg-minecraft-a/15 text-minecraft-a border border-bg-minecraft-a/15",
    changelog: "bg-minecraft-d/15 text-minecraft-d border border-bg-minecraft-d/15",
    guide: "bg-minecraft-b/15 text-minecraft-b border border-bg-minecraft-b/15",
    event: "bg-minecraft-c/15 text-minecraft-c border border-bg-minecraft-c/15"
  };

  export const POST_TYPE_LABELS: Record<PostType, string> = {
    announcement: "Announcement",
    news: "News",
    update: "Update",
    changelog: "Changelog",
    guide: "Guide",
    event: "Event"
  };
</script>

<script lang="ts">
  import { cn } from "$lib/shared/utils";
  import { Badge } from "$ui/badge";

  const { type, class: className }: { type: PostType; class?: string } = $props();
</script>

<Badge variant="default" class={cn("text-xs uppercase tracking-wide", TYPE_STYLES[type], className)}>
  {POST_TYPE_LABELS[type]}
</Badge>
