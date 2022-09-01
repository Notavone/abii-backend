import {MigrationInterface, QueryRunner} from "typeorm";

export class db1662034351283 implements MigrationInterface {
    name = 'db1662034351283'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`notification_token\` DROP FOREIGN KEY \`FK_8c1dede7ba7256bff4e6155093c\``);
        await queryRunner.query(`ALTER TABLE \`notification_token\` ADD CONSTRAINT \`FK_8c1dede7ba7256bff4e6155093c\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`notification_token\` DROP FOREIGN KEY \`FK_8c1dede7ba7256bff4e6155093c\``);
        await queryRunner.query(`ALTER TABLE \`notification_token\` ADD CONSTRAINT \`FK_8c1dede7ba7256bff4e6155093c\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
