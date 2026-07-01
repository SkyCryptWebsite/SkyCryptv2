<script lang="ts">
  import type { ThemeV4 } from "$lib/shared/themes/schema";
  import { getThemeShareURL } from "$lib/shared/themes/sharing";
  import { Button } from "$ui/button";
  import { Input } from "$ui/input";
  import { Label } from "$ui/label";
  import RotateCcw from "@lucide/svelte/icons/rotate-ccw";
  import Save from "@lucide/svelte/icons/save";
  import Share2 from "@lucide/svelte/icons/share-2";
  import { toast } from "svelte-sonner";

  let {
    workingTheme = $bindable(),
    onReset,
    onSave,
    handleNameChange,
    handleAuthorChange
  } = $props<{
    workingTheme: ThemeV4;
    onReset: () => void;
    onSave: () => void;
    handleNameChange: (name: string) => void;
    handleAuthorChange: (author: string) => void;
  }>();

  async function handleShare() {
    const url = await getThemeShareURL(workingTheme);
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Theme URL copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy URL. Check console for details.");
    }
  }
</script>

<div class="flex flex-col gap-4 text-card-foreground">
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-bold">Theme Editor</h2>
  </div>

  <div class="grid grid-cols-2 gap-4">
    <div class="flex flex-col gap-2">
      <Label for="theme-name">Theme Name</Label>
      <Input id="theme-name" type="text" value={workingTheme.metadata.name} placeholder="My Cool Theme" autocomplete="off" oninput={(e) => handleNameChange(e.currentTarget.value)} />
    </div>
    <div class="flex flex-col gap-2">
      <Label for="theme-author">Author</Label>
      <Input id="theme-author" type="text" value={workingTheme.metadata.author} placeholder="Your Name" autocomplete="off" oninput={(e) => handleAuthorChange(e.currentTarget.value)} />
    </div>
  </div>

  <div class="flex gap-2">
    <Button onclick={onSave} class="flex-1">
      <Save class="size-4" />
      Save Theme
    </Button>
    <Button onclick={handleShare} title="Copy Share URL" aria-label="Copy Share URL" variant="outline" size="icon">
      <Share2 class="size-4" />
    </Button>
    <Button onclick={onReset} title="Reset Changes" aria-label="Reset Changes" variant="destructive" size="icon">
      <RotateCcw class="size-4" />
    </Button>
  </div>
</div>
