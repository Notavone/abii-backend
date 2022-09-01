import {MigrationInterface, QueryRunner} from "typeorm";

export class db1661951686907 implements MigrationInterface {
    name = 'db1661951686907'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`client\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`balance\` float NOT NULL DEFAULT '0', \`subscribedUntil\` datetime NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` int NULL, UNIQUE INDEX \`REL_ad3b4bf8dd18a1d467c5c0fc13\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`uuid\` varchar(36) NOT NULL, \`activationKey\` varchar(36) NOT NULL, \`resetKey\` varchar(255) NULL, \`activated\` tinyint NOT NULL DEFAULT 0, \`username\` varchar(255) NOT NULL, \`firstName\` varchar(255) NOT NULL, \`lastName\` varchar(255) NOT NULL, \`authorities\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), UNIQUE INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` (\`username\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`notification_token\` (\`id\` int NOT NULL AUTO_INCREMENT, \`pushSubscription\` text NOT NULL, \`active\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` int NULL, UNIQUE INDEX \`REL_8c1dede7ba7256bff4e6155093\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`stock_change\` (\`id\` int NOT NULL AUTO_INCREMENT, \`previousStock\` int NOT NULL, \`newStock\` int NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`productId\` int NULL, \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product_category\` (\`id\` int NOT NULL AUTO_INCREMENT, \`label\` varchar(255) NOT NULL, \`icon\` varchar(255) NOT NULL DEFAULT 'help_outline', \`order\` int NOT NULL DEFAULT '999', \`display\` tinyint NOT NULL DEFAULT 1, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`price\` float NOT NULL, \`price_red\` float NOT NULL, \`available\` tinyint NOT NULL DEFAULT 0, \`type\` enum ('0', '1', '2') NOT NULL, \`image\` text NULL, \`useStock\` tinyint NULL DEFAULT 0, \`stock\` int NULL DEFAULT '0', \`alert\` int NULL DEFAULT '0', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ean\` (\`id\` int NOT NULL AUTO_INCREMENT, \`value\` varchar(255) NOT NULL, \`quantity\` int NOT NULL DEFAULT '1', \`comment\` varchar(255) NULL, \`createdDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`productId\` int NULL, UNIQUE INDEX \`IDX_1168bc58e5cd22352cb65e8d7f\` (\`value\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`order\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`editable\` tinyint NOT NULL DEFAULT 1, \`refunded\` tinyint NOT NULL DEFAULT 0, \`total\` decimal(10,2) NOT NULL, \`clientId\` int NULL, \`sellerId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`order_line\` (\`id\` int NOT NULL AUTO_INCREMENT, \`quantity\` int NOT NULL, \`orderId\` int NULL, \`productId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product_categories_product_category\` (\`productId\` int NOT NULL, \`productCategoryId\` int NOT NULL, INDEX \`IDX_37c2bc279249bec81521f8fe89\` (\`productId\`), INDEX \`IDX_8862dee67b712ea20963c464e8\` (\`productCategoryId\`), PRIMARY KEY (\`productId\`, \`productCategoryId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`client\` ADD CONSTRAINT \`FK_ad3b4bf8dd18a1d467c5c0fc13a\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`notification_token\` ADD CONSTRAINT \`FK_8c1dede7ba7256bff4e6155093c\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`stock_change\` ADD CONSTRAINT \`FK_4fff81674b876d73a07fb6f72bd\` FOREIGN KEY (\`productId\`) REFERENCES \`product\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`stock_change\` ADD CONSTRAINT \`FK_a646e3e03f691454be6d99caef0\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ean\` ADD CONSTRAINT \`FK_13ce12898add4acfe18c0d3c206\` FOREIGN KEY (\`productId\`) REFERENCES \`product\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order\` ADD CONSTRAINT \`FK_9b27855a9c2ade186e5c55d1ec3\` FOREIGN KEY (\`clientId\`) REFERENCES \`client\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order\` ADD CONSTRAINT \`FK_8a583acc24e13bcf84b1b9d0d20\` FOREIGN KEY (\`sellerId\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_line\` ADD CONSTRAINT \`FK_239cfca2a55b98b90b6bef2e44f\` FOREIGN KEY (\`orderId\`) REFERENCES \`order\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_line\` ADD CONSTRAINT \`FK_8deef19c65f771528352b0f5a55\` FOREIGN KEY (\`productId\`) REFERENCES \`product\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_categories_product_category\` ADD CONSTRAINT \`FK_37c2bc279249bec81521f8fe89b\` FOREIGN KEY (\`productId\`) REFERENCES \`product\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`product_categories_product_category\` ADD CONSTRAINT \`FK_8862dee67b712ea20963c464e88\` FOREIGN KEY (\`productCategoryId\`) REFERENCES \`product_category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`product_categories_product_category\` DROP FOREIGN KEY \`FK_8862dee67b712ea20963c464e88\``);
        await queryRunner.query(`ALTER TABLE \`product_categories_product_category\` DROP FOREIGN KEY \`FK_37c2bc279249bec81521f8fe89b\``);
        await queryRunner.query(`ALTER TABLE \`order_line\` DROP FOREIGN KEY \`FK_8deef19c65f771528352b0f5a55\``);
        await queryRunner.query(`ALTER TABLE \`order_line\` DROP FOREIGN KEY \`FK_239cfca2a55b98b90b6bef2e44f\``);
        await queryRunner.query(`ALTER TABLE \`order\` DROP FOREIGN KEY \`FK_8a583acc24e13bcf84b1b9d0d20\``);
        await queryRunner.query(`ALTER TABLE \`order\` DROP FOREIGN KEY \`FK_9b27855a9c2ade186e5c55d1ec3\``);
        await queryRunner.query(`ALTER TABLE \`ean\` DROP FOREIGN KEY \`FK_13ce12898add4acfe18c0d3c206\``);
        await queryRunner.query(`ALTER TABLE \`stock_change\` DROP FOREIGN KEY \`FK_a646e3e03f691454be6d99caef0\``);
        await queryRunner.query(`ALTER TABLE \`stock_change\` DROP FOREIGN KEY \`FK_4fff81674b876d73a07fb6f72bd\``);
        await queryRunner.query(`ALTER TABLE \`notification_token\` DROP FOREIGN KEY \`FK_8c1dede7ba7256bff4e6155093c\``);
        await queryRunner.query(`ALTER TABLE \`client\` DROP FOREIGN KEY \`FK_ad3b4bf8dd18a1d467c5c0fc13a\``);
        await queryRunner.query(`DROP INDEX \`IDX_8862dee67b712ea20963c464e8\` ON \`product_categories_product_category\``);
        await queryRunner.query(`DROP INDEX \`IDX_37c2bc279249bec81521f8fe89\` ON \`product_categories_product_category\``);
        await queryRunner.query(`DROP TABLE \`product_categories_product_category\``);
        await queryRunner.query(`DROP TABLE \`order_line\``);
        await queryRunner.query(`DROP TABLE \`order\``);
        await queryRunner.query(`DROP INDEX \`IDX_1168bc58e5cd22352cb65e8d7f\` ON \`ean\``);
        await queryRunner.query(`DROP TABLE \`ean\``);
        await queryRunner.query(`DROP TABLE \`product\``);
        await queryRunner.query(`DROP TABLE \`product_category\``);
        await queryRunner.query(`DROP TABLE \`stock_change\``);
        await queryRunner.query(`DROP INDEX \`REL_8c1dede7ba7256bff4e6155093\` ON \`notification_token\``);
        await queryRunner.query(`DROP TABLE \`notification_token\``);
        await queryRunner.query(`DROP INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` ON \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP INDEX \`REL_ad3b4bf8dd18a1d467c5c0fc13\` ON \`client\``);
        await queryRunner.query(`DROP TABLE \`client\``);
    }

}
