import { AbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { CreditBureau } from './schemas/cb.schemas';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';

@Injectable()
export class CreditBureauRepository extends AbstractRepository<CreditBureau> {
  protected readonly logger: Logger = new Logger(CreditBureauRepository.name);

  constructor(
    @InjectModel(CreditBureau.name) creditBureauModel: Model<CreditBureau>,
    @InjectConnection() connection: Connection,
  ) {
    super(creditBureauModel, connection);
  }
}
