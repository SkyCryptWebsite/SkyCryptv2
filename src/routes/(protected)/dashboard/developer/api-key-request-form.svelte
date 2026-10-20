<script lang="ts">
  import { resolve } from "$app/paths";
  import { Button } from "$ui/button";
  import * as Field from "$ui/field";
  import { Input } from "$ui/input";
  import * as Select from "$ui/select";
  import { Spinner } from "$ui/spinner";
  import { Textarea } from "$ui/textarea";
  import { toast } from "svelte-sonner";
  import Captcha from "#lib/components/Captcha.svelte";
  import { apiKeyRequestSchema } from "#lib/shared/api-key-request";
  import { API_USE_CASES, type ApiUseCase } from "#lib/shared/constants/developer";
  import { submitApiKeyRequest } from "./developer.remote";

  const { fields } = submitApiKeyRequest;
  let captchaToken = $state<string>();
  // Turnstile tokens are single-use, so a failed submit needs a fresh widget.
  let captchaKey = $state(0);

  const submitting = $derived(!!submitApiKeyRequest.pending);
  const formIssues = $derived(fields.allIssues()?.filter(({ path }) => path.length === 0));
  const useCase = $derived(fields.useCase.value());

  function resetCaptcha() {
    captchaToken = undefined;
    captchaKey++;
  }
</script>

<form
  {...submitApiKeyRequest.preflight(apiKeyRequestSchema).enhance(async ({ submit }) => {
    try {
      if (await submit()) toast.success("Request sent. We’ll review it soon.");
      else resetCaptcha();
    } catch {
      toast.error("Unable to send your request. Please try again.");
      resetCaptcha();
    }
  })}>
  <Field.FieldGroup>
    <Field.Field data-invalid={!!fields.name.issues()} data-disabled={submitting}>
      <Field.FieldLabel for="api-request-name">Project name</Field.FieldLabel>
      <Input id="api-request-name" {...fields.name.as("text")} required maxlength={32} disabled={submitting} />
      <Field.FieldError errors={fields.name.issues()} />
    </Field.Field>

    <Field.Field data-invalid={!!fields.useCase.issues()} data-disabled={submitting}>
      <Field.FieldLabel for="api-request-use-case">What are you building?</Field.FieldLabel>
      <Select.Root
        type="single"
        name={fields.useCase.as("select").name}
        value={useCase ?? ""}
        onValueChange={(value) => fields.useCase.set(value as ApiUseCase)}
        disabled={submitting}>
        <Select.Trigger
          id="api-request-use-case"
          class="w-full"
          aria-invalid={fields.useCase.as("select")["aria-invalid"]}>
          {API_USE_CASES.find(({ value }) => value === useCase)?.label ?? "Choose a project type"}
        </Select.Trigger>
        <Select.Content>
          {#each API_USE_CASES as option (option.value)}
            <Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
      <Field.FieldError errors={fields.useCase.issues()} />
    </Field.Field>

    <Field.Field data-invalid={!!fields.url.issues()} data-disabled={submitting}>
      <Field.FieldLabel for="api-request-url">Website or GitHub link</Field.FieldLabel>
      <Input
        id="api-request-url"
        {...fields.url.as("url")}
        required
        maxlength={300}
        placeholder="https://github.com/username/project"
        disabled={submitting}
        aria-describedby="api-request-url-description" />
      <Field.FieldDescription id="api-request-url-description">
        If your project is private, link your GitHub profile instead.
      </Field.FieldDescription>
      <Field.FieldError errors={fields.url.issues()} />
    </Field.Field>

    <Field.Field data-invalid={!!fields.description.issues()} data-disabled={submitting}>
      <Field.FieldLabel for="api-request-description">Description</Field.FieldLabel>
      <Textarea
        id="api-request-description"
        {...fields.description.as("text")}
        required
        maxlength={1000}
        rows={5}
        disabled={submitting}
        aria-describedby="api-request-description-help" />
      <Field.FieldDescription id="api-request-description-help">
        Tell us what your project does, which data it needs and roughly how many requests it will make.
        <span class="tabular-nums">({fields.description.value()?.length ?? 0}/1000)</span>
      </Field.FieldDescription>
      <Field.FieldError errors={fields.description.issues()} />
    </Field.Field>

    <Field.Field orientation="horizontal" data-invalid={!!fields.acceptTerms.issues()} data-disabled={submitting}>
      <input
        id="api-request-terms"
        {...fields.acceptTerms.as("checkbox")}
        required
        disabled={submitting}
        class="mt-0.5 size-4 shrink-0 accent-primary" />
      <Field.FieldContent>
        <Field.FieldLabel for="api-request-terms" class="font-normal">
          I’ve read and agree to the <a
            href={resolve("/(pages)/api-policy")}
            target="_blank"
            class="font-medium underline underline-offset-4">API Policy</a
          >,
          <a
            href={resolve("/(pages)/terms-of-service")}
            target="_blank"
            class="font-medium underline underline-offset-4">Terms of Service</a>
          and
          <a href={resolve("/(pages)/privacy-policy")} target="_blank" class="font-medium underline underline-offset-4"
            >Privacy Policy</a
          >.
        </Field.FieldLabel>
        <Field.FieldError errors={fields.acceptTerms.issues()} />
      </Field.FieldContent>
    </Field.Field>

    <Field.Field data-invalid={!!fields._captchaToken.issues()}>
      <input {...fields._captchaToken.as("hidden", captchaToken ?? "")} />
      {#key captchaKey}
        <Captcha bind:turnstileToken={captchaToken} />
      {/key}
      <Field.FieldError errors={fields._captchaToken.issues()} />
    </Field.Field>

    <Field.FieldError errors={formIssues} />

    <Button type="submit" size="lg" class="w-fit" disabled={submitting || !captchaToken} aria-busy={submitting}>
      {#if submitting}<Spinner data-icon="inline-start" />{/if}
      {submitting ? "Sending request…" : "Request API access"}
    </Button>
  </Field.FieldGroup>
</form>
