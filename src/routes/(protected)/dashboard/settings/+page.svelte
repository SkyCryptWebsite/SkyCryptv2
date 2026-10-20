<script lang="ts">
  import { resolve } from "$app/paths";
  import { Badge } from "$ui/badge";
  import { Button } from "$ui/button";
  import * as Card from "$ui/card";
  import * as Dialog from "$ui/dialog";
  import * as Empty from "$ui/empty";
  import * as Field from "$ui/field";
  import { Input } from "$ui/input";
  import * as Item from "$ui/item";
  import { Spinner } from "$ui/spinner";
  import { Switch } from "$ui/switch";
  import DownloadIcon from "@lucide/svelte/icons/download";
  import LogOutIcon from "@lucide/svelte/icons/log-out";
  import MonitorIcon from "@lucide/svelte/icons/monitor";
  import ShieldCheckIcon from "@lucide/svelte/icons/shield-check";
  import SmartphoneIcon from "@lucide/svelte/icons/smartphone";
  import { toast } from "svelte-sonner";
  import { authClient } from "#lib/shared/auth-client";
  import { getDashboard } from "../dashboard.remote";
  import { sessionDevice } from "./session-device";
  import { deleteAccount, exportData, getSessions, revokeSession, setDeveloperMode } from "./settings.remote";

  const sessions = $derived(await getSessions());
  const developerMode = $derived((await getDashboard()).user.developerMode);
  const otherSessions = $derived(sessions.filter((session) => !session.current));
  let revoking = $state<string | null>(null);
  let exporting = $state(false);
  let deleting = $state(false);
  let deleteOpen = $state(false);
  let confirmation = $state("");
  let deleteError = $state("");
  const date = (value: Date) =>
    new Date(value).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC"
    });

  async function signOutSession(id?: string) {
    revoking = id ?? "all";
    try {
      if (id) {
        await revokeSession(id);
      } else {
        const result = await authClient.revokeOtherSessions();
        if (result.error) throw new Error(result.error.message ?? "Unable to sign out other sessions.");
      }
      await getSessions().refresh();
      toast.success(id ? "Session signed out." : "Other sessions signed out.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign out. Please try again.");
    } finally {
      revoking = null;
    }
  }

  async function toggleDeveloperMode(enabled: boolean) {
    try {
      await setDeveloperMode(enabled);
      // A fresh request reads the session cookie Better Auth just updated.
      await getDashboard().refresh();
      toast.success(enabled ? "Developer mode turned on." : "Developer mode turned off.");
    } catch {
      toast.error("Unable to update developer mode. Please try again.");
    }
  }

  async function downloadData() {
    exporting = true;
    try {
      const data = await exportData();
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `skycrypt-account-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("Your data export is ready.");
    } catch {
      toast.error("Unable to export your data. Please try again.");
    } finally {
      exporting = false;
    }
  }

  async function removeAccount(event: SubmitEvent) {
    event.preventDefault();
    if (confirmation !== "DELETE" || deleting) return;
    deleting = true;
    deleteError = "";
    try {
      await deleteAccount("DELETE");
      window.location.assign(resolve("/"));
    } catch (error) {
      deleteError = error instanceof Error ? error.message : "Unable to delete your account. Please try again.";
      deleting = false;
    }
  }
</script>

<svelte:head>
  <title>Account settings | SkyCrypt</title>
  <meta name="description" content="Manage your SkyCrypt sessions, export your data or delete your account." />
</svelte:head>

<div class="mx-auto flex w-full max-w-3xl flex-col gap-4">
  <Card.Root class="border glass ring-0 glass-bg-card standard:bg-transparent">
    <Card.Header>
      <h1 class="text-3xl font-semibold text-balance">Settings</h1>
      <Card.Description>Manage developer mode, your sessions and personal data.</Card.Description>
    </Card.Header>
  </Card.Root>

  <Card.Root class="border glass ring-0 glass-bg-card standard:bg-transparent">
    <Card.Header>
      <Card.Title>Where you’re signed in</Card.Title>
      <Card.Description>Check your active sessions. Sign out of any you don’t recognize.</Card.Description>
    </Card.Header>
    <Card.Content>
      <Item.Group class="gap-2">
        {#each sessions as session (session.id)}
          {const device = $derived(sessionDevice(session.userAgent))}
          <Item.Root variant="outline" class="items-start">
            <Item.Media variant="icon" class="size-10 rounded-full border">
              {#if device.mobile}<SmartphoneIcon strokeWidth={1.5} />{:else}<MonitorIcon strokeWidth={1.5} />{/if}
            </Item.Media>
            <Item.Content class="min-w-0">
              <Item.Title class="flex-wrap">
                {device.name}
                {#if session.current}<Badge variant="outline">This device</Badge>{/if}
              </Item.Title>
              <p class="text-xs wrap-break-word text-muted-foreground tabular-nums">
                Signed in {date(session.createdAt)} · {session.ipAddress || "IP unavailable"}
              </p>
              <details class="text-xs text-muted-foreground">
                <summary
                  class="w-fit cursor-pointer rounded-sm py-2 outline-offset-4 hover:text-foreground focus-visible:outline-2"
                  >Browser details</summary>
                <p class="max-w-prose leading-relaxed wrap-break-word">
                  {session.userAgent || "Browser information unavailable"}
                </p>
                <p class="pt-2 tabular-nums">Session expires {date(session.expiresAt)} (UTC)</p>
              </details>
            </Item.Content>
            {#if !session.current}
              <Item.Actions class="max-sm:w-full max-sm:pl-13.5">
                <Button
                  variant="outline"
                  size="lg"
                  disabled={revoking !== null}
                  aria-busy={revoking === session.id}
                  aria-label={`Sign out of ${device.name}`}
                  onclick={() => signOutSession(session.id)}>
                  {#if revoking === session.id}<Spinner data-icon="inline-start" />{/if}
                  {revoking === session.id ? "Signing out…" : "Sign out"}
                </Button>
              </Item.Actions>
            {/if}
          </Item.Root>
        {:else}
          <Empty.Root>
            <Empty.Header>
              <Empty.Title>No active sessions found</Empty.Title>
              <Empty.Description>Refresh this page to check your sessions again.</Empty.Description>
            </Empty.Header>
          </Empty.Root>
        {/each}
      </Item.Group>
    </Card.Content>
    <Card.Footer class="flex flex-wrap justify-between gap-3 border-t">
      <p class="flex items-center gap-2 text-sm text-muted-foreground">
        <ShieldCheckIcon class="size-4 shrink-0" strokeWidth={1.5} />
        {#if sessions.length === 0}
          No active sessions to manage.
        {:else if otherSessions.length}
          You’ll stay signed in here.
        {:else}
          You’re only signed in here.
        {/if}
      </p>
      <Button
        variant="outline"
        size="lg"
        disabled={revoking !== null || !otherSessions.length}
        aria-busy={revoking === "all"}
        onclick={() => signOutSession()}>
        {#if revoking === "all"}<Spinner data-icon="inline-start" />{:else}<LogOutIcon data-icon="inline-start" />{/if}
        {revoking === "all" ? "Signing out…" : "Sign out other sessions"}
      </Button>
    </Card.Footer>
  </Card.Root>

  <Card.Root class="border glass ring-0 glass-bg-card standard:bg-transparent">
    <Card.Content>
      <Field.Field orientation="horizontal" data-disabled={!!setDeveloperMode.pending}>
        <Field.FieldContent>
          <Field.FieldLabel for="developer-mode">Developer mode</Field.FieldLabel>
          <Field.FieldDescription>
            Show developer tools, such as API keys, in the dashboard sidebar. Existing API keys keep working when this
            is off.
          </Field.FieldDescription>
        </Field.FieldContent>
        <Switch
          id="developer-mode"
          checked={developerMode}
          disabled={!!setDeveloperMode.pending}
          onCheckedChange={toggleDeveloperMode} />
      </Field.Field>
    </Card.Content>
  </Card.Root>

  <Card.Root class="border glass ring-0 glass-bg-card standard:bg-transparent">
    <Card.Header>
      <Card.Title>Export your data</Card.Title>
      <Card.Description>Download a copy of the personal data stored with your SkyCrypt account.</Card.Description>
    </Card.Header>
    <Card.Content>
      <p class="text-sm leading-relaxed text-pretty text-muted-foreground">
        Sensitive data such as passwords and API keys are excluded. <br />
        Public SkyBlock data is managed by Mojang and Hypixel so it is not included in this export.
      </p>
    </Card.Content>
    <Card.Footer>
      <Button variant="outline" size="lg" disabled={exporting || deleting} aria-busy={exporting} onclick={downloadData}>
        {#if exporting}<Spinner data-icon="inline-start" />{:else}<DownloadIcon data-icon="inline-start" />{/if}
        {exporting ? "Preparing export…" : "Download your data"}
      </Button>
    </Card.Footer>
  </Card.Root>

  <Card.Root class="border glass ring-0 glass-bg-card standard:bg-transparent">
    <Card.Header>
      <Card.Title>Delete account</Card.Title>
      <Card.Description>Permanently delete your SkyCrypt account</Card.Description>
    </Card.Header>
    <Card.Content>
      <p class="text-sm leading-relaxed text-pretty text-muted-foreground">
        This does not delete your Mojang or Hypixel accounts. You will lose access to your SkyCrypt account and all
        associated data. This action cannot be undone.
      </p>
    </Card.Content>
    <Card.Footer class="flex flex-wrap justify-between gap-3 border-t">
      <p class="text-sm text-muted-foreground">Export your data first if you want to keep a copy.</p>
      <Button
        variant="destructive"
        size="lg"
        disabled={exporting || deleting}
        onclick={() => {
          confirmation = "";
          deleteError = "";
          deleteOpen = true;
        }}>
        Delete account
      </Button>
    </Card.Footer>
  </Card.Root>
</div>

<Dialog.Root bind:open={deleteOpen}>
  <Dialog.Content
    class="standard:glass standard:bg-transparent"
    onInteractOutside={(event) => {
      if (deleting) event.preventDefault();
    }}
    onEscapeKeydown={(event) => {
      if (deleting) event.preventDefault();
    }}
    showCloseButton={!deleting}>
    <Dialog.Header>
      <Dialog.Title>Delete your SkyCrypt account?</Dialog.Title>
      <Dialog.Description>
        This cannot be undone. Sign in again first if your session is more than a day old.
      </Dialog.Description>
    </Dialog.Header>
    <form id="delete-account" onsubmit={removeAccount}>
      <Field.FieldGroup>
        <Field.Field data-invalid={!!deleteError} data-disabled={deleting}>
          <Field.FieldLabel for="delete-confirmation">Type DELETE to confirm</Field.FieldLabel>
          <Input
            id="delete-confirmation"
            bind:value={confirmation}
            disabled={deleting}
            autocomplete="off"
            spellcheck={false}
            aria-invalid={!!deleteError}
            aria-describedby={deleteError ? "delete-error" : undefined} />
          {#if deleteError}<Field.FieldError id="delete-error" role="alert">{deleteError}</Field.FieldError>{/if}
        </Field.Field>
      </Field.FieldGroup>
    </form>
    <Dialog.Footer>
      <Button variant="outline" size="lg" disabled={deleting} onclick={() => (deleteOpen = false)}>Cancel</Button>
      <Button
        variant="destructive"
        size="lg"
        type="submit"
        form="delete-account"
        disabled={confirmation !== "DELETE" || deleting}
        aria-busy={deleting}>
        {#if deleting}<Spinner data-icon="inline-start" />{/if}
        {deleting ? "Deleting…" : "Permanently delete account"}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
