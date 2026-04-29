const Photo = require('../models/photoModel');

// list
function list() {
  return Photo.find({}).populate('userId', 'name');
}

// find
function find(id) {
  return Photo.findById(id).populate('userId', 'name');
}

// create
function create(photoData) {
  return new Photo(photoData).save();
}


// update
function update(id, updates, options = {}) {
  return Photo.findByIdAndUpdate(id, updates, options);
}


// remove
function remove(id) {
  return Photo.findByIdAndDelete(id);
}


module.exports = {
  list,
  find,
  create,
  update,
  remove,
};



