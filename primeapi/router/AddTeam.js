const router = require("express").Router();

const AddTeam = require("../models/addTeamSchema")


// Add Team 

router.post("/addteam", async (req, res) => {
 
  const { teamName, sportType, coachName } = req.body;
  if (!teamName) {
    return res.status(400).json({ error: "Please provide TeamName" });
  }
  if (!sportType) {
    return res.status(400).json({ error: "Please provide SportType." });
  }
  if (!coachName) {
    return res.status(400).json({ error: "Please provide CoachName." });
  }
  

  try {
    const { error } = AddTeam.validate({ teamName, sportType, coachName });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const newMessage = new AddTeam({
    teamName,
    sportType,
    coachName
  });

  try {
    const savedMessage = await newMessage.save();
    res.status(201).json({savedMessage, status: 200});
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/getteams", async(req, res) => {
  try{
    const teams = await AddTeam.find()
    res.status(200).json(teams)
  } 
  catch(err){
    res.status(500).json(err)
  }
})

router.delete("/deleteteam/:id", async (req, res) => {
  try {
    const teamId = req.params.id; 
    const deletedTeam = await AddTeam.findOneAndDelete({ _id: teamId });
    
    if (!deletedTeam) {
      return res.status(404).json({ message: "Player not found", status: 404 });
    }
    
    res.status(200).json({ message: "Team Deleted Successfully!", status: 200 });
  } catch (err) {
    res.status(500).json({ err: 'Something went wrong' });
  }
});




module.exports = router;