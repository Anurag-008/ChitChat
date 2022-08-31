const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const usermodel = mongoose.Schema(
    {
        name: { type:String, required:true },
        email: { type:String, required:true, unique:true },
        password: { type:String, required:true },
        pic: { type:String, default:"https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg", },
    },
    {
        timestamps:true,
    }
);

usermodel.pre("save" , async function (next) {
    if(!this.isModified){
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
});

usermodel.methods.matchPassword = async function (enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
};

const User = mongoose.model("User",usermodel);

module.exports = User;