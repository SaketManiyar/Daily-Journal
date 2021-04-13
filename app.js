require('dotenv').config(); 
const express = require('express');               
const bodyParser = require('body-parser');
const app=express();
const _= require('lodash');
const mongoose= require('mongoose');
// const date=require(__dirname+"/date.js");       // takes everything from the date.js file and stores in date variable
                                // important: the program always goes to get method first, do all the process and then return to get method.


app.set('view engine','ejs');                   //imporatnt to set ejs
app.use(bodyParser.urlencoded({extended:true}));  //to parse the data

app.use(express.static("public"));          //always use(as a static resource) this when any static file is added like unlocal and local files brcause express only goes to app.js and package.json
mongoose.connect(process.env.CALL,{useNewUrlParser:true, useUnifiedTopology: true });       // connecting to mongodb

const itemsSchema ={                    // schema                           
    name:String
};
const Item=mongoose.model("Item",itemsSchema);          // model

const item1=new Item({                                  // adding new data into Item model(always used to add)
    name:"Welcome to App..."
});
const item2=new Item({
    name:"This is Saket Maniyar"
});
const item3=new Item({
    name:"<- Hit here to delete this item"
});

const defaultItems=[item1,item2,item3];

const listSchema ={
    name: String,
    items: [itemsSchema]                                // connecting to above schema to share the data like array
};
const List=mongoose.model("List",listSchema);


app.get("/",function(req,res)                                           // this is like main() in java
{
    // const day=date.getDate();                                        // extracts the required info and stores in day variable
                                                                        // render is gathering and loading the tempelate to send to the user
    Item.find({},function(err,foundItems)
    {

        if(foundItems.length==0)
        {
            Item.insertMany(defaultItems, function(err)
            {
                if(err)
                {
                    console.log(err);
                }
                else
                {
                    console.log("Successssffully");
                }
            });
            res.redirect("/");                                                  // it gets redirected to get()
        }
        else
        {
            res.render("list",{listTitle:"Today",newListItems:foundItems});      //sends data from server to list.ejs to embed  
        }
    })
    
});


app.get("/:customListName",function(req,res){                   // for dynamically loading page
    const customListName = _.capitalize (req.params.customListName);    // such that work or Work or WOrk or wORK are all same

List.findOne({name:customListName},function(err,foundList){
    if(!err){
        if(!foundList){
            const list=new List({                           // adding new list
                name:customListName,
                items: defaultItems
            });
            list.save();
            res.redirect("/"+customListName);
        }else{
            res.render("list",{listTitle:foundList.name , newListItems:foundList.items});                  // showing existing list
        }
    }
})

});



app.post("/",function(req,res)          // after get() it comes here
{                     
    const itemName=req.body.newItem;      // using const we can't assign anything new and also it is not protecting anything which is inside like arrays
    const listName=req.body.list;
    
    const item=new Item({
        name:itemName
    });
    if(listName==="Today"){
        item.save();
        res.redirect("/");                                  // it gets redirected to get()      
    }else{
    List.findOne({name: listName},function(err,foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
    })   
    }
                                            
});  


app.post("/delete",function(req,res)                   // this complete code is used to delete the item in the respective list and not to redirect to the main one automatically 
{
    const checkedItemId= req.body.checkbox;
    const listName= req.body.listName;
    if(listName==="Today"){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(!err){
                console.log("Successfully deleted");
                res.redirect("/");
            }
        });
    }else{
        List.findOneAndUpdate({name: listName}, {$pull:{items:{_id:checkedItemId}}}, function(err,foundList){
            if(!err){
                res.redirect("/"+listName);
            }
        });
    }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function()                         // for checking the console whether server started
{                     
    console.log("Server is running successfully");
});