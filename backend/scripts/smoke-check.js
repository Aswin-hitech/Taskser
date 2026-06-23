require("../config/env");

require("../routes/auth");
require("../routes/tasks");
require("../routes/notes");
require("../routes/checklists");
require("../routes/notifications");
require("../routes/stats");
require("../routes/contests");

console.log("Backend smoke check passed.");
