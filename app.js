CREATE TABLE todo (id INT,
                     todo VARCHAR(250),
                     priority VARCHAR(250),
                     status VARCHAR(250)
                     );
                     
const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
 
//GET API
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
  };
};

app.get("/todos/?status=TO%20DO", async (request, response) => {
  const getTodosQuery = `
 SELECT
 *
 FROM
 todo;`;
  const todoArray = await db.all(getTodosQuery);
  response.send(
    todoArray.map((eachTodo) =>
      convertDbObjectToResponseObject(eachTodo)
    )
  );
});

//DELETE API
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodosQuery = `
    DELETE FROM
      todo
    WHERE
      id=${todoId};`;
  await db.run(deleteTodosQuery);
  response.send("Todo Deleted");
});

module.exports = app;