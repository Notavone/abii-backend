import { PartialType } from "@nestjs/swagger";
import { CreateEanDto } from "./create-ean.dto";

export class UpdateEanDto extends PartialType(CreateEanDto) {

}
