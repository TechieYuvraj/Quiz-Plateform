const get_fresh_questions = (req, res) => {
    try {
        console.log("get_fresh_questions working")
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"get_fresh_questions internal server error"})
    }
}