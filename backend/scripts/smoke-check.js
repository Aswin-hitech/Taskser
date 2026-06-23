require("../config/env");

require("../routes/auth");
require("../routes/tasks");
require("../routes/notes");
require("../routes/checklists");
require("../routes/notifications");
require("../routes/stats");

console.log("Backend smoke check passed.");
