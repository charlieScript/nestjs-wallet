import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUser1703837241117 implements MigrationInterface {
    name = 'UpdateUser1703837241117'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "username" TO "email"`);
        await queryRunner.query(`ALTER TYPE "public"."transaction_txn_purpose_enum" RENAME TO "transaction_txn_purpose_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."transaction_txn_purpose_enum" AS ENUM('deposit', 'transfer', 'reversal', 'withdrawal')`);
        await queryRunner.query(`ALTER TABLE "transaction" ALTER COLUMN "txn_purpose" TYPE "public"."transaction_txn_purpose_enum" USING "txn_purpose"::"text"::"public"."transaction_txn_purpose_enum"`);
        await queryRunner.query(`DROP TYPE "public"."transaction_txn_purpose_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."transaction_txn_purpose_enum_old" AS ENUM('deposit', 'transfer', 'reversal')`);
        await queryRunner.query(`ALTER TABLE "transaction" ALTER COLUMN "txn_purpose" TYPE "public"."transaction_txn_purpose_enum_old" USING "txn_purpose"::"text"::"public"."transaction_txn_purpose_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."transaction_txn_purpose_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."transaction_txn_purpose_enum_old" RENAME TO "transaction_txn_purpose_enum"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "email" TO "username"`);
    }

}
