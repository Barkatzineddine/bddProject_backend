const express = require("express")
const app = express()
const PORT = process.env.PORT || 8000
const cors = require("cors")
const mysql = require("mysql2")
const dotenv = require("dotenv")
const jwt = require("jsonwebtoken")
const bcrypt = require('bcryptjs')
const cookieParser = require('cookie-parser')
const cookie = require("cookiejs")
const multer = require("multer");

const cloudinary = require('cloudinary').v2;
const {CloudinaryStorage} = require('multer-storage-cloudinary')
const {getorder,getorder2,getorders,getorders2,getimage,getimages,
    getreview,getreviews,
    deleteUser,getuser,
    getusers,isUser,isAdmin,
    getproduct,getproduct2,getproducts,getproducts2,createproduct,
    authenticateToken, createreview, createorder,updateproduct} = require("./functions")
/**********************   CONFIGURATION   ****************************** */
dotenv.config() 
const pool = mysql.createPool({
    host:process.env.mysql_host,
    user:process.env.mysql_user,
    password:process.env.mysql_password,
    database:process.env.mysql_database
 }).promise()

 cloudinary.config({
    cloud_name: process.env.cloudinary_cloud_name,
    api_key: process.env.cloudinary_key,
    api_secret: process.env.cloudinary_secret
 })

 const storage = new CloudinaryStorage({
    cloudinary,
    params:{
        folder:'bddProject',
        allowedFormats: ['jpeg','png','jpg']
    }
 })
 const upload = multer({storage});
 var corsOptions = {
    
        origin: ['http://localhost:3000','http://localhost:3001'], // specify the exact origin of your client application
        credentials: true,
        optionSuccessStatus: 200,
  }
app.use(cors(corsOptions))
app.use(express.urlencoded({extended:true}));
app.use(express.json())
app.use(cookieParser())
/************************** FUNCTIONS ********************************* */




/********************************************************************************************************** */
/**************************************************** GET *********************** ********************************/
app.get("/products",async(req,res,next)=>{

    const products = await getproducts2()
    res.json({products:products})
    
})

app.get("/products/:id",async(req,res,next)=>{
try{
    const id = req.params.id
    const result = await getproduct2(id)
    res.json({product:result})
}catch(err){
    res.json({err:err.message})
}
})

app.get("/isLoged",authenticateToken)

app.get("/users",isAdmin,async(req,res,next)=>{

    const result = await getusers() 
    res.json({users:result})
})

app.get("/users/:id",isAdmin,async(req,res,next)=>{

    const {id} = req.params
    try{
    const result = await getuser(id) 
    res.json({users:result})
    }catch(err){
        console.log(err.message)
        res.json({message:err.message})
    }
})

app.get("/reviews",async(req,res,next)=>{
    try{
        const reviews = await getreviews()
        res.json({reviews})
    }catch(err){
        console.log(err.message)
        res.json({message:err.message})
    }
})

app.get("/images",async(req,res,next)=>{
    try{
        const images = await getimages()
        res.json({images})
    }catch(err){
        console.log(err.message)
        res.json({message:err.message})
    }
})

app.get("/orders",async(req,res,next)=>{
    try{
        const orders = await getorders2()
        res.json({orders})
    }catch(err){
        console.log(err.message)
        res.json({message:err.message})
    }
})

app.get("/reviews/:id",async(req,res,next)=>{

    const {id} = req.params;
    try{
        const reviews = await getreview(id)
        console.log(id)
        res.json({reviews})
    }catch(err){
        console.log(err.message)
        res.json({message:err.message})
    }
})

app.get("/orders/:id",async(req,res,next)=>{

    const {id} = req.params;
    try{
        const order = await getorder(id)
        console.log(id)
        res.json({order})
    }catch(err){
        console.log(err.message)
        res.json({message:err.message})
    }
})

