const db = require("../model");
const User = db.user;
const Op = db.Sequelize.Op;
const { issueJWT } = require("../lib/jwt");
const nodemailer = require("nodemailer");
const { user } = require("../model");
//const _ = require("lodash");

const bcrypt = require("bcryptjs");
const jwt = require("../lib/jwt");

//otp generate
var otp = Math.floor(Math.random() * 100000);
console.log(otp);

//-------------------- register addUser --------------------
module.exports.addUser = async (req, res) => {
  try {
    let { name, city, gender, password, email, isActive } = req.body;
    let salt = await bcrypt.genSalt();
    let hashPassword = await bcrypt.hash(password, salt);
    console.log(hashPassword, "hide password");
    let generate = otp;
    console.log(generate, "checking generate is giving response or not");

    let user = {
      name: name.toLowerCase(),
      city: city.toLowerCase(),
      gender: gender.toLowerCase(),
      email: email,
      password: hashPassword,
      otp: generate,
      isActive: isActive,
    };
    let Email = await emailSent(user, generate);
    let userCreate = await User.create(user);
    res.status(200).json({
      success: true,
      message: "user add successfully",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

//-------------------- logIn --------------------
module.exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;
    console.log(email, password, "checking req body part");
    let userCreate = await user.findOne({
      where: { email: email },
    });
    console.log(userCreate, "working");
    if (userCreate == null) {
      return res.status(401).send({ message: "Email Address is not valid" });
    } else if (await bcrypt.compare(password, userCreate.password)) {
      if (userCreate.isActive == "1") {
        let token = await issueJWT(userCreate.dataValues);
        console.log(userCreate.isActive, " this property is also working");
        res.status(200).json({
          success: true,
          message: "user login successfully",
          token: token,
        });
      } else {
        return res.status(404).send({
          message: "verification failed, try again", //this message shows when isActive is not activated
        });
      }
    } else {
      return res.status(401).send({
        message: "password is not correct",
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
//-------------------- editUser --------------------
module.exports.editUser = async (req, res) => {
  try {
    let { id } = req.body;
    let userfindOne = await User.findAll({ where: { id: id } });
    if (userfindOne.length > 0) {
      let userUpdate = await User.update(req.body, {
        where: { id: id },
      });
      if (userUpdate[0] == 1) {
        res.status(200).json({
          success: true,
          message: "User data updated successfully",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Something went wrong",
        });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "User id not found",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

//-------------------- deleteUser --------------------
module.exports.deleteUser = async (req, res) => {
  try {
    let { id } = req.body;
    let userfindOne = await User.findAll({ where: { id: id } });
    if (userfindOne.length > 0) {
      let userDelete = await User.destroy({ where: { id: id } });
      if (userDelete == 1) {
        res.status(200).json({
          success: true,
          message: "User data delete successfully",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Something went wrong",
        });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "User id not found",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

//-------------------- showUserList --------------------
module.exports.showUserList = async (req, res) => {
  try {
    let userList = await User.findAll();
    res.status(200).json({
      success: true,
      message: "User list data",
      data: userList,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

//-------------------- filterUserList --------------------
module.exports.filterUserList = async (req, res) => {
  try {
    let { name, city, gender, condition, pageNumbeP, PageSize } = req.body;
    let pageNumber = req.body.PageNumber || 1;
    let pageSize = req.body.PageSize || 10;
    let Offset = 0 + (pageNumber - 1) * pageSize;
    let cases;
    let whereName = "";
    let whereCity = "";
    let whereGender = "";
    if (condition == "") {
      if (name != "" || city != "" || gender != "") {
        if (name != "") {
          whereName = { name: { [Op.like]: "%" + name + "%" } };
        }
        if (city != "") {
          whereCity = { city: { [Op.like]: "%" + city + "%" } };
        }
        if (gender != "") {
          whereGender = { gender: gender };
        }
        cases = { where: { [Op.or]: [whereGender, whereCity, whereName] } };
      }
    } else {
      if (name != "") {
        whereName = { name: { [Op.like]: "%" + name + "%" } };
      }
      if (city != "") {
        whereCity = { city: { [Op.like]: "%" + city + "%" } };
      }
      if (gender != "") {
        whereGender = { gender: gender };
      }

      if (condition == "and") {
        cases = { where: { [Op.and]: [whereGender, whereCity, whereName] } };
      }
      if (condition == "or") {
        cases = { where: { [Op.or]: [whereGender, whereCity, whereName] } };
      }
    }
    let userFilterData;
    if (cases == undefined) {
      userFilterData = await User.findAll({
        limit: pageNumber * pageSize,
        offset: Offset,
      });
    } else {
      cases.limit = pageNumber * pageSize;
      cases.offset = Offset;
      userFilterData = await User.findAll(cases);
    }
    res.status(200).json({
      success: true,
      message: "User filter data list",
      data: userFilterData,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

//-------------------------forgotPassword--------------------
module.exports.forgotPassword = async (req, res, next) => {
  try{
  let fPass = req.body.email;
  let Otp = otp;
  console.log(req.body.email);
  let file = {
    email: fPass,
  };
  let confirm = await emailSent(file, Otp)
  console.log(confirm,"21245454")
  let verifySent= await user.update({otp:Otp},{where:{email:fPass}})
  console.log(verifySent," the verifySent part is responding")
  if(verifySent){
    res.status(200).json({
      success:true,
      message: " verified successfully"
    })
  }
    else{
      res.json({
        message: "please check your email for changing password with otp",
      })
    }
  }
    catch(error){
      res.status(400).json({
        success:false,
        message:error.message
      })
    };
};

//-------------verifyEmail--------------
module.exports.verifyEmail = async (req, res) => {
  try {
    let {email,otp} = req.body;
    console.log(email, otp, "requesting part is working");
    let verifyEmail = await user.findOne({
      where: { [Op.and]:[{ email:email },{otp:otp}]},
    });
    console.log(verifyEmail.email, "verifying part is also responding");
    if(verifyEmail){
      res.json({
        message: "Verification successful, you can now login",
        //data: result,
      });
    } else {
      res.send("email or otp are not matched insert properly");
    }
  // matching email and otp when isActive is
    let verifyingMail = await user.update(
      { isActive: "1" },
      { where: { [Op.and]: [{ email:email }, { otp:otp }] } }
    );
    console.log(verifyingMail, "just testing");
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//------------------resetPassword----------------
module.exports.resetPassword = async (req, res, next) => {
  let record = await user.findAll({
    where: {
      id: req.body.id,
      oldPass: req.body.oldPass,
      newPass: req.body.newPass,
    },
  });
  let matchOld = await user.findOne({ id });
  console.log(matchOld, "15151");
  console.log(record, "record is giving respond");
  if (record.length > 0) {
    let dataPass = record.password;
    console.log(dataPass, "is working");

    if (password == req.body.oldPass) {
    }
  } else {
    return res.status(401).json({ error: "Another error" });
  }
};

//------------changePassword------
module.exports.changePassword = async (req, res) => {
  try {
    // taking request from body
    var { oldPassword, newPassword } = req.body;
    console.log(
      oldPassword,
      newPassword,
      "this properties is also showing response"
    );

    // taking id from token through req.user
    var { id } = req.user;
    console.log(req.user, " what is coming");

    //matching id which we take from body with database id
    var passData = await user.findOne({ where: { id: id } });
    console.log(passData.password, "line of 351 sdff");

    //matching oldPassword in database
    let checkingOld = await bcrypt.compare(oldPassword, passData.password);
    console.log(checkingOld, "939841frf");
    if (checkingOld == true) {
      let salt = await bcrypt.genSalt(10);
      let hashPassword = await bcrypt.hash(newPassword, salt);
      console.log(hashPassword, "+++65566");
      let dbOld = await user.update(
        { password: hashPassword },
        { where: { id: id } }
      );
      console.log(dbOld, "45878da");
      res.status(200).json({
        success: true,
        message: "password has been changed",
      });
    } else {
      res.status(404).json({
        success: false,
        message: " oldPassword is not same, try again",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//function of sending mail
async function emailSent(Body, generate) {
  console.log(generate, " checking in email generate is working");
  console.log(Body, "Hello the body is also responding properly");
  const transporter = await nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth: {
      user: "xx-xx@gmail.com", //change email id 
      pass: "x-x-x-x", //change password
    },
    secure: true,
  });
  const mailData = {
    from: "xx-xxx@gmail.com", // change email id which given in user 
    to: Body.email,
    subject: "verifying",
    text: "Hello, user has been signed up successfully",
    html: `<b>` + generate + `</b>`,
  };
  transporter.sendMail(mailData, (error, info) => {
    if (error) {
      return console.log(error);
    }
    res.status(200).send({ message: "Mail send", message_id: info.messageId });
  });
}

// there is a value in this code which is needed
//ok got it
//alright so this is how to use the pull and push command in github