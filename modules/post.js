const mongoose = require("mongoose");
const Post = mongoose.model("Post", {
    title:String,
    city: String,
    price: Number,
    des: String,
    image:Array,
    time:String,
    date:String,
    now:String,
    number:Number
});

module.exports = Post;
