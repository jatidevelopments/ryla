ALTER TABLE "characters" ADD COLUMN "lora_enabled" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "lora_models" ADD COLUMN "credits_charged" integer;--> statement-breakpoint
ALTER TABLE "lora_models" ADD COLUMN "credits_refunded" integer;