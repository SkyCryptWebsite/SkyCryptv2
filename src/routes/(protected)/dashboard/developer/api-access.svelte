<script lang="ts">
  import { resolve } from "$app/paths";
  import * as Alert from "$ui/alert";
  import * as AlertDialog from "$ui/alert-dialog";
  import { Badge } from "$ui/badge";
  import { Button } from "$ui/button";
  import * as Card from "$ui/card";
  import * as Dialog from "$ui/dialog";
  import * as Empty from "$ui/empty";
  import { Input } from "$ui/input";
  import * as Item from "$ui/item";
  import { Spinner } from "$ui/spinner";
  import CopyIcon from "@lucide/svelte/icons/copy";
  import KeyRoundIcon from "@lucide/svelte/icons/key-round";
  import PickaxeIcon from "@lucide/svelte/icons/pickaxe";
  import { toast } from "svelte-sonner";
  import { API_USE_CASES } from "#lib/shared/constants/developer";
  import ApiKeyRequestForm from "./api-key-request-form.svelte";
  import {
    deleteApiKey,
    generateApiKey,
    getApiAccess,
    regenerateApiKey,
    withdrawApiKeyRequest
  } from "./developer.remote";
  import RateLimitRequest from "./rate-limit-request.svelte";

  const access = $derived(await getApiAccess());
  const request = $derived(access.request);
  const canReapply = $derived(!access.reapplyAt || new Date(access.reapplyAt) <= new Date());
  let revealedKey = $state<string | null>(null);
  let confirmOpen = $state(false);
  let confirming = $state<"delete" | "regenerate">("delete");
  const keyBusy = $derived(!!deleteApiKey.pending || !!regenerateApiKey.pending);

  const confirmations = {
    delete: {
      title: "Delete your API key?",
      description: "Apps using this key stop working immediately. You can generate a new key afterwards.",
      action: "Delete key",
      run: () => run(deleteApiKey, "API key deleted.", "Unable to delete your API key.")
    },
    regenerate: {
      title: "Regenerate your API key?",
      description: "Your current key stops working immediately. Update your apps with the new key.",
      action: "Regenerate key",
      run: async () => {
        revealedKey =
          (await run(regenerateApiKey, "API key regenerated.", "Unable to regenerate your API key.")) ?? null;
      }
    }
  };
  const confirmation = $derived(confirmations[confirming]);

  function confirm(kind: typeof confirming) {
    confirming = kind;
    confirmOpen = true;
  }

  const statusBadge = {
    pending: { label: "In review", variant: "outline" },
    approved: { label: "Approved", variant: "default" },
    denied: { label: "Denied", variant: "destructive" },
    revoked: { label: "Revoked", variant: "destructive" }
  } as const;

  const date = (value: Date) =>
    new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

  async function run<T>(action: () => Promise<T>, success: string, failure: string) {
    try {
      const result = await action();
      toast.success(success);
      return result;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : failure);
    }
  }

  async function generate() {
    revealedKey = (await run(generateApiKey, "API key generated.", "Unable to generate an API key.")) ?? null;
  }

  async function copyKey() {
    if (!revealedKey) return;
    try {
      await navigator.clipboard.writeText(revealedKey);
      toast.success("API key copied.");
    } catch {
      toast.error("Unable to copy. Select the key and copy it manually.");
    }
  }
</script>

<Card.Root class="border glass ring-0 glass-bg-card standard:bg-transparent">
  <Card.Header>
    <Card.Title>API access</Card.Title>
    <Card.Description>
      We review every request before a key is issued and you can only have one API key at a time.
    </Card.Description>
    {#if request}
      <Card.Action>
        <Badge variant={statusBadge[request.status].variant}>{statusBadge[request.status].label}</Badge>
      </Card.Action>
    {/if}
  </Card.Header>
  <Card.Content class="flex flex-col gap-4">
    {#if request?.status === "pending"}
      <Item.Root variant="outline" class="items-start">
        <Item.Content class="min-w-0">
          <Item.Title>{request.name}</Item.Title>
          <Item.Description>
            {API_USE_CASES.find(({ value }) => value === request.useCase)?.label ?? request.useCase} · Submitted {date(
              request.createdAt
            )}
          </Item.Description>
          <p class="text-sm leading-relaxed wrap-break-word whitespace-pre-line text-muted-foreground">
            {request.description}
          </p>
          <p class="text-sm wrap-break-word text-muted-foreground">{request.url}</p>
        </Item.Content>
      </Item.Root>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-muted-foreground">We’ll show the result here once your request is reviewed.</p>
        <Button
          variant="outline"
          size="lg"
          disabled={!!withdrawApiKeyRequest.pending}
          aria-busy={!!withdrawApiKeyRequest.pending}
          onclick={() => run(withdrawApiKeyRequest, "Request withdrawn.", "Unable to withdraw your request.")}>
          {#if withdrawApiKeyRequest.pending}<Spinner data-icon="inline-start" />{/if}
          Withdraw request
        </Button>
      </div>
    {:else if request?.status === "approved"}
      {#if request.reviewNote}
        <Alert.Root class="border bg-transparent">
          <Alert.Title>Note from SkyCrypt</Alert.Title>
          <Alert.Description class="whitespace-pre-line">{request.reviewNote}</Alert.Description>
        </Alert.Root>
      {/if}
      {#if access.key}
        <Item.Root variant="outline">
          <Item.Media variant="icon" class="size-10 rounded-full border">
            <KeyRoundIcon strokeWidth={1.5} />
          </Item.Media>
          <Item.Content class="min-w-0">
            <Item.Title class="flex-wrap">
              <code class="font-mono">{access.key.start}…</code>
            </Item.Title>
            <Item.Description class="tabular-nums">
              Created {date(access.key.createdAt)} · {access.key.lastRequest
                ? `Last used ${date(access.key.lastRequest)}`
                : "Never used"}
              {#if access.key.rateLimitMax && access.key.rateLimitTimeWindow}
                · {access.key.rateLimitMax} requests per {access.key.rateLimitTimeWindow / 60_000} minutes
              {/if}
            </Item.Description>
          </Item.Content>
          <Item.Actions class="flex-wrap max-sm:w-full max-sm:pl-13.5">
            <Button
              variant="outline"
              size="lg"
              disabled={keyBusy}
              aria-busy={!!regenerateApiKey.pending}
              onclick={() => confirm("regenerate")}>
              {#if regenerateApiKey.pending}<Spinner data-icon="inline-start" />{/if}
              Regenerate
            </Button>
            <Button
              variant="outline"
              size="lg"
              disabled={keyBusy}
              aria-busy={!!deleteApiKey.pending}
              onclick={() => confirm("delete")}>
              {#if deleteApiKey.pending}<Spinner data-icon="inline-start" />{/if}
              Delete key
            </Button>
          </Item.Actions>
        </Item.Root>
        <RateLimitRequest {access} />
      {:else}
        <Empty.Root class="border">
          <Empty.Header>
            <Empty.Media variant="icon"><KeyRoundIcon /></Empty.Media>
            <Empty.Title>Your request was approved</Empty.Title>
            <Empty.Description>Generate your API key. You’ll only see the full key once.</Empty.Description>
          </Empty.Header>
          <Empty.Content>
            <Button disabled={!!generateApiKey.pending} aria-busy={!!generateApiKey.pending} onclick={generate}>
              {#if generateApiKey.pending}<Spinner data-icon="inline-start" />{/if}
              {generateApiKey.pending ? "Generating…" : "Generate API key"}
            </Button>
          </Empty.Content>
        </Empty.Root>
      {/if}
    {:else}
      {#if request?.status === "denied"}
        <Alert.Root variant="destructive">
          <Alert.Title>Your request for “{request.name}” was denied</Alert.Title>
          <Alert.Description>
            {#if request.reviewNote}<p class="whitespace-pre-line">{request.reviewNote}</p>{/if}
            {#if access.reapplyAt && !canReapply}
              <p>You can send a new request after {date(access.reapplyAt)}.</p>
            {/if}
          </Alert.Description>
        </Alert.Root>
      {:else if request?.status === "revoked"}
        <Alert.Root variant="destructive">
          <Alert.Title>
            {#if access.key}Your API key <code class="font-mono">{access.key.start}…</code> was disabled{:else}Your API
              access was revoked{/if}
          </Alert.Title>
          <Alert.Description>
            {#if request.reviewNote}<p class="whitespace-pre-line">{request.reviewNote}</p>{/if}
            <p>You can request a new key below. We will review it again.</p>
          </Alert.Description>
        </Alert.Root>
      {/if}
      {#if !access.minecraftLinked}
        <Empty.Root class="border">
          <Empty.Header>
            <Empty.Media variant="icon"><PickaxeIcon /></Empty.Media>
            <Empty.Title>Link a Minecraft account first</Empty.Title>
            <Empty.Description
              >Connect your Minecraft account with MC-ID before you request API access.</Empty.Description>
          </Empty.Header>
          <Empty.Content>
            <Button href={resolve("dashboard")}>Go to dashboard</Button>
          </Empty.Content>
        </Empty.Root>
      {:else if canReapply}
        <ApiKeyRequestForm />
      {/if}
    {/if}
  </Card.Content>
</Card.Root>

<AlertDialog.Root bind:open={confirmOpen}>
  <AlertDialog.Content class="standard:glass standard:bg-transparent">
    <AlertDialog.Header>
      <AlertDialog.Title>{confirmation.title}</AlertDialog.Title>
      <AlertDialog.Description>{confirmation.description}</AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action
        variant="destructive"
        onclick={async () => {
          confirmOpen = false;
          await confirmation.run();
        }}>
        {confirmation.action}
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>

<Dialog.Root
  open={revealedKey !== null}
  onOpenChange={(open) => {
    if (!open) revealedKey = null;
  }}>
  <Dialog.Content class="standard:glass standard:bg-transparent">
    <Dialog.Header>
      <Dialog.Title>Save your API key</Dialog.Title>
      <Dialog.Description>
        Copy it now and keep it secret. You won’t be able to see it again. The API docs explain how to send it.
      </Dialog.Description>
    </Dialog.Header>
    <div class="flex gap-2">
      <Input
        readonly
        value={revealedKey}
        aria-label="Your API key"
        class="font-mono"
        onfocus={(event) => event.currentTarget.select()} />
      <Button variant="outline" size="icon-lg" aria-label="Copy API key" onclick={copyKey}><CopyIcon /></Button>
    </div>
    <Dialog.Footer>
      <Button size="lg" onclick={() => (revealedKey = null)}>I’ve saved my key</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
