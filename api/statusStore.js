//const store = new Map();

//module.exports = {
//  get: (id) => store.get(id),
  //set: (id, data) => store.set(id, data),
  //update: (id, updates) => {
    //if (store.has(id)) {
      //store.set(id, { ...store.get(id), ...updates });
    //}
  //},
//};
// photo-pipeline/api/statusStore.js

const statusMap = new Map();

function updateStatus(id, newStatus) {
  statusMap.set(id, newStatus);
}

function getStatus(id) {
  return statusMap.get(id);
}

module.exports = { updateStatus, getStatus };
