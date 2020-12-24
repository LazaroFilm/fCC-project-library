/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

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

// Create a Schema for book
const { Schema } = mongoose;
const BookSchema = new Schema({
  // _id: {type: String, required: true},
  title: { type: String, required: true },
  comments: { type: Array, required: false, default: [] },
  commentcount: { type: Number, required: false, default: 0 },

  // __v: { select: false }
});

// // hides '__v' & 'password' fields
// BookSchema.plugin(mongooseHidden);

// Create the Model for Book
const Book = mongoose.model("Books", BookSchema);

module.exports = function (app) {
  app
    .route("/api/books")
    // GET Lists ALL books.
    .get((req, res) => {
      consoleLog("_____GET______");
      Book.find({}, (error, response) => {
        consoleLog(response);
        res.json(response);
      });
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })

    // POST Created a new book.
    .post(function (req, res) {
      consoleLog("_____POST_____");
      let title = req.body.title;
      consoleLog("req:", req.body);
      try {
        if (!title || title == "") {
          throw "missing required field title";
        }
        const book = new Book({
          title,
        });
        book.save((error, response) => {
          if (error) throw error;
          consoleLog(response);
          res.json(response);
        });
      } catch (error) {
        consoleLog("error:", error);
        res.send(error);
      }
      //response will contain new book object including at least _id and title
    })

    // DELETE Deletes ALL books.
    .delete(async (req, res) => {
      consoleLog("_____DELETE_____");
      Book.deleteMany({}, (error, response) => {
        consoleLog("complete delete successful");
        res.send("complete delete successful");
      });
      //if successful response will be 'complete delete successful'
    });

  app
    .route("/api/books/:id")

    // GET(id) Looks up a book with id.
    .get((req, res) => {
      consoleLog("______GET/id_____");
      consoleLog("body:", req.body);
      consoleLog("params:", req.params);
      let bookid = req.params.id;
      Book.findOne({ _id: bookid }, (error, response) => {
        if (error || !response) {
          consoleLog("no book exists");
          res.send("no book exists");
        } else {
          consoleLog(response);
          res.json(response);
        }
      });
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })

    // POST(id) Adds a comment to book
    .post(async (req, res) => {
      consoleLog("______POST/id_____");
      let bookid = req.params.id;
      let comment = req.body.comment;
      let update = {};
      let errorReport;
      // console.log("COMMENT:", comment);
      try {
        if (!comment) {
          throw "missing required filed";
        }
        await Book.findById(bookid, (error, response) => {
          if (error || !response) {
            errorReport = true;
          } else {
            consoleLog("response:", response);
            const comments = [...response.comments, comment];
            const commentcount = response.commentcount + 1;
            const __v = response.__v + 1;
            update = { comments, commentcount, __v };
            consoleLog("Update:", update);
          }
        });
        if (errorReport) throw "no book exists";
        Book.findByIdAndUpdate(
          bookid,
          update,
          { new: true },
          (error, response) => {
            if (error) {
              consoleLog("Error:", error);
              res.send(error);
            } else {
              console.log("update response:", response);
            }
          }
        );
        //json res format same as .get
      } catch (error) {
        consoleLog("error:", error);
      }
    })
    // DELETE(id) Deletes sected book.//TODO error if no books with that ID.
    .delete(function (req, res) {
      consoleLog("_____DELETE/id_____");
      let bookid = req.params.id;
      Book.findByIdAndDelete({ _id: bookid }, (error, response) => {
        if (error) res.send(error);
        else {
          consoleLog("delete successful");
          res.send("delete successful");
        }
      });
      //if successful response will be 'delete successful'
    });
};
