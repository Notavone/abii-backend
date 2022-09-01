import {MigrationInterface, QueryRunner} from "typeorm";

export class buyPrice1662013311253 implements MigrationInterface {
    name = 'buyPrice1662013311253'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`product\` ADD \`buyPrice\` float NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`order\` ADD \`buyPrice\` decimal(10,2) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`order\` DROP COLUMN \`buyPrice\``);
        await queryRunner.query(`ALTER TABLE \`product\` DROP COLUMN \`buyPrice\``);
    }

}