app.get("/orders/user/:id",async(req,res,next)=>{

    const {id} = req.params;
    try{
        const orders = await getorder2(id)
        res.json({orders})
    }catch(err){
        console.log(err.message)
        res.json({message:err.message})
    }
})
app.get("/images/:id",async(req,res,next)=>{

    const {id} = req.params;
    try{
        const image = await getimage(id)
        console.log(id)
        res.json({image})
    }catch(err){
        console.log(err.message)
        res.json({message:err.message})
    }
})

app.get("/images/product/:id",async(req,res,next)=>{

    const {id} = req.params;
    try{
        const image = await getimageByproductid(id)
        console.log(id)
        res.json({image})
    }catch(err){
        console.log(err.message)
        res.json({message:err.message})
    }
})
/********************************************************************************************************** */

/******************************************** POST**************************************************************** */

app.post('/register',async(req,res) =>{
    try{
        const {username,email,password} = req.body
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(password,salt)
        //const result = await login(req.body.email,req.body.password)
        // return result
        const [result] = await pool.query(`
            select * from users where username = ? 
            or email = ? 
            `,[username,email])

        console.log(result.length)
        if(result.length === 0){
            const [result] = await pool.query(`
            INSERT INTO users (username, email, password)
            VALUES (?, ?, ?);
            `,[username,email,hashedPassword])
            res.redirect("http://localhost:3000/register")
        }else{
            res.send("sorry username or email already exist")
        }
   
    }catch(err){
        res.send("error")
        console.log(err)
    }
})


app.post('/login',async(req,res) =>{

    const {username,password} = req.body;
    const [result] = await pool.query(`
            select * from users where username = ?
            `,[username])
    console.log(username,password)
    if(result.length > 0){
        if(await bcrypt.compare(password,result[0].password)){  
            const [user] = result
            const accessToken = jwt.sign(user,process.env.token)
           
            res.json({user:user,jwt:accessToken,access:true,message:"loged successfully"})          
            
        }else{
            res.json({message:"username or password incorrect"})
        }

    }else{
        res.json({message:"username or password incorrect"})
    }

})

app.post('/product',isAdmin,upload.array('image'),async(req,res) =>{

    const {title,price} = req.body;
    const images = req.files
    try{
    const result = await createproduct(title,price,images)
    res.json(result)
    }catch(err){
        res.json({message:err.message})
    }
})

app.post('/product/:id',isAdmin,upload.array('image'),async(req,res) =>{

    const {id} = req.params;
    const {title,price} = req.body;
    const image = req.files
    console.log("image :",image)
    console.log("title",title.length)
    console.log("price",price)
    
    try{
    const result = await updateproduct(id,title,price,image[0])
    res.json(result)
    }catch(err){
        console.log(err)
        res.json({message:err.message})
    }
})

app.post('/orders',isUser,async(req,res) =>{
    const {user_id} = req.user;
    const {product_id} = req.body;
    
    try{
    const result = await createorder(product_id,user_id)
    res.json(result)
    }catch(err){
        res.json({message:err.message})
    }
})

app.post('/review',isUser,async(req,res) =>{

    const {user_id} = req.user;
    const {text,rating,product_id} = req.body;
    try{
    const result = await createreview(text,rating,product_id,user_id)
    res.json({result:result})
    }catch(err){
        res.json({error:err.message})
    }
})


app.post('/images',isAdmin,upload.array('image'),async(req,res) =>{

    const images = req.files 
    const {product_id} = req.body 
    const transformedImages = images.map(({ path }) => [path, product_id]);
    try{
    const [result] = await pool.query(`
    insert into images (path,product_id)
    values ?`,[transformedImages])
    res.json(images)
    }catch(err){
        console.log(err.message);
        res.json({message:err.message})
    }

})

app.post('/review',isUser,async(req,res) =>{

    const {user_id} = req.user
    const {text,rating,product_id} = req.body;
    try{
    const result = await createreview(text,rating,product_id,user_id)
    res.json({result:result})
    }catch(err){
        res.json({error:err.message})
    }
})





