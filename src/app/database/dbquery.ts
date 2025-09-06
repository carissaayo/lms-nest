import { Model, Document } from 'mongoose';

const excludedFields = ['page', 'sort', 'limit', 'fields', 'password'];

export interface QueryString {
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
  [key: string]: any;
}

export class MongooseQuery<T extends Document> {
  public query: any;
  public queryString: QueryString;
  public page?: number;

  constructor(model: Model<T>, queryString: QueryString) {
    this.query = model.find();
    this.queryString = queryString;
  }

  filter(): this {
    const filteredQueryObj = { ...this.queryString };
    excludedFields.forEach((el) => delete filteredQueryObj[el]);

    const mongoQuery: any = {};

    Object.entries(filteredQueryObj).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        // Handle operators like gte, lte, gt, lt
        Object.entries(value).forEach(([op, val]) => {
          switch (op) {
            case 'gte':
              mongoQuery[key] = { ...mongoQuery[key], $gte: val };
              break;
            case 'gt':
              mongoQuery[key] = { ...mongoQuery[key], $gt: val };
              break;
            case 'lte':
              mongoQuery[key] = { ...mongoQuery[key], $lte: val };
              break;
            case 'lt':
              mongoQuery[key] = { ...mongoQuery[key], $lt: val };
              break;
            case 'ne':
              mongoQuery[key] = { ...mongoQuery[key], $ne: val };
              break;
          }
        });
      } else if (typeof value === 'string' && value.includes(',')) {
        // Handle IN queries e.g. category=math,science
        mongoQuery[key] = { $in: value.split(',') };
      } else if (typeof value === 'string') {
        // Default partial search for strings
        mongoQuery[key] = { $regex: value, $options: 'i' };
      } else {
        // Equality check for numbers / booleans
        mongoQuery[key] = value;
      }
    });

    this.query = this.query.find(mongoQuery);
    return this;
  }

  sort(): this {
    if (this.queryString.sort) {
      const sortBy: any = {};
      this.queryString.sort.split(',').forEach((s) => {
        const trimmed = s.trim();
        const order = trimmed.startsWith('-') ? -1 : 1;
        const field = trimmed.replace(/^-/, '');
        sortBy[field] = order;
      });
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort({ createdAt: -1 });
    }
    return this;
  }

  limitFields(): this {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    }
    return this;
  }

  paginate(): this {
    const page = parseInt(this.queryString.page || '1', 10);
    let limit = parseInt(this.queryString.limit || '100', 10);
    if (limit > 1000) limit = 1000;

    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.page = page;
    return this;
  }

  populate(path: string, select?: string): this {
    this.query = this.query.populate(path, select);
    return this;
  }

  async exec(): Promise<T[]> {
    return await this.query.exec();
  }

  async count(): Promise<number> {
    const countQuery = this.query.model.find(this.query.getFilter());
    return await countQuery.countDocuments();
  }
}

export class DBQuery<T extends Document> extends MongooseQuery<T> {
  constructor(model: Model<T>, queryString: QueryString) {
    super(model, queryString);
  }
}
