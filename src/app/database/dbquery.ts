import { Repository, SelectQueryBuilder, ObjectLiteral } from 'typeorm';

const excludedFields = ['page', 'sort', 'limit', 'fields', 'password'];

export interface QueryString {
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
  [key: string]: any;
}

function isQueryBuilder<T extends ObjectLiteral>(
  source: Repository<T> | SelectQueryBuilder<T>,
): source is SelectQueryBuilder<T> {
  return (source as SelectQueryBuilder<T>).getQuery !== undefined;
}

export class BaseDBQuery<T extends ObjectLiteral> {
  public query: SelectQueryBuilder<T>;
  public queryString: QueryString;
  public page?: number;

  constructor(
    source: Repository<T> | SelectQueryBuilder<T>,
    alias: string,
    queryString: QueryString,
  ) {
    if (isQueryBuilder(source)) {
      this.query = source;
    } else {
      this.query = source.createQueryBuilder(alias);
    }
    this.queryString = queryString;
  }

  filter(): this {
    const filteredQueryObj = { ...this.queryString };
    excludedFields.forEach((el) => delete filteredQueryObj[el]);

    Object.entries(filteredQueryObj).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        // Handle operators like gte, lte, gt, lt
        Object.entries(value).forEach(([op, val]) => {
          switch (op) {
            case 'gte':
              this.query.andWhere(`${this.query.alias}.${key} >= :${key}_gte`, {
                [`${key}_gte`]: val,
              });
              break;
            case 'gt':
              this.query.andWhere(`${this.query.alias}.${key} > :${key}_gt`, {
                [`${key}_gt`]: val,
              });
              break;
            case 'lte':
              this.query.andWhere(`${this.query.alias}.${key} <= :${key}_lte`, {
                [`${key}_lte`]: val,
              });
              break;
            case 'lt':
              this.query.andWhere(`${this.query.alias}.${key} < :${key}_lt`, {
                [`${key}_lt`]: val,
              });
              break;
          }
        });
      } else if (typeof value === 'string' && value.includes(',')) {
        // Handle IN queries e.g. category=math,science
        this.query.andWhere(`${this.query.alias}.${key} IN (:...${key})`, {
          [key]: value.split(','),
        });
      } else if (typeof value === 'string') {
        // Default partial search for strings
        this.query.andWhere(`${this.query.alias}.${key} ILIKE :${key}`, {
          [key]: `%${value}%`,
        });
      } else {
        // Equality check for numbers / booleans
        this.query.andWhere(`${this.query.alias}.${key} = :${key}`, {
          [key]: value,
        });
      }
    });

    return this;
  }

  sort(): this {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').map((s) => s.trim());
      sortBy.forEach((s) => {
        const order: 'ASC' | 'DESC' = s.startsWith('-') ? 'DESC' : 'ASC';
        const field = s.replace(/^-/, '');
        this.query.addOrderBy(`${this.query.alias}.${field}`, order);
      });
    } else {
      this.query.addOrderBy(`${this.query.alias}.createdAt`, 'DESC');
    }
    return this;
  }

  limitFields(): this {
    if (this.queryString.fields) {
      const fields = this.queryString.fields
        .split(',')
        .map((f) => `${this.query.alias}.${f}`);
      this.query.select(fields);
    }
    return this;
  }

  paginate(): this {
    const page = parseInt(this.queryString.page || '1', 10);
    let limit = parseInt(this.queryString.limit || '100', 10);
    if (limit > 1000) limit = 1000;

    const skip = (page - 1) * limit;

    this.query.skip(skip).take(limit);
    this.page = page;
    return this;
  }

  async getMany(): Promise<T[]> {
    return await this.query.getMany();
  }

  async count(): Promise<number> {
    return await this.query.getCount();
  }
}

export class DBQuery<T extends ObjectLiteral> extends BaseDBQuery<T> {
  constructor(
    source: Repository<T> | SelectQueryBuilder<T>,
    alias: string,
    queryString: QueryString,
  ) {
    super(source, alias, queryString);
  }
}