/*************************************************DELETE*************************************************** */
app.delete("/product/:id",isAdmin,async(req,res) =>{
try{
    const {id} = req.params;
    const [result2] = await pool.query(`DELETE FROM images WHERE product_id = ?;`,[id])
    const [result3] = await pool.query(`DELETE FROM reviews WHERE product_id = ?;`,[id])
    const [result4] = await pool.query(`DELETE FROM orders WHERE product_id = ?;`,[id])
    const [result1] = await pool.query(`DELETE FROM products WHERE id = ?;`,[id])
    console.log(result1)
    if(result1.affectedRows > 0){
        res.json({message:"product deleted"})
    }else{
    res.json({message:"product do not exist"})
    }
}catch(e){
    res.json({message:e.message})
    console.log(e.message)
}
})

app.delete("/images/:id",isAdmin,async(req,res) =>{

    const {id} = req.params

    try{
        const result = await pool.query(`DELETE FROM images WHERE id = ?;`,[id]);
        if(result.affectedRows > 0){
            res.json({message:"image deleted"})
        }else{
        res.json({message:"image do not exist"})
        }
    }catch(e){
        res.json({message:e.message})
        console.log(e.message)
    }
    
})

app.delete("/review/:id",isUser,async(req,res) =>{
    
    const {id} = req.params;
   if(req.user.type==="admin"){

        try{
                   
            const [result] = await pool.query(`DELETE FROM reviews WHERE id = ?;`,[id])
            console.log(result)
            if(result.affectedRows > 0){
                res.json({message:"review deleted"})
            }else{
            res.json({message:"review do not exist"})
            }
        }catch(e){
            res.json({message:e.message})
            console.log(e.message)
        }
    }else{
        try{

            const [rows] = await pool.query(
                `select * from reviews
                 where id = ?
                 `,[id])
            
            const review = rows[0]

            if(req.user.id === review.id){
                const [result] = await pool.query(`DELETE FROM reviews WHERE id = ?;`,[id])
                if(result.affectedRows > 0){
                    res.json({message:"review deleted"})
                }else{
                res.json({message:"review do not exist"})
                }
            }else{
                res.json({message:"you are not allowed do delete this review"})
            }
        }catch(err){
            res.json({message:err.message})
            console.log(err.message)
        }
    }
    })
    

app.delete("/users/:id",async(req,res,next)=>{

    const {id} = req.params;
    
    try{
        const result = await deleteUser(id);
        if(result.affectedRows > 0){
            res.json({message:"user deleted"})
        }else{
        res.json({message:"user do not exist"})
        }
    }catch(e){
        res.json({message:e.message})
        console.log(e.message)
    }
    })



app.delete("/images/:id",isAdmin,async(req,res) =>{
        try{
            const {id} = req.params;
            const [result] = await pool.query(`DELETE FROM images WHERE id = ?;`,[id])
  
            console.log(result)
            if(result.affectedRows > 0){
                res.json({message:"product deleted"})
            }else{
            res.json({message:"product do not exist"})
            }
        }catch(e){
            res.json({message:e.message})
            console.log(e.message)
        }
        })


app.delete("/orders/:id",isAdmin,async(req,res) =>{
            try{
                const {id} = req.params;
                const [result] = await pool.query(`DELETE FROM orders WHERE id = ?;`,[id])
      
                console.log(result)
                if(result.affectedRows > 0){
                    res.json({message:"order deleted"})
                }else{
                res.json({message:"order do not exist"})
                }
            }catch(e){
                res.json({message:e.message})
                console.log(e.message)
            }
            })



/******************************************************************************************************************** */


app.use((req,res,next)=>{
   
    res.send("we have some trouble with your request")
    
})

app.listen(PORT,()=>{
    console.log(`listening on port ${PORT}`)
})

