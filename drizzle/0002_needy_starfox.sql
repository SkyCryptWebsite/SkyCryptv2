CREATE TABLE "api_key_request" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"use_case" text NOT NULL,
	"description" text NOT NULL,
	"url" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"review_note" text,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"api_key_id" text,
	"terms_accepted_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "developer_mode" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "api_key_request" ADD CONSTRAINT "api_key_request_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_key_request" ADD CONSTRAINT "api_key_request_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_key_request" ADD CONSTRAINT "api_key_request_api_key_id_apikey_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."apikey"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "api_key_request_open_uidx" ON "api_key_request" USING btree ("user_id") WHERE "api_key_request"."status" in ('pending', 'approved');--> statement-breakpoint
CREATE INDEX "api_key_request_status_idx" ON "api_key_request" USING btree ("status");