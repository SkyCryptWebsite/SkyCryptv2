<script lang="ts">
  import * as Avatar from "$ui/avatar";
  import { Badge } from "$ui/badge";
  import * as Empty from "$ui/empty";
  import * as Item from "$ui/item";
  import * as Tooltip from "$ui/tooltip";
  import { tz } from "@date-fns/tz";
  import { format as dateFormat, formatDistanceStrict } from "date-fns";
  import { getMinecraftAccounts } from "./minecraft.remote";

  const accounts = $derived(await getMinecraftAccounts());

  let currentTime = $state(new Date());

  setInterval(() => {
    currentTime = new Date();
  }, 1000);
</script>

<Tooltip.Provider>
  <div class="flex flex-col gap-3 px-4 pb-4">
    {#if accounts.length}
      <Item.Group>
        {#each accounts as account (`${account.accountId}:${account.uuid}`)}
          <Item.Root variant="outline" size="sm">
            <Item.Media>
              <Avatar.Root class="size-10 rounded-none after:rounded-none">
                <Avatar.Image
                  class="rounded-none"
                  src="https://nmsr.nickac.dev/face/{account.uuid}"
                  alt={account.username} />
                <Avatar.Fallback>
                  {account.username.slice(0, 2).toUpperCase()}
                </Avatar.Fallback>
              </Avatar.Root>
            </Item.Media>

            <Item.Content class="min-w-0">
              <Item.Title>
                {account.username}
                {#if account.primary}
                  <Badge variant="default">Primary</Badge>
                {/if}
              </Item.Title>
              <p class="text-xs break-all text-muted-foreground">{account.uuid}</p>

              <Tooltip.Root>
                <Tooltip.Trigger class="w-fit text-xs text-muted-foreground tabular-nums">
                  Synced

                  {formatDistanceStrict(account.syncedAt, currentTime, {
                    addSuffix: true,
                    in: tz(Intl.DateTimeFormat().resolvedOptions().timeZone)
                  })}
                </Tooltip.Trigger>
                <Tooltip.Content
                  class="border glass bg-transparent p-4 text-sm text-foreground glass-bg-popover performance:bg-popover [&>div:last-child]:hidden">
                  <p>
                    {dateFormat(account.syncedAt, "dd MMMM yyyy 'at' HH:mm", {
                      in: tz(Intl.DateTimeFormat().resolvedOptions().timeZone)
                    })}
                  </p>
                </Tooltip.Content>
              </Tooltip.Root>
            </Item.Content>

            <Item.Actions />
          </Item.Root>
        {/each}
      </Item.Group>
    {:else}
      <Empty.Root class="border">
        <Empty.Header>
          <Empty.Title>No Minecraft accounts</Empty.Title>
          <Empty.Description>Sync to import the Minecraft accounts connected to your MC-ID profile</Empty.Description>
        </Empty.Header>
      </Empty.Root>
    {/if}
  </div>
</Tooltip.Provider>
