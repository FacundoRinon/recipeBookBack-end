const User = require("../models/User");
const jwt = require("jsonwebtoken");
const formidable = require("formidable");
const path = require("path");
const fs = require("fs");

async function index(req, res) {
  const users = await User.find().sort({ createdAt: -1 });

  return res.json({
    users,
  });
}

async function show(req, res) {}

async function create(req, res) {}

async function store(req, res) {}

async function edit(req, res) {}

async function update(req, res) {}

async function destroy(req, res) {}

module.exports = {
  index,
  show,
  create,
  store,
  edit,
  update,
  destroy,
};
