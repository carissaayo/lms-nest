"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBQuery = exports.BaseDBQuery = void 0;
const excludedFields = ['page', 'sort', 'limit', 'fields', 'password'];
function isQueryBuilder(source) {
    return source.getQuery !== undefined;
}
class BaseDBQuery {
    constructor(source, alias, queryString) {
        if (isQueryBuilder(source)) {
            this.query = source;
        }
        else {
            this.query = source.createQueryBuilder(alias);
        }
        this.queryString = queryString;
    }
    filter() {
        const filteredQueryObj = { ...this.queryString };
        excludedFields.forEach((el) => delete filteredQueryObj[el]);
        Object.entries(filteredQueryObj).forEach(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
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
            }
            else if (typeof value === 'string' && value.includes(',')) {
                this.query.andWhere(`${this.query.alias}.${key} IN (:...${key})`, {
                    [key]: value.split(','),
                });
            }
            else if (typeof value === 'string') {
                this.query.andWhere(`${this.query.alias}.${key} ILIKE :${key}`, {
                    [key]: `%${value}%`,
                });
            }
            else {
                this.query.andWhere(`${this.query.alias}.${key} = :${key}`, {
                    [key]: value,
                });
            }
        });
        return this;
    }
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').map((s) => s.trim());
            sortBy.forEach((s) => {
                const order = s.startsWith('-') ? 'DESC' : 'ASC';
                const field = s.replace(/^-/, '');
                this.query.addOrderBy(`${this.query.alias}.${field}`, order);
            });
        }
        else {
            this.query.addOrderBy(`${this.query.alias}.createdAt`, 'DESC');
        }
        return this;
    }
    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields
                .split(',')
                .map((f) => `${this.query.alias}.${f}`);
            this.query.select(fields);
        }
        return this;
    }
    paginate() {
        const page = parseInt(this.queryString.page || '1', 10);
        let limit = parseInt(this.queryString.limit || '100', 10);
        if (limit > 1000)
            limit = 1000;
        const skip = (page - 1) * limit;
        this.query.skip(skip).take(limit);
        this.page = page;
        return this;
    }
    async getMany() {
        return await this.query.getMany();
    }
    async count() {
        return await this.query.getCount();
    }
}
exports.BaseDBQuery = BaseDBQuery;
class DBQuery extends BaseDBQuery {
    constructor(source, alias, queryString) {
        super(source, alias, queryString);
    }
}
exports.DBQuery = DBQuery;
//# sourceMappingURL=dbquery.js.map