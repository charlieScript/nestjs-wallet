DO $$ BEGIN
 CREATE TYPE "txn_purpose" AS ENUM('DEPOSIT', 'REVERSAL', 'TRANSFER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "txn_type" AS ENUM('DEBIT', 'CREDIT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "accounts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" date DEFAULT now() NOT NULL,
	"updated_at" date DEFAULT now() NOT NULL,
	"balance" numeric(20, 4) NOT NULL,
	"user_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" date DEFAULT now() NOT NULL,
	"updated_at" date DEFAULT now() NOT NULL,
	"txn_type" "txn_type" NOT NULL,
	"txn_purpose" "txn_purpose" NOT NULL,
	"amount" numeric(20, 4) NOT NULL,
	"reference" uuid,
	"balance_before" numeric(20, 4) NOT NULL,
	"balance_after" numeric(20, 4) NOT NULL,
	"metadata" jsonb,
	"account_id" uuid,
	CONSTRAINT "transactions_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "username" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password" varchar NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");