const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const _ = require("lodash");
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.set("strictQuery", true);
mongoose.connect(
  "mongodb+srv://admin-aman:Aman1234@cluster0.zd3vjzk.mongodb.net/todoList"
);
//conncting to the mongoDB
const itemSchema = {
  name: String,
  //this is for following specific type of format
};
var today = new Date();
var options = {
  weekday: "long",
  day: "numeric",
  month: "long",
};
var day = today.toLocaleDateString("en-US", options);

const Item = mongoose.model("Item", itemSchema);
const item1 = new Item({
  name: "Task 1",
});
const item2 = new Item({
  name: "Task 2",
});
const item3 = new Item({
  name: "Task 3",
});
const listSchema = {
  name: String,
  items: [itemSchema],
};
const List = mongoose.model("List", listSchema);
app.get("/", (req, res) => {
  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany([item1, item2, item3], (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully Saved ");
        }
      });
      res.redirect("/");
    }

    res.render("list", {
      title: day,
      y: today.getFullYear(),
      newlist: foundItems,
    });
  });
});
app.get("/:customName", (req, res) => {
  const custom = _.capitalize(req.params.customName);
  List.findOne({ name: custom }, function (err, foundItems) {
    if (!err) {
      if (!foundItems) {
        const l = new List({
          name: custom,
          items: [item1, item2, item3],
        });
        l.save();
        res.redirect("/" + custom);
      } else {
        res.render("list", {
          title: foundItems.name,
          newlist: foundItems.items,
          y: today.getFullYear(),
        });
      }
    }
  });
});
app.post("/delete", (req, res) => {
  const del = req.body.del;
  const listName = req.body.listN;
  if (listName === day) {
    Item.findByIdAndRemove(del, function (err) {
      if (!err) {
        console.log("Succesfully Deleted ");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: del } } },
      (err) => {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});
app.post("/", (req, res) => {
  var item = req.body.newitem;
  const listName = req.body.li;
  const it = new Item({
    name: item,
  });
  if (listName === day) {
    it.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(it);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});
app.listen(process.env.PORT || 3000, () => {
  console.log("listening at port 3000");
});
