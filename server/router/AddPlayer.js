const router = require("express").Router();

const AddPlayer = require("../models/addPlayerSchema")


// Add Player 
router.post("/addplayer", async (req, res) => {
 
  const { firstName, lastName, email, category } = req.body;
  if (!firstName) {
    return res.status(400).json({ error: "Please provide FirstName" });
  }
  if (!lastName) {
    return res.status(400).json({ error: "Please provide LastName." });
  }
  if (!email) {
    return res.status(400).json({ error: "Please provide Email." });
  }
  if (!category) {
    return res.status(400).json({ error: "Please provide Category." });
  }
  

  try {
    const { error } = AddPlayer.validate({ firstName, lastName, email, category });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const newMessage = new AddPlayer({
    firstName,
    lastName,
    email,
    category
  });

  try {
    const savedMessage = await newMessage.save();
    res.status(201).json({savedMessage, status:201});
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/getplayer", async(req, res) => {
  try{
    const teams = await AddPlayer.find()
    res.status(200).json(teams)
  } 
  catch(err){
    res.status(500).json(err)
  }
})

router.delete("/deleteplayer/:id", async (req, res) => {
  try {
    const playerId = req.params.id; 
    const deletedPlayer = await AddPlayer.findOneAndDelete({ _id: playerId });
    
    if (!deletedPlayer) {
      return res.status(404).json({ message: "Player not found", status: 404 });
    }
    
    res.status(200).json({ message: "Player Deleted Successfully!", status: 200 });
  } catch (err) {
    res.status(500).json({ err: 'Something went wrong' });
  }
});


router.put('/update-player/:id', async(req, res) => {
  try{
      await AddPlayer.findOneAndUpdate(
          {
            _id: req?.params?.id,
          },
          
          {
            firstName: req?.body?.firstName,
            lastName: req?.body?.lastName,
            email: req?.body?.email,
            category: req?.body?.category,
          }
        );
        res.status(200).json({status: 200, message: "Player Updated SuccessFully!"})
  } catch(err){
      return res.status(500).json(err)
  }
})


module.exports = router;