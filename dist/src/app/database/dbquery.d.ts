import { Repository, SelectQueryBuilder, ObjectLiteral } from 'typeorm';
export interface QueryString {
    page?: string;
    sort?: string;
    limit?: string;
    fields?: string;
    [key: string]: any;
}
export declare class BaseDBQuery<T extends ObjectLiteral> {
    query: SelectQueryBuilder<T>;
    queryString: QueryString;
    page?: number;
    constructor(source: Repository<T> | SelectQueryBuilder<T>, alias: string, queryString: QueryString);
    filter(): this;
    sort(): this;
    limitFields(): this;
    paginate(): this;
    getMany(): Promise<T[]>;
    count(): Promise<number>;
}
export declare class DBQuery<T extends ObjectLiteral> extends BaseDBQuery<T> {
    constructor(source: Repository<T> | SelectQueryBuilder<T>, alias: string, queryString: QueryString);
}
