import { MigrationInterface, QueryRunner } from "typeorm";

export class CardsFix1703845410582 implements MigrationInterface {
    name = 'CardsFix1703845410582'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "card_transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "external_reference" character varying NOT NULL, "transaction_id" uuid, CONSTRAINT "REL_3d49d69ac2d6075f3bfb927286" UNIQUE ("transaction_id"), CONSTRAINT "PK_b8134a1a069b742d44cfffe7418" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "card_transactions" ADD CONSTRAINT "FK_3d49d69ac2d6075f3bfb927286b" FOREIGN KEY ("transaction_id") REFERENCES "transaction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "card_transactions" DROP CONSTRAINT "FK_3d49d69ac2d6075f3bfb927286b"`);
        await queryRunner.query(`DROP TABLE "card_transactions"`);
    }

}
