const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

exports.signUp = async (req, res, next) => {
    try {
        const {username, password} = req.body;
        const hashPassword = await bcrypt.hash(password, 12);

        const user = await User.create({username, password: hashPassword});
        req.session.user = user;

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        })
    } catch (error) {
        res.status(400).json({
            status: "fail"
        })
    }
}

exports.login = async (req, res, next) => {
    try {
        const {username, password} = req.body;
        const user = await User.findOne({username});

        if(!user) {
            return res.status(400).json({
                status: "fail",
                error:"Not found"
            })
        }

        const isCorrectPassword = await bcrypt.compare(password, user.password);
        if(isCorrectPassword) {
            req.session.user = user;
            return res.status(200).json({
                status: 'success',
                data: {
                    user
                }
            })
        }

        return res.status(400).json({
            status: "fail",
            error:"Incorrect username or password"
        })
    } catch (error) {
        res.status(400).json({
            status: "fail"
        })
    }
}