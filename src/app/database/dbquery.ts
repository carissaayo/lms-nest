import { Repository, SelectQueryBuilder, ObjectLiteral } from 'typeorm';

const excludedFields = ['page', 'sort', 'limit', 'fields', 'password'];

export interface QueryString {
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
  [key: string]: any;
}

export class BaseDBQuery<T extends ObjectLiteral> {
  public query: SelectQueryBuilder<T>;
  public queryString: QueryString;
  public page?: number;

  constructor(repo: Repository<T>, alias: string, queryString: QueryString) {
    this.query = repo.createQueryBuilder(alias);
    this.queryString = queryString;
  }

  filter(): this {
    const filteredQueryObj = { ...this.queryString };
    excludedFields.forEach((el) => delete filteredQueryObj[el]);

    Object.entries(filteredQueryObj).forEach(([key, value]) => {
      if (typeof value === 'string' && value.includes(',')) {
        this.query.andWhere(`${this.query.alias}.${key} IN (:...${key})`, {
          [key]: value.split(','),
        });
      } else {
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
}

export class DBQuery<T extends ObjectLiteral> extends BaseDBQuery<T> {
  constructor(repo: Repository<T>, alias: string, queryString: QueryString) {
    super(repo, alias, queryString);
  }

  async getMany() {
    return await this.query.getMany();
  }
}

export class DBQueryCount<T extends ObjectLiteral> extends BaseDBQuery<T> {
  constructor(repo: Repository<T>, alias: string, queryString: QueryString) {
    super(repo, alias, queryString);
  }

  async count(): Promise<number> {
    return await this.query.getCount();
  }
}
