<script lang="ts">
  import { Button } from "$ui/button";
  import { Calendar } from "$ui/calendar";
  import { Input } from "$ui/input";
  import * as Popover from "$ui/popover";
  import { fromDate, getLocalTimeZone, toCalendarDate, today, type DateValue } from "@internationalized/date";
  import CalendarIcon from "@lucide/svelte/icons/calendar";
  import { cn } from "#lib/shared/utils";

  type Props = {
    /** In the viewer's local time zone; `null` when unset. */
    value: Date | null;
    id?: string;
    placeholder?: string;
    /** Disallow days before today, e.g. when scheduling. */
    future?: boolean;
    class?: string;
  };

  let { value = $bindable(), id, placeholder = "Pick a date", future = false, class: className }: Props = $props();

  const zone = getLocalTimeZone();
  const pad = (n: number) => String(n).padStart(2, "0");
  const day = $derived<DateValue | undefined>(value ? toCalendarDate(fromDate(value, zone)) : undefined);
  const time = $derived(value ? `${pad(value.getHours())}:${pad(value.getMinutes())}` : "12:00");
  const label = $derived(
    value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(value) : placeholder
  );

  function update(nextDay: DateValue | undefined, nextTime: string) {
    if (!nextDay) {
      value = null;
      return;
    }
    const [hours, minutes] = nextTime.split(":").map(Number);
    const date = nextDay.toDate(zone);
    date.setHours(hours || 0, minutes || 0, 0, 0);
    value = date;
  }
</script>

<Popover.Root>
  <Popover.Trigger {id}>
    {#snippet child({ props })}
      <Button
        variant="outline"
        {...props}
        class={cn("w-full justify-start font-normal", !value && "text-muted-foreground", className)}>
        <CalendarIcon data-icon="inline-start" />
        {label}
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="w-auto p-0" align="start">
    <Calendar
      type="single"
      value={day}
      onValueChange={(next) => update(next, time)}
      minValue={future ? today(zone) : undefined}
      captionLayout="dropdown" />
    <div class="flex items-center gap-2 border-t p-3">
      <Input
        type="time"
        aria-label="Time"
        value={time}
        onchange={(event) => update(day ?? today(zone), event.currentTarget.value)} />
      <Button variant="ghost" size="sm" onclick={() => (value = null)} disabled={!value}>Clear</Button>
    </div>
    <p class="px-3 pb-3 text-xs text-muted-foreground">Times are in your time zone ({zone}).</p>
  </Popover.Content>
</Popover.Root>
