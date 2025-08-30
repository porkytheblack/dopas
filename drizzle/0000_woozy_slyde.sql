CREATE TABLE "model_outputs" (
	"id" serial PRIMARY KEY NOT NULL,
	"role" varchar(20),
	"answer" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tool_call_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"model_output_id" integer NOT NULL,
	"tool_id" varchar(255) NOT NULL,
	"tool" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tool_responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"model_output_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"args" jsonb NOT NULL,
	"tool_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tool_call_results" ADD CONSTRAINT "tool_call_results_model_output_id_model_outputs_id_fk" FOREIGN KEY ("model_output_id") REFERENCES "public"."model_outputs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_responses" ADD CONSTRAINT "tool_responses_model_output_id_model_outputs_id_fk" FOREIGN KEY ("model_output_id") REFERENCES "public"."model_outputs"("id") ON DELETE cascade ON UPDATE no action;