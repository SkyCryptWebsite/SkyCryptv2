<script lang="ts">
  import type { RemoteForm, RemoteQueryUpdate } from "$app/server";
  import { Button } from "$ui/button";
  import * as Field from "$ui/field";
  import { Spinner } from "$ui/spinner";
  import { Textarea } from "$ui/textarea";
  import CheckIcon from "@lucide/svelte/icons/check";
  import XIcon from "@lucide/svelte/icons/x";
  import { toast } from "svelte-sonner";
  import type { z } from "zod";
  import type { reviewSchema } from "#lib/shared/admin";

  type Props = {
    /** A per-row instance from `.for(id)`, so notes don't leak between requests. */
    form: Omit<RemoteForm<z.input<typeof reviewSchema>, void>, "for">;
    id: string;
    /** Queries to refresh in the same request, e.g. the list the request came from. */
    updates: RemoteQueryUpdate[];
    onReviewed: () => void;
  };

  let { form, id, updates, onReviewed }: Props = $props();
  const submitting = $derived(!!form.pending);
</script>

<form
  class="flex flex-col gap-4"
  {...form.enhance(async ({ submit }) => {
    try {
      if (await submit().updates(...updates)) {
        toast.success("Review saved.");
        onReviewed();
      }
    } catch {
      toast.error("Unable to save the review. Please try again.");
    }
  })}>
  <input {...form.fields.id.as("hidden", id)} />
  <Field.Field data-invalid={!!form.fields.note.issues()} data-disabled={submitting}>
    <Field.FieldLabel for="review-note-{id}">Note to the user</Field.FieldLabel>
    <Textarea
      id="review-note-{id}"
      {...form.fields.note.as("text")}
      rows={4}
      maxlength={1000}
      disabled={submitting}
      aria-describedby="review-note-help-{id}" />
    <Field.FieldDescription id="review-note-help-{id}">
      Optional. The user sees this, so explain denials in a way they can act on.
    </Field.FieldDescription>
    <Field.FieldError errors={form.fields.note.issues()} />
  </Field.Field>
  <Field.FieldError errors={form.fields.allIssues()?.filter(({ path }) => path.length === 0)} />
  <div class="flex flex-wrap justify-end gap-2">
    <Button variant="outline" disabled={submitting} {...form.fields.decision.as("submit", "deny")}>
      {#if submitting}<Spinner data-icon="inline-start" />{:else}<XIcon data-icon="inline-start" />{/if}
      Deny
    </Button>
    <Button disabled={submitting} {...form.fields.decision.as("submit", "approve")}>
      {#if submitting}<Spinner data-icon="inline-start" />{:else}<CheckIcon data-icon="inline-start" />{/if}
      Approve
    </Button>
  </div>
</form>
