<script lang="ts">
  import { buttonVariants } from "$src/lib/components/ui/button";
  import * as Item from "$ui/item";
  import ExternalLinkIcon from "@lucide/svelte/icons/external-link";

  interface Props {
    href: string;
    text: {
      title: string;
      description: string;
    };
    img: {
      src: string;
      alt: string;
    };
  }

  let { href, text, img }: Props = $props();
</script>

<Item.Root
  variant="outline"
  class="w-fit delay-75 duration-300 ease-out [a]:transition-[scale] [a]:interact:scale-95 standard:[a]:interact:bg-inherit">
  {#snippet child({ props })}
    <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
    <a {href} target="_blank" {...props}>
      <Item.Media variant="image">
        <img loading="lazy" src={img.src} alt={img.alt} />
      </Item.Media>
      <Item.Content>
        <Item.Title>SkyCrypt's {text.title}</Item.Title>
        <Item.Description>{text.description}</Item.Description>
      </Item.Content>
      <Item.Actions>
        <div class={buttonVariants({ variant: "outline" })}>
          <ExternalLinkIcon />
        </div>
      </Item.Actions>
    </a>
  {/snippet}
</Item.Root>
