/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import mongoose, { Query } from 'mongoose';
import { Logger } from '@nestjs/common';

const excludedFields = ['page', 'sort', 'limit', 'fields', 'password'];

interface QueryString {
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
  state?: string;
  [key: string]: any;
}

interface RegexQuery {
  [key: string]: RegExp | mongoose.Types.ObjectId | any;
}

function buildRegexQuery(queryObj: QueryString): RegexQuery {
  const filteredQueryObj = { ...queryObj };
  excludedFields.forEach((el) => delete filteredQueryObj[el]);

  const regex: RegexQuery = {};
  for (const key in filteredQueryObj) {
    if (!Object.prototype.hasOwnProperty.call(filteredQueryObj, key)) continue;

    const value = filteredQueryObj[key];

    // Handle date objects with MongoDB operators already included
    if (
      key.toLowerCase().includes('date') &&
      typeof value === 'string' &&
      value.includes('$')
    ) {
      try {
        regex[key] = JSON.parse(value);
        continue;
      } catch {
        regex[key] = value;
        continue;
      }
    }

    // Convert simple comparison operators (gte, lte, etc.)
    if (
      typeof value === 'string' &&
      !value.includes('$') &&
      /\b(gte|gt|lte|lt)\b/g.test(value)
    ) {
      const transformedValue = value.replace(
        /\b(gte|gt|lte|lt)\b/g,
        (match) => `$${match}`,
      );
      try {
        regex[key] = JSON.parse(transformedValue);
        continue;
      } catch {
        regex[key] = value;
        continue;
      }
    }

    // Handle ObjectIds
    if (
      mongoose.Types.ObjectId.isValid(value) &&
      key.toLowerCase().includes('id') &&
      typeof key !== 'number'
    ) {
      regex[key] = new mongoose.Types.ObjectId(value);
    }

    // A) If value contains MongoDB operators
    else if (typeof value === 'string' && value.includes('$')) {
      try {
        regex[key] = JSON.parse(value);
        continue;
      } catch {
        regex[key] = value;
        continue;
      }
    }

    // B) If it's already an object
    else if (typeof value === 'object' && value !== null) {
      regex[key] = value;
    }

    // C) If it's a plain string
    else if (
      typeof value === 'string' &&
      !['false', 'true'].includes(value) &&
      !value.startsWith('[object ')
    ) {
      regex[key] = new RegExp(value, 'i');
    }

    // D) Fallback: store raw value
    else {
      regex[key] = value;
    }
  }

  return regex;
}

class BaseDBQuery {
  public query: Query<any, any>;
  public queryString: QueryString;
  public page?: number;
  protected readonly logger = new Logger(BaseDBQuery.name);

  constructor(query: Query<any, any>, queryString: QueryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter(): this {
    const regex = buildRegexQuery(this.queryString);
    // Combine existing base filter with the new filters
    this.query = this.query.find({
      ...(this.query.getFilter() || {}),
      ...regex,
    });
    return this;
  }

  sort(): this {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields(): this {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v -password');
    }
    return this;
  }

  paginate(): this {
    const page = parseInt(this.queryString.page || '1');
    let limit = parseInt(this.queryString.limit || '100', 10);
    if (limit > 1000) limit = 1000;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    this.page = page;
    return this;
  }
}

export class DBQuery extends BaseDBQuery {
  constructor(query: Query<any, any>, queryString: QueryString) {
    super(query, queryString);
    this.logger.debug('DBQuery initialized');
  }
}

export class DBQueryCount extends BaseDBQuery {
  public totalCount?: Promise<number>;

  constructor(query: Query<any, any>, queryString: QueryString) {
    super(query, queryString);
    this.logger.debug('DBQueryCount initialized');
  }

  count(): this {
    const regex = buildRegexQuery(this.queryString);
    this.totalCount = this.query
      .find({ isDeleted: false, ...regex })
      .countDocuments();
    return this;
  }
}
