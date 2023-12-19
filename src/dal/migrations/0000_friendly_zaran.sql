CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" date DEFAULT now() NOT NULL,
	"updated_at" date DEFAULT now() NOT NULL,
	"email" varchar NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
