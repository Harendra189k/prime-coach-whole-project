const mongoose = require("mongoose");

const addTeamSchema = mongoose.Schema({

    teamName: {
        type: String,
        required: true,
        trim: true,
      },
    
      sportType: {
        type: String,
        required: true,
        trim: true,
      },

      coachName: {
        type: String,
        required: true,
      },

})

module.exports = mongoose.model("AddTeam", addTeamSchema)