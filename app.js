require('dotenv').config()
const express=require("express")
const bodyParser=require("body-parser")
const ejs=require("ejs")
const encrypt=require("mongoose-encryption")
const  mongoose=require("mongoose")
const session=require("express-session")
const passport=require("passport")

const passportLocalMongoose=require("passport-local-mongoose")


const bcrypt=require("bcrypt")
const saltRounds = 10

const app=express()


app.set("view engine","ejs")
app.use(express.static("public"))

app.use(bodyParser.urlencoded(
    {
        extended:true
    }
))

//using sessions
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
  }))

app.use(passport.initialize())  //to initialse the passport 
app.use(passport.session())  //to use passport for sessions



mongoose.connect("mongodb://127.0.0.1:27017/usera")

const userSchema=new mongoose.Schema({
    email:String,
    password:String
})

userSchema.plugin(passportLocalMongoose) //we are using it to hash and salt pass and to save it into mongodb


// userSchema.plugin(encrypt,{secret:process.env.secret,encryptedFields:["password"]})

const user=new mongoose.model("user",userSchema)

passport.use(user.createStrategy());

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());


app.get("/",(req,res)=>
{
    res.render("home")
})

app.get("/register",(req,res)=>
{
    res.render("register")
})

app.get("/secrets",function(req,res)
{
    if(req.isAuthenticated())
    {
        res.render("secrets")
    }
    else{
        res.render("login")
    }
})
app.get("/login",(req,res)=>
{
    res.render("login")
})

app.get("/logout",function(req,res,next)
{
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
})

app.post("/register",function(req,res)
{
    // bcrypt.hash(req.body.password ,saltRounds, function(err, hash) {
    //     // Store hash in your password DB.
    //     const newuser=new user(
    //         {
    //             email:req.body.username,
    //             password:hash
    //         }
    //     )
    //     newuser.save()
    //     .then(function()
    //     {
    // res.render("secrets")
    //     })
    //     .catch(function(e)
    //     {
    //         console.log(e)
    //     })
    // });
    
    //COOKIES AND SESSIONS
    user.register({username:req.body.username},req.body.password,function(err,user)
    {
        if(err)
        {
         res.render("login")
        }
        else{
            passport.authenticate("local")(req,res,function()
            {
                res.redirect("/secrets")
            })
        }
    })
    }

)

app.post("/login",(req,res)=>
{
//     try{
//     const username=req.body.username
//     const password=req.body.password

//    user.findOne({email:username})
//     .then(function(found)
//     {
//         if(!found.password===password)
//         {
//            console.log("noone")
//         }
//         else{
//           bcrypt.compare(password, found.password, function(err, result) {
//             if(result===true)
//             {
//                res.render("secrets")
//             }
//            })
//         }
//     })
//     .catch(function(err)
//     {
//         console.log("err occures")
//     })
// }
// catch(e)
// {
//     console.log("eror")
// }


//COOKIES AND SESSIONS
const newuser=new user(
    {
        username:req.body.username,
        password:req.body.password
    }
)
req.login(newuser,function(err)
{
    if(err)
    {
        console.log("error")
    }
    else{
        passport.authenticate("local")(req,res,function()
        {
            res.redirect("/secrets")
        })
    }
})
}
   


)

app.listen(3000,()=>
{
    console.log("listened")
})