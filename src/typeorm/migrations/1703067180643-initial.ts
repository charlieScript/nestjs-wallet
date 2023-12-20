import {MigrationInterface, QueryRunner} from "typeorm";

export class initial1703067180643 implements MigrationInterface {
    name = 'initial1703067180643'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "username" character varying NOT NULL, "password_hash" character varying NOT NULL, "pin" character varying, "merchant_active" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."transaction_txn_type_enum" AS ENUM('debit', 'credit')`);
        await queryRunner.query(`CREATE TYPE "public"."transaction_txn_purpose_enum" AS ENUM('deposit', 'transfer', 'reversal')`);
        await queryRunner.query(`CREATE TABLE "transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "txn_type" "public"."transaction_txn_type_enum" NOT NULL, "txn_purpose" "public"."transaction_txn_purpose_enum" NOT NULL, "amount" numeric(20,4) NOT NULL DEFAULT '0', "reference" uuid, "balance_before" numeric(20,4) NOT NULL DEFAULT '0', "balance_after" numeric(20,4) NOT NULL DEFAULT '0', "metadata" jsonb, "account_id" uuid, CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "account" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "balance" numeric(20,4) NOT NULL DEFAULT '0', "user_id" uuid, CONSTRAINT "REL_efef1e5fdbe318a379c06678c5" UNIQUE ("user_id"), CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_e2652fa8c16723c83a00fb9b17e" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "account" ADD CONSTRAINT "FK_efef1e5fdbe318a379c06678c51" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "account" DROP CONSTRAINT "FK_efef1e5fdbe318a379c06678c51"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_e2652fa8c16723c83a00fb9b17e"`);
        await queryRunner.query(`DROP TABLE "account"`);
        await queryRunner.query(`DROP TABLE "transaction"`);
        await queryRunner.query(`DROP TYPE "public"."transaction_txn_purpose_enum"`);
        await queryRunner.query(`DROP TYPE "public"."transaction_txn_type_enum"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
