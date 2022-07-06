import { Injectable } from "@nestjs/common";
import { Ability, AbilityBuilder, AbilityClass, ExtractSubjectType, InferSubjects } from "@casl/ability";
import { Client } from "../../clients/entities/client.entity";
import { User } from "../../users/entities/user.entity";
import { Order } from "../../orders/entities/order.entity";
import { Action } from "./action";
import { Authority } from "./authority";
import { Product } from "../../products/entities/product.entity";
import { Ean } from "../../ean/entities/ean.entity";

type Subjects = InferSubjects<typeof Client | typeof User | typeof Order | typeof Product | typeof Ean | "all">

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<Ability<[Action, Subjects]>>(Ability as AbilityClass<AppAbility>);

    if (user.authorities?.includes(Authority.ADMIN)) {
      can(Action.MANAGE, "all");
    }

    if (user.authorities?.includes(Authority.USER_SELLER)) {
      can(Action.READ, User);
      can(Action.UPDATE, User, ["username", "email", "firstName", "lastName", "client"]);

      can(Action.READ, Order);
      can(Action.UPDATE, Order, ["refunded", "editable", "orderLines"]);

      can(Action.READ, Client);
      can(Action.UPDATE, Client);

      can(Action.MANAGE, Ean);
    }

    can(Action.READ, User, {id: user.id});
    can(Action.UPDATE, User, {id: user.id});

    if (user.clientId) {
      can(Action.READ, Order, {clientId: user.clientId});
      can(Action.UPDATE, Order, ["orderLines"], {clientId: user.clientId});
    }

    can(Action.READ, Client, {userId: user.id});

    return build({
      detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
