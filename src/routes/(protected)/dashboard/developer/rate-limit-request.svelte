<script lang="ts">
  import * as Alert from "$ui/alert";
  import { Button } from "$ui/button";
  import * as Collapsible from "$ui/collapsible";
  import * as Field from "$ui/field";
  import { Input } from "$ui/input";
  import { Spinner } from "$ui/spinner";
  import { Textarea } from "$ui/textarea";
  import GaugeIcon from "@lucide/svelte/icons/gauge";
  import { toast } from "svelte-sonner";
  import { rateLimitRequestSchema } from "#lib/shared/api-key-request";
  import { MAX_REQUESTED_RATE_LIMIT } from "#lib/shared/constants/developer";
  import { submitRateLimitRequest, type getApiAccess } from "./developer.remote";

  let { access }: { access: Awaited<ReturnType<typeof getApiAccess>> } = $props();

  const { fields } = submitRateLimitRequest;
  const latest = $derived(access.rateLimitRequest);
  const current = $derived(access.key?.rateLimitMax ?? 0);
  const minutes = $derived((access.key?.rateLimitTimeWindow ?? 0) / 60_000);
  const reapplyAt = $derived(access.rateLimitReapplyAt && new Date(access.rateLimitReapplyAt));
  const canRequest = $derived(latest?.status !== "pending" && (!reapplyAt || reapplyAt <= new Date()));
  const submitting = $derived(!!submitRateLimitRequest.pending);
  const formIssues = $derived(fields.allIssues()?.filter(({ path }) => path.length === 0));

  const date = (value: Date) =>
    new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
</script>

<section class="flex flex-col gap-3 border-t pt-4" aria-labelledby="rate-limit-heading">
  <div class="flex items-center gap-2">
    <GaugeIcon class="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
    <h3 id="rate-limit-heading" class="font-medium">Rate limit</h3>
  </div>
  <p class="text-sm text-muted-foreground tabular-nums">
    Your key allows {current.toLocaleString("en-US")} requests per {minutes} minutes.
  </p>

  {#if latest?.status === "pending"}
    <Alert.Root class="border bg-transparent">
      <Alert.Title>Rate limit increase in review</Alert.Title>
      <Alert.Description class="tabular-nums">
        You asked for {latest.requestedMax.toLocaleString("en-US")} requests per {minutes} minutes on {date(
          latest.createdAt
        )}.
      </Alert.Description>
    </Alert.Root>
  {:else if latest?.status === "denied"}
    <Alert.Root variant="destructive">
      <Alert.Title>Your rate limit increase was denied</Alert.Title>
      <Alert.Description>
        {#if latest.reviewNote}<p class="whitespace-pre-line">{latest.reviewNote}</p>{/if}
        {#if reapplyAt && !canRequest}<p>You can ask again after {date(reapplyAt)}.</p>{/if}
      </Alert.Description>
    </Alert.Root>
  {:else if latest?.status === "approved" && latest.reviewNote}
    <Alert.Root class="border bg-transparent">
      <Alert.Title>Note from SkyCrypt</Alert.Title>
      <Alert.Description class="whitespace-pre-line">{latest.reviewNote}</Alert.Description>
    </Alert.Root>
  {/if}

  {#if canRequest}
    <Collapsible.Root>
      <Collapsible.Trigger>
        {#snippet child({ props })}
          <Button variant="outline" size="lg" class="w-fit" {...props}>Request a higher limit</Button>
        {/snippet}
      </Collapsible.Trigger>
      <Collapsible.Content class="pt-4">
        <form
          {...submitRateLimitRequest.preflight(rateLimitRequestSchema).enhance(async ({ submit }) => {
            try {
              if (await submit()) toast.success("Rate limit request sent. We’ll review it soon.");
            } catch {
              toast.error("Unable to send your request. Please try again.");
            }
          })}>
          <Field.FieldGroup>
            <Field.Field data-invalid={!!fields.requestedMax.issues()} data-disabled={submitting}>
              <Field.FieldLabel for="rate-limit-max">Requests per {minutes} minutes</Field.FieldLabel>
              <Input
                id="rate-limit-max"
                {...fields.requestedMax.as("number")}
                required
                min={current + 1}
                max={MAX_REQUESTED_RATE_LIMIT}
                step={1}
                class="tabular-nums"
                disabled={submitting} />
              <Field.FieldError errors={fields.requestedMax.issues()} />
            </Field.Field>

            <Field.Field data-invalid={!!fields.reason.issues()} data-disabled={submitting}>
              <Field.FieldLabel for="rate-limit-reason">Why do you need more?</Field.FieldLabel>
              <Textarea
                id="rate-limit-reason"
                {...fields.reason.as("text")}
                required
                maxlength={1000}
                rows={4}
                disabled={submitting}
                aria-describedby="rate-limit-reason-help" />
              <Field.FieldDescription id="rate-limit-reason-help">
                Describe your traffic, for example how many users or profiles you look up and how you cache results.
                <span class="tabular-nums">({fields.reason.value()?.length ?? 0}/1000)</span>
              </Field.FieldDescription>
              <Field.FieldError errors={fields.reason.issues()} />
            </Field.Field>

            <Field.FieldError errors={formIssues} />

            <Button type="submit" size="lg" class="w-fit" disabled={submitting} aria-busy={submitting}>
              {#if submitting}<Spinner data-icon="inline-start" />{/if}
              {submitting ? "Sending request…" : "Send request"}
            </Button>
          </Field.FieldGroup>
        </form>
      </Collapsible.Content>
    </Collapsible.Root>
  {/if}
</section>
