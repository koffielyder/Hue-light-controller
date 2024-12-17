const fs = require('fs');
const path = require('path');
const utilities = require('../services/utilities');

class DbModel {
  // Define the path to the database file
  static dbFolder = path.resolve(__dirname, '../data/');

  static fields = {};

  static index = null;

  static tableData = null;

  static getTableData(sync = false) {
    this.syncTableData(sync);
    return this.tableData;
  }
  static getTableIndex() {
    this.syncTableData();
    return this.index;
  }

  static syncTableData(force = false) {
    this.initTable();

    if (force || this.tableData === null) {
      const fileData = this.readFile();
      this.tableData = fileData.data;
      this.index = fileData.index;
    }
  }

  // Creates empty table file if it doesnt exist
  static initTable() {
    if (!fs.existsSync(this.getTableFilePath())) {
      fs.writeFileSync(this.getTableFilePath(), JSON.stringify({
        index: 1,
        data: [],
      }, null, 2), 'utf8');
    }
  }

  static getTableName() {
    return utilities.pascalCaseToSnakeCase(this.name);
  }

  static getTableFilePath() {
    return this.dbFolder + '/' + this.getTableName() + '.json';
  }

  // Read the JSON file and parse it
  static readFile() {
    this.initTable()
    const rawData = fs.readFileSync(this.getTableFilePath(), 'utf8');
    return JSON.parse(rawData);
  }



  static addData(items, indexKey = 'id', createNonExisting = false) {

    const newData = this.getTableData();
    let newIndex = this.getTableIndex();
    const updatedIds = [];
    for (const itemKey in items) {
      const item = items[itemKey];

      if (!item.id) {
        item.id = newIndex;
        newIndex++;
        newData.push(item);
      } else {
        const index = newData.findIndex(dbItem => dbItem[indexKey] == item[indexKey]);
        if (index !== -1) {
          newData[index] = item;
        }
        else if (createNonExisting) {
          item.id = newIndex;
          newIndex++;
          newData.push(item);
        } else {
          throw new Error(`Item with ${indexKey}: ${item[indexKey]} does not exist, trying to update`)
        }
      }

      updatedIds.push(item.id)
    }

    this.writeData(newData, newIndex);
    return updatedIds;
  }

  // write data to file
  static writeData(data, newIndex) {
    try {
      const fileData = {
        index: newIndex,
        data,
      }
      fs.writeFileSync(this.getTableFilePath(), JSON.stringify(fileData, null, 2), 'utf8');
      this.syncTableData(true);
    } catch(error) {
      throw error
    }
  }


}

module.exports = DbModel;