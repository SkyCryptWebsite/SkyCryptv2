<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { sessionDevice } from "$routes/(protected)/dashboard/settings/session-device";
  import * as Alert from "$ui/alert";
  import * as AlertDialog from "$ui/alert-dialog";
  import * as Avatar from "$ui/avatar";
  import { Badge } from "$ui/badge";
  import { Button } from "$ui/button";
  import * as Card from "$ui/card";
  import * as Dialog from "$ui/dialog";
  import * as Field from "$ui/field";
  import * as Item from "$ui/item";
  import * as Select from "$ui/select";
  import { Spinner } from "$ui/spinner";
  import { Switch } from "$ui/switch";
  import { Textarea } from "$ui/textarea";
  import BanIcon from "@lucide/svelte/icons/ban";
  import LogOutIcon from "@lucide/svelte/icons/log-out";
  import ShieldIcon from "@lucide/svelte/icons/shield";
  import { toast } from "svelte-sonner";
  import { AUDIT_ACTIONS, BAN_DURATIONS } from "#lib/shared/admin";
  import { roleLabels, roleRank, UserRole } from "#lib/shared/roles";
  import { getStaffContext } from "../../admin.remote";
  import { formatDate, formatDateTime, formatNumber } from "../../format";
  import StatusBadge from "../../status-badge.svelte";
  import {
    banUser,
    getUserDetail,
    revokeUserSessions,
    setDeveloperMode,
    setUserRole,
    unbanUser
  } from "../users.remote";

  const id = $derived(page.params.id ?? "");
  // One async derived for both, so they load in parallel without an await waterfall.
  const [detail, staff] = $derived(await Promise.all([getUserDetail(id), getStaffContext()]));
  const user = $derived(detail.user);
  const can = $derived({
    ban: staff.permissions.banUsers && detail.outranked,
    revoke: staff.permissions.revokeSessions && detail.outranked,
    setRole: staff.permissions.setRoles && detail.outranked,
    edit: staff.permissions.editUsers && detail.outranked
  });
  // Only roles below the staff member's own rank can be handed out.
  const assignableRoles = $derived(
    Object.values(UserRole).filter((role) => roleRank(role) < roleRank(staff.user.role))
  );

  let banOpen = $state(false);
  let roleOpen = $state(false);
  let revokeOpen = $state(false);
  let banDuration = $state<keyof typeof BAN_DURATIONS>("7d");
  let role = $state<UserRole>(UserRole.User);

  const banForm = $derived(banUser.for(id));
  const roleForm = $derived(setUserRole.for(id));

  async function run(action: () => Promise<unknown>, success: string) {
    try {
      await action();
      toast.success(success);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  const providerLabels: Record<string, string> = { discord: "Discord", "mc-id": "MC-ID", patreon: "Patreon" };
</script>

<svelte:head>
  <title>{user.name} | SkyCrypt Admin</title>
</svelte:head>

<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
  <div class="flex items-center gap-4">
    <Avatar.Root class="size-16">
      {#if user.image}<Avatar.Image src={user.image} alt="" />{/if}
      <Avatar.Fallback>{user.name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
    </Avatar.Root>
    <div class="flex min-w-0 flex-col gap-1">
      <div class="flex flex-wrap items-center gap-2">
        <h1 class="truncate text-2xl font-semibold tracking-tight">{user.name}</h1>
        {#if user.role !== UserRole.User}<Badge variant="secondary">{roleLabels[user.role]}</Badge>{/if}
        {#if user.banned}<Badge variant="destructive">Banned</Badge>{/if}
      </div>
      <p class="text-sm text-muted-foreground">
        Discord ID <span class="font-mono">{user.discordId}</span> · Joined {formatDate(user.createdAt)}
      </p>
    </div>
  </div>
  {#if can.ban || can.revoke || can.setRole}
    <div class="flex flex-wrap gap-2">
      {#if can.setRole}
        <Button
          variant="outline"
          onclick={() => {
            role = user.role;
            roleOpen = true;
          }}>
          <ShieldIcon data-icon="inline-start" />Change role
        </Button>
      {/if}
      {#if can.revoke}
        <Button variant="outline" disabled={!!revokeUserSessions.pending} onclick={() => (revokeOpen = true)}>
          <LogOutIcon data-icon="inline-start" />Sign out everywhere
        </Button>
      {/if}
      {#if can.ban}
        {#if user.banned}
          <Button
            variant="outline"
            disabled={!!unbanUser.pending}
            aria-busy={!!unbanUser.pending}
            onclick={() => run(() => unbanUser(id), "User unbanned.")}>
            {#if unbanUser.pending}<Spinner data-icon="inline-start" />{/if}Unban
          </Button>
        {:else}
          <Button variant="destructive" onclick={() => (banOpen = true)}>
            <BanIcon data-icon="inline-start" />Ban
          </Button>
        {/if}
      {/if}
    </div>
  {/if}
</div>

{#if user.banned}
  <Alert.Root variant="destructive">
    <BanIcon />
    <Alert.Title>
      {user.banExpires ? `Banned until ${formatDateTime(user.banExpires)}` : "Permanently banned"}
    </Alert.Title>
    <Alert.Description>{user.banReason || "No reason given."}</Alert.Description>
  </Alert.Root>
{/if}

<div class="grid gap-4 lg:grid-cols-2">
  <Card.Root>
    <Card.Header>
      <Card.Title>Connections</Card.Title>
      <Card.Description>Linked sign-in providers and Minecraft accounts.</Card.Description>
    </Card.Header>
    <Card.Content class="flex flex-col gap-4">
      <dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
        {#each detail.accounts as linked (linked.providerId)}
          <dt class="text-muted-foreground">{providerLabels[linked.providerId] ?? linked.providerId}</dt>
          <dd class="truncate">Linked {formatDate(linked.createdAt)}</dd>
        {/each}
        <dt class="text-muted-foreground"><label for="developer-mode">Developer mode</label></dt>
        <dd>
          <Switch
            id="developer-mode"
            disabled={!can.edit || !!setDeveloperMode.pending}
            bind:checked={
              () => user.developerMode,
              (enabled) =>
                run(
                  () => setDeveloperMode({ userId: id, enabled }),
                  enabled ? "Developer mode turned on." : "Developer mode turned off."
                )
            } />
        </dd>
        <dt class="text-muted-foreground">Patreon tier</dt>
        <dd>
          {#if detail.membership}
            Level {detail.membership.entitlementLevel} · {detail.membership.patronStatus ?? "unknown status"}
          {:else}
            None
          {/if}
        </dd>
      </dl>
      {#if detail.minecraft.length}
        <div class="flex flex-wrap gap-2">
          {#each detail.minecraft as minecraft (minecraft.uuid)}
            <Badge variant="outline">
              {minecraft.username}{#if minecraft.primary}<span class="text-muted-foreground"> · primary</span>{/if}
            </Badge>
          {/each}
        </div>
      {:else}
        <p class="text-sm text-muted-foreground">No Minecraft accounts linked.</p>
      {/if}
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header>
      <Card.Title>Sessions</Card.Title>
      <Card.Description>
        {formatNumber(detail.sessions.length)} active {detail.sessions.length === 1 ? "session" : "sessions"}.
      </Card.Description>
    </Card.Header>
    <Card.Content>
      {#if detail.sessions.length}
        <Item.Group>
          {#each detail.sessions as session (session.id)}
            <Item.Root size="sm" class="px-0">
              <Item.Content>
                <Item.Title class="font-normal">
                  {sessionDevice(session.userAgent).name}
                  {#if session.impersonated}<Badge variant="outline">Impersonated</Badge>{/if}
                </Item.Title>
                <Item.Description>
                  Signed in {formatDate(session.createdAt)} · expires {formatDate(session.expiresAt)}
                </Item.Description>
              </Item.Content>
            </Item.Root>
          {/each}
        </Item.Group>
      {:else}
        <p class="text-sm text-muted-foreground">Not signed in anywhere.</p>
      {/if}
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header>
      <Card.Title>API access</Card.Title>
      <Card.Description>Access and rate limit requests from this user.</Card.Description>
    </Card.Header>
    <Card.Content class="flex flex-col gap-4">
      {#if detail.requests.length}
        <Item.Group>
          {#each detail.requests as request (request.id)}
            <Item.Root size="sm" class="px-0">
              <Item.Content>
                <Item.Title>{request.name}</Item.Title>
                <Item.Description>
                  {formatDate(request.createdAt)}
                  {#if request.keyId}
                    · key <a
                      class="font-mono underline-offset-4 hover:underline"
                      href={resolve("/(protected)/(admin)/admin-dashboard/api-keys/[id]", { id: request.keyId })}
                      >{request.keyStart}…</a>
                    {request.keyEnabled ? "active" : "disabled"}
                  {/if}
                </Item.Description>
              </Item.Content>
              <Item.Actions><StatusBadge status={request.status} /></Item.Actions>
            </Item.Root>
          {/each}
        </Item.Group>
      {:else}
        <p class="text-sm text-muted-foreground">Never requested API access.</p>
      {/if}
      {#if detail.rateLimits.length}
        <div class="flex flex-col gap-2 border-t pt-4">
          <h3 class="text-sm font-medium">Rate limit requests</h3>
          {#each detail.rateLimits as request (request.id)}
            <div class="flex items-center justify-between gap-2 text-sm">
              <span class="tabular-nums">
                {formatNumber(request.requestedMax)} requests
                <span class="text-muted-foreground">· {formatDate(request.createdAt)}</span>
              </span>
              <StatusBadge status={request.status} />
            </div>
          {/each}
        </div>
      {/if}
    </Card.Content>
  </Card.Root>

  {#if detail.history}
    <Card.Root>
      <Card.Header>
        <Card.Title>Staff history</Card.Title>
        <Card.Description>The last 20 staff actions on this user.</Card.Description>
      </Card.Header>
      <Card.Content>
        {#if detail.history.length}
          <Item.Group>
            {#each detail.history as entry (entry.id)}
              <Item.Root size="sm" class="px-0">
                <Item.Content>
                  <Item.Title>{AUDIT_ACTIONS[entry.action]}</Item.Title>
                  <Item.Description>
                    {formatDateTime(entry.createdAt)}{#if entry.note}
                      · {entry.note}{/if}
                  </Item.Description>
                </Item.Content>
              </Item.Root>
            {/each}
          </Item.Group>
        {:else}
          <p class="text-sm text-muted-foreground">No staff actions yet.</p>
        {/if}
      </Card.Content>
    </Card.Root>
  {/if}
</div>

<p class="text-sm text-muted-foreground">
  <a class="underline-offset-4 hover:underline" href={resolve("/(protected)/(admin)/admin-dashboard/users")}
    >← Back to users</a>
</p>

<Dialog.Root bind:open={banOpen}>
  <Dialog.Content>
    <form
      class="flex flex-col gap-6"
      {...banForm.enhance(async ({ submit }) => {
        try {
          if (await submit()) {
            banOpen = false;
            toast.success(`${user.name} was banned.`);
          }
        } catch {
          toast.error("Unable to ban this user. Please try again.");
        }
      })}>
      <Dialog.Header>
        <Dialog.Title>Ban {user.name}?</Dialog.Title>
        <Dialog.Description>
          They’re signed out everywhere, can’t sign in, and their API keys are disabled.
        </Dialog.Description>
      </Dialog.Header>
      <input {...banForm.fields.userId.as("hidden", id)} />
      <Field.FieldGroup>
        <Field.Field data-invalid={!!banForm.fields.duration.issues()}>
          <Field.FieldLabel for="ban-duration">Duration</Field.FieldLabel>
          <Select.Root type="single" name={banForm.fields.duration.as("select").name} bind:value={banDuration}>
            <Select.Trigger id="ban-duration" class="w-full">{BAN_DURATIONS[banDuration].label}</Select.Trigger>
            <Select.Content>
              {#each Object.entries(BAN_DURATIONS) as [value, duration] (value)}
                <Select.Item {value} label={duration.label}>{duration.label}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
          <Field.FieldError errors={banForm.fields.duration.issues()} />
        </Field.Field>
        <Field.Field data-invalid={!!banForm.fields.reason.issues()}>
          <Field.FieldLabel for="ban-reason">Reason</Field.FieldLabel>
          <Textarea id="ban-reason" {...banForm.fields.reason.as("text")} rows={3} maxlength={500} required />
          <Field.FieldDescription>Shown to the user when they try to sign in.</Field.FieldDescription>
          <Field.FieldError errors={banForm.fields.reason.issues()} />
        </Field.Field>
        <Field.FieldError errors={banForm.fields.allIssues()?.filter(({ path }) => path.length === 0)} />
      </Field.FieldGroup>
      <Dialog.Footer>
        <Button type="button" variant="outline" onclick={() => (banOpen = false)}>Cancel</Button>
        <Button type="submit" variant="destructive" disabled={!!banForm.pending} aria-busy={!!banForm.pending}>
          {#if banForm.pending}<Spinner data-icon="inline-start" />{/if}Ban user
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={roleOpen}>
  <Dialog.Content>
    <form
      class="flex flex-col gap-6"
      {...roleForm.enhance(async ({ submit }) => {
        try {
          if (await submit()) {
            roleOpen = false;
            toast.success("Role updated.");
          }
        } catch {
          toast.error("Unable to change the role. Please try again.");
        }
      })}>
      <Dialog.Header>
        <Dialog.Title>Change {user.name}’s role</Dialog.Title>
        <Dialog.Description
          >You can assign roles below your own. Admins are added directly in the database.</Dialog.Description>
      </Dialog.Header>
      <input {...roleForm.fields.userId.as("hidden", id)} />
      <Field.Field data-invalid={!!roleForm.fields.role.issues()}>
        <Field.FieldLabel for="user-role">Role</Field.FieldLabel>
        <Select.Root type="single" name={roleForm.fields.role.as("select").name} bind:value={role}>
          <Select.Trigger id="user-role" class="w-full">{roleLabels[role]}</Select.Trigger>
          <Select.Content>
            {#each assignableRoles as option (option)}
              <Select.Item value={option} label={roleLabels[option]}>{roleLabels[option]}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
        <Field.FieldError errors={roleForm.fields.role.issues()} />
      </Field.Field>
      <Field.FieldError errors={roleForm.fields.allIssues()?.filter(({ path }) => path.length === 0)} />
      <Dialog.Footer>
        <Button type="button" variant="outline" onclick={() => (roleOpen = false)}>Cancel</Button>
        <Button type="submit" disabled={!!roleForm.pending || role === user.role} aria-busy={!!roleForm.pending}>
          {#if roleForm.pending}<Spinner data-icon="inline-start" />{/if}Save role
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>

<AlertDialog.Root bind:open={revokeOpen}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Sign {user.name} out everywhere?</AlertDialog.Title>
      <AlertDialog.Description>
        All of their sessions end immediately. They can sign in again unless they’re banned.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action
        onclick={() => {
          revokeOpen = false;
          void run(() => revokeUserSessions(id), "Signed out of all sessions.");
        }}>
        Sign out everywhere
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
