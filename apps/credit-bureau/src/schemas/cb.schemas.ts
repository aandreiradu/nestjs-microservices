import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class CreditBureau extends AbstractDocument {
  @Prop()
  SSN: string;

  @Prop()
  fullName: string;

  @Prop()
  creditScore: number;
}

export const CreditBureauSchema = SchemaFactory.createForClass(CreditBureau);
