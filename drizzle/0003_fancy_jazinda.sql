CREATE TABLE "rate_limit_request" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"api_key_request_id" text NOT NULL,
	"requested_max" integer NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"review_note" text,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rate_limit_request" ADD CONSTRAINT "rate_limit_request_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_limit_request" ADD CONSTRAINT "rate_limit_request_api_key_request_id_api_key_request_id_fk" FOREIGN KEY ("api_key_request_id") REFERENCES "public"."api_key_request"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_limit_request" ADD CONSTRAINT "rate_limit_request_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "rate_limit_request_pending_uidx" ON "rate_limit_request" USING btree ("user_id") WHERE "rate_limit_request"."status" = 'pending';--> statement-breakpoint
CREATE INDEX "rate_limit_request_apiKeyRequestId_idx" ON "rate_limit_request" USING btree ("api_key_request_id");--> statement-breakpoint
CREATE INDEX "rate_limit_request_status_idx" ON "rate_limit_request" USING btree ("status");