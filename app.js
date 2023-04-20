const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();

app.use(express.json());

const databasePath = path.join(__dirname, "todoApplication.db");


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

//GET API1
/*
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
  };
};
*/
app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }

  data = await database.all(getTodosQuery);
  response.send(data);
});
//API 2nd


const convertResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
  };
};
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT * 
    FROM todo
    WHERE id=${todoId};`;
  let todoI = await db.get(getTodoQuery);
  response.send(convertResponseObject(todoI));
});

//Get post 3
app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;
  const addTodoQuery = `
    INSERT INTO 
        todo(id,todo,priority,status)
        VALUES(${id},'${todo}','${priority}','${status}');`;
  const dbResponse = await db.run(addTodoQuery);
  console.log(dbResponse);

  const playerId = dbResponse.lastID;
  response.send("Todo Successfully Added");
});

//API 4


app.put("/todos/:todoId/", async(request,response)=>{
    const {todoId}=request.params;
    let updateColumn="";
    const requestBody=request.body;
    switch (true){
        case requestBody.status!==undefined;
             updateColumn="Status";
             break;
        case requestBody.priority!==undefined;
             updateColumn="Priority";
             break;
        case requestBody.status!==undefined;
             updateColumn="Todo";
             break;
    }
    const previousTodoQuery=`
    SELECT]
       *
    FROM 
       todo
    WHERE
       id=${todoId};`;
    const previousTodo=await db.get(previousTodoQuery);

    const {
        todo=previousTodo.todo,
        status=previousTodo.status,
        priority=previousTodo.priority,
    }=request.body;
    
    const updatedTodoQuery=`
    UPDATE
    todo
    SET
      todo='${todo}'
      priority='${priority}'
      status='${status}'
    WHERE
     id=${todoId};`;
     await db.run(updatedTodoQuery);
     response.send(`${updateColumn} Updated`)
})
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
