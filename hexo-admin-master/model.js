const { Integer } = require("warehouse/dist/types/index");

module.exports={
    normal:{
        text:String,
        type:String
    },
    match:{
        text:String,
        type:String,
        team1: String,
        team2: String,
        homeDate: String,
        awayDate:String,
        homeLocation:String,
        awayLocation:String,
        group: Number
    },result:{
        text:String,
        type:String,
        team1: String,
        team2: String,
        team1Score: String,
        team2Score: String,
        isPostponed:Boolean,
        group: Number
    }
}