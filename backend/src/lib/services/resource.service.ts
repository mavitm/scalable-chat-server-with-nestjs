import { Model } from 'mongoose';

export class FilterModel {
  page?: number;
  limit?: number;
  sort?: string;
  sortBy?: string;
  query?: object;
}

/**
 * mongoose crud process
 */
export class ResourceService<
  T extends any,
  CreateDto extends any | object,
  UpdateDto extends any | object,
> {
  constructor(protected readonly mongoModel: Model<T>) {}
  defaultQuery = {
    page: 1,
    limit: 50,
    sort: 'ASC',
    sortBy: 'created',
    query: {},
    searchBy: 'name',
  };
  async create(model: CreateDto): Promise<T> {
    const createdModel = new this.mongoModel(model);
    return await createdModel.save();
  }
  async findById(id: string): Promise<T> {
    return await this.mongoModel.findOne({ _id: id }).exec();
  }
  async findAll(query?: FilterModel): Promise<T[]> {
    if (!Object.prototype.hasOwnProperty.call(query, 'page')) {
      query.page = this.defaultQuery.page;
    }
    if (!Object.prototype.hasOwnProperty.call(query, 'limit')) {
      query.limit = this.defaultQuery.limit;
    }
    if (query.limit < 5) {
      query.limit = 5;
    } else if (query.limit > 100) {
      query.limit = 100;
    }

    if (!Object.prototype.hasOwnProperty.call(query, 'query')) {
      query.query = this.defaultQuery.query;
    }

    if (!Object.prototype.hasOwnProperty.call(query, 'sortBy')) {
      query.sortBy = this.defaultQuery.sortBy;
    }
    if (!Object.prototype.hasOwnProperty.call(query, 'sort')) {
      query.sort = this.defaultQuery.sort;
    }
    const orderBy = {};
    orderBy[query.sortBy] = query.sort;

    return await this.mongoModel
      .find(query.query)
      .skip(query.limit * (query.page - 1))
      .limit(query.limit)
      .sort(orderBy)
      .exec();
  }
  async update(id: string, dto: UpdateDto): Promise<T> {
    let newModel = this.findById(id);
    newModel = Object.assign(newModel, dto);
    return await this.mongoModel
      .findByIdAndUpdate(id, newModel, { new: true })
      .exec();
  }
  async delete(id: string): Promise<T> {
    return await this.mongoModel.findByIdAndRemove({ _id: id }).exec();
  }
}
