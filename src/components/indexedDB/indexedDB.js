import Dexie from 'dexie';

var db = new Dexie("flowStateDB");
db.version(1).stores({
  tasks: "id, title, description, difficulty, completed",
  habits: "id, title, description, type, completed",
});


export default db;
