CREATE TABLE "discord_profile" (
	"user_id" text PRIMARY KEY NOT NULL,
	"discord_user_id" text NOT NULL,
	"username" text,
	"primary_guild" jsonb,
	"avatar_hash" text,
	"banner_hash" text,
	"avatar_decoration_hash" text,
	"synced_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "discord_profile_discord_user_id_unique" UNIQUE("discord_user_id")
);
--> statement-breakpoint
CREATE TABLE "patreon_creator_token" (
	"campaign_id" text PRIMARY KEY NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"expires_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patreon_membership" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"patreon_user_id" text NOT NULL,
	"member_id" text NOT NULL,
	"campaign_id" text NOT NULL,
	"lifetime_support_cents" integer DEFAULT 0 NOT NULL,
	"currently_entitled_amount_cents" integer DEFAULT 0 NOT NULL,
	"patron_status" text,
	"entitlement_level" integer DEFAULT 0 NOT NULL,
	"verified_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "minecraft_account" (
	"account_id" text NOT NULL,
	"uuid" text NOT NULL,
	"username" text NOT NULL,
	"primary" boolean NOT NULL,
	"synced_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "minecraft_account_account_id_uuid_pk" PRIMARY KEY("account_id","uuid")
);
--> statement-breakpoint
CREATE TABLE "profile_emoji" (
	"uuid" text PRIMARY KEY NOT NULL,
	"emoji" text NOT NULL,
	"entitlement_level" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profile_emoji_entitlement_check" CHECK ("profile_emoji"."entitlement_level" between 1 and 2)
);
--> statement-breakpoint
ALTER TABLE "apikey" ALTER COLUMN "enabled" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "apikey" ALTER COLUMN "rate_limit_time_window" SET DEFAULT 300000;--> statement-breakpoint
ALTER TABLE "apikey" ALTER COLUMN "rate_limit_max" SET DEFAULT 300;--> statement-breakpoint
ALTER TABLE "discord_profile" ADD CONSTRAINT "discord_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patreon_membership" ADD CONSTRAINT "patreon_membership_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "minecraft_account" ADD CONSTRAINT "minecraft_account_account_id_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "patreon_membership_userId_uidx" ON "patreon_membership" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "patreon_membership_memberId_uidx" ON "patreon_membership" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "patreon_membership_patreonUserId_idx" ON "patreon_membership" USING btree ("patreon_user_id");