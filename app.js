//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-anson:test123@cluster0.htyih.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });

const itemSchema = new mongoose.Schema({ name: String});
const Item = mongoose.model("Item", itemSchema);

const listSchema = new mongoose.Schema({ name: String, items: [itemSchema]});
const List = mongoose.model("List", listSchema);




const item1 = new Item({ name: "Welcome to your To-do List!"});
const item2 = new Item({ name: "Hit + to add a new button"});
const item3 = new Item({ name: "<-- Hit this to delete an item"});

const defaultItems = [item1, item2, item3];

app.get("/", function(req, res) {

  Item.find({}, function(err, items){

    if(items.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        } else{
          console.log("successfully added items");
        }
        });
      item1.save();
      item2.save();
      item3.save(function(){
        res.render("list", {listTitle: "Today", newListItems: items})
      });
    } else {
    res.render("list", {listTitle: "Today", newListItems: items});
  }});

});

app.post("/", function(req, res){

  const listName = req.body.list;
  const itemName = req.body.newItem;
  const item = new Item({ name: itemName });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }


});

app.post("/delete", function(req,res){
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemID, function(err){
      if(err){
        console.log(err);
      } else {
        console.log("success");
      }
    });
  } else {
    List.findOneAndUpdate(
      {name: listName},
      {$pull: {items: {_id: checkedItemID}}},
      function(err, foundList){
        if(!err){
          res.redirect("/" + listName);
        }
      }
    );
  }
});


app.get("/:title", function(req,res){
  const newPage = _.capitalize(req.params.title);

  List.findOne({name: newPage}, function(err, list){
    if(!err){
      if(!list){
        const list = new List({
          name: newPage,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + newPage)
      } else {
        res.render("list", {listTitle: list.name, newListItems: list.items});
      }
    }
  });
});



app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started");
});
