/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const mongoose = require("mongoose");
// const mongooseHidden = require("mongoose-hidden")({
//   defaultHidden: { __v: true, password: true },
// });

const verbose = !!(process.env.VERBOSE === "true");
console.log("verbose:", verbose);
console.log("testing:", process.env.NODE_ENV === "test");
const consoleLog = (...message) => {
  !(process.env.VERBOSE === "true") ? null : console.log(...message);
};

consoleLog("Hello World")

// Create a Schema for book
const { Schema } = mongoose;
const BookSchema = new Schema({
  // _id: {type: String, required: true},
  title: { type: String, required: true },
  comments: { type: Array, required: false, default: [] },
  commentcount: { type: Number, required: false, default: 0 }

  // __v: { select: false }
});

// // hides '__v' & 'password' fields
// BookSchema.plugin(mongooseHidden);

// Create the Model for Book
const Book = mongoose.model("Books", BookSchema);


module.exports = function(app) {

  app.route('/api/books')
    .get((req, res) => {
      consoleLog("Catalog:")
       Book.find({}, (error, response) => {
        consoleLog(response);
        res.json(response)
      })
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]

    })

    .post(function(req, res) {
      let title = req.body.title;
      consoleLog("req:", req.body)
      try {
        if (!title || title == "") {
          throw("missing required field title")
        }
      const book = new Book({
        title
      })
      book.save((error, response) => {
        if(error) throw(error);
        consoleLog(response);
        res.json(response)
      });
      } catch (error) {
        console.log("error:", error)
        res.send(error)
      };
      //response will contain new book object including atleast _id and title
    })

    .delete(async(req, res) => {
      Book.deleteMany({}, (error, response) => {
        consoleLog("complete delete successful")
        res.send("complete delete successful")
      })
      //if successful response will be 'complete delete successful'
    });

  app.route('/api/books/:id')
    .get((req, res) => {
      consoleLog("req:", req.body)
      let bookid = req.params.id;
      Book.find( {_id: bookid}, (error, response) => {
        if(error) console.log(error);
        consoleLog(response);
        res.json(response)
      })
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })

    .post(async(req, res) => {
      consoleLog("body", req.body)
      consoleLog("params:", req.params)
      let bookid = req.params.id;
      consoleLog("Book id:", bookid)
      let newComment = req.body.comment;
      let comments = []
      await Book.findById( bookid, (error, response) => {
        consoleLog("response:", response)
        const oldComments = response.comments
        consoleLog("olds:", oldComments, "new:", newComment)
        comments = [...oldComments, newComment]
      })
      consoleLog("comment:", comments)
      Book.findByIdAndUpdate( bookid, { comments }, (error, response) => {
        console.log("update response:", response)
      })
      //json res format same as .get
    })

    .delete(function(req, res) {
      let bookid = req.params.id;
      Book.findByIdAndDelete( {_id: bookid }, (error, response) => {
        if (error) res.send(error)
        else {
          consoleLog("delete successful");
          res.send("delete successful")
        }
      })
      //if successful response will be 'delete successful'
    });

};
