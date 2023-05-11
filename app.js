/*
CREATE TABLE todo(id INTEGER, todo TEXT, priority TEXT, status TEXT);
INSERT INTO todo(id, todo, priority, status)
Values (1, "Learn HTML", "HIGH", "TO DO"),
(2, "Learn JS", "MEDIUM", "DONE"),
(3, "Learn CSS", "LOW", "DONE"),
(4, "Play CHESS", "LOW", "DONE");
SELECT * from todo;
*/





const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();

app.use(express.json());

const databasePath = path.join(__dirname, "todoApplication.db");


let database= null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//GET API1


const hasPriorityAndStatusProperties=(requestQuery)=>{
    return (
        requestQuery.priority!== undefined && requestQuery.status !== undefined
    );
};
const hasPriorityProperty=(requestQuery)=>{
    return requestQuery.priority!==undefined;
};
const hasStatusProperty=(requestQuery)=>{
    return requestQuery.status!== undefined
}

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
    AND priority = '${priority};`;
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



app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT * 
    FROM todo
    WHERE id=${todoId};`;
  let todo = await database.get(getTodoQuery);
  response.send(todo);
});

//Get post 3
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const addTodoQuery = `
  INSERT INTO 
    todo(id,todo,priority,status)
  VALUES(${id},'${todo}','${priority}','${status}');`;
  await database.run(addTodoQuery);
  response.send("Todo Successfully Added");
});


//API 4


app.put("/todos/:todoId/", async(request,response)=>{
    const {todoId}=request.params;
    let updateColumn="";
    const requestBody=request.body;
    switch (true) {
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
    const previousTodo=await database.get(previousTodoQuery);

    const {
        todo=previousTodo.todo,
        priority=previousTodo.priority,
        status=previousTodo.status,
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
     await database.run(updatedTodoQuery);
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
  await database.run(deleteTodosQuery);
  response.send("Todo Deleted");
});

module.exports = app;
