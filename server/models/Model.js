const DbModel = require('./DbModel');
const validator = require('../services/validator');

class Model extends DbModel {

  // data for the table, can be different than actual table file data
  static modelData = {};

  // contains the structure for the database fields
  static fields = {};

  // contains the relations for the database
  static relations = {};

  properties = {};

  id = null;

  // constructor(data)
  constructor(data) {
    super();
    this.fill(data);

    return new Proxy(this, {
      get (target, prop) {
        if (prop in target) {
          return target[prop];
        } else if (prop in target.properties) {
          return target.properties[prop];
        } else if (prop in target.constructor.relations) {
          const relation = target.constructor.relations[prop];
          const keyValue = target.properties[relation.localKey] || target[relation.localKey]; // undefined
          switch (relation.type) {
            case "belongsTo":
              target.properties[prop] = relation.model.find(keyValue)
              break;
            case "hasMany":
              target.properties[prop] = relation.model.where(relation.foreignKey, keyValue)
              break;
            default:
              // code block
            }
            return target.properties[prop];
          } else {
            return undefined;
          }
        },
        set (target, prop, value) {
          if (target.constructor.fields[prop] !== undefined) target.properties[prop] = value;
          else target[prop] = value;
          return true;
        }
      });
    }

    // Fill properties based on supplied data
    fill(data) {
      const validated = this.constructor.validate(data,
        false);
      Object.assign(this.properties,
        validated);
      this.id = data.id;

    }

    save() {
      const newModel = this.constructor.updateOrCreate({
        id: this.id,
        ...this.properties,
      })
      this.fill(newModel[0])
    }

    static allRaw() {
      this.modelData = this.getTableData();
      return this.modelData;
    }

    static all() {
      return this.allRaw().map(item => new this(item));
    }

    static find(id,
      throwError = false) {
      if (Array.isArray(id)) {
        return this.where('id', id);
      }
      const items = this.allRaw();
      const index = items.findIndex(item => item.id == id);
      if (index == -1) {
        if (throwError) throw new Error(`Model with id ${id} not found`, 404)
        return null;
      }
      const model = new this(items[index]);
      return model;
    }

    static where(key, value) {
      const items = this.allRaw();
      return items.filter(item => item[key] == value).map(item => new this(item));
    }

    static whereFirst(key, value) {
      const items = this.where(key, value);
      return items.length ? items[0]: null;
    }

    // validates properties based on the fields and relations
    static validate(data,
      throwError = true) {
      return validator.validate(data,
        this.fields,
        throwError);
    }

    // static make
    static make(items, save = true) {
      let returnSingle = false;
      if (!Array.isArray(items)) returnSingle = true;
      items = this.prepItems(items);
      return returnSingle ? this.find(this.addData(items))[0]: this.find(this.addData(items));
    }

    // static prepMake
    static prepItems(items, includeId = false, forceId = false) {
      if (!Array.isArray(items)) items = [items];
      const self = this;
      return items.map((item) => {
        const newItem = self.validate(item);
        if (forceId && !item.id) throw new Error("Item doesn't have an id")
        if (includeId) newItem.id = item.id;
        return newItem;
      })
    }

    // static update
    static update(items,
      indexKey = 'id') {
      let returnSingle = false;
      if (!Array.isArray(items)) returnSingle = true;
      items = this.prepItems(items,
        true,
        true);
      return returnSingle ? this.find(this.addData(items, indexKey))[0]: this.find(this.addData(items, indexKey));
    }

    static updateOrCreate(items, indexKey = 'id') {
      items = this.prepItems(items,
        true);
      return this.find(this.addData(items, indexKey, true));
    }

    toJSON() {
      return {
        id: this.id,
        ...this.properties,
      }
    }

    // static remove
    // static removeIndex
    // static removeMany
    // static prepRemove
  }

  module.exports = Model;