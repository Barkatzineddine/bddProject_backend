const express = require("express")
const app = express()
const jwt = require("jsonwebtoken")
const bcrypt = require('bcryptjs')
const mysql = require("mysql2")
const dotenv = require("dotenv")
dotenv.config() 
const pool = mysql.createPool({
    host:process.env.mysql_host,
    user:process.env.mysql_user,
    password:process.env.mysql_password,
    database:process.env.mysql_database
 }).promise()

module.exports.getproducts = async() =>{
    const [rows]  = await pool.query("select * from products")
    console.log(rows)
    return rows
    }

module.exports.getreviews = async() =>{
        const [rows]  = await pool.query(`
        SELECT
    r.id AS review_id,
    r.text,
    r.date,
    r.rating,
    p.title as product_title,
    p.id as product_id, 
    u.username 
FROM
    reviews r
JOIN
    products p ON r.product_id = p.id
JOIN
    users u ON r.user_id = u.user_id;`)
        console.log(rows)
        return rows
        }

module.exports.getimages = async() =>{

        const [rows]  = await pool.query(`
        SELECT
        i.id AS image_id,
        i.posting_date,
        i.path,
        p.title as product_title,
        p.id as product_id
    FROM
        images i
    JOIN
        products p ON i.product_id = p.id
   `)
            console.log(rows)
            return rows
    }

module.exports.getorders = async() =>{

        const [rows]  = await pool.query(`
        SELECT
        o.id AS order_id,
        o.date,
        u.username,
        p.title as product_title,
        p.id as product_id
    FROM
        orders o
    JOIN
        products p ON o.product_id = p.id
    JOIN
        users u ON o.user_id = u.user_id
   `)
            console.log(rows)
            return rows
    }
/********************************************************************* */
    module.exports.getorders2 = async() =>{

        const [orders]  = await pool.query(`
        select 
		o.id as order_id,o.date as order_date,
        u.user_id,u.username,u.email,p.title as product_title,
        p.price as product_price,
        p.id as product_id
		from orders as o join users as u on o.user_id=u.user_id 
        join products as p on o.product_id=p.id;
   `)
   const [products] = await pool.query(`
   SELECT
       distinct(p.id),
       i.path as image_path,
       p.title,
       p.posted,
       p.price

      
   FROM
       images i
   right JOIN
       products p ON i.product_id = p.id
       ;
`)
products.forEach((product) =>{ 
   product.orders=[];
   orders.forEach((order)=>{
       if(order.product_id===product.id){
           return product.orders.push(order)
       }
   })
}); 

        return products
    }
/*********************************************************************** */
module.exports.getusers = async() =>{
        const [rows]  = await pool.query(`select * from users where type="user"`)
        console.log(rows)
        return rows
        }
    
module.exports.getuser = async(id) =>{
            const [rows]  = await pool.query(`select * from users
             where user_id=? and type="user"`,[id])
            console.log(rows)
            return rows
        }
   
            
module.exports.getproduct = async(id) =>{
    const [rows] = await pool.query(
    `select * from products
     where id = ?
     `,[id])
    
    return rows[0]
    
}

module.exports.getreview = async(id) =>{
    const [rows] = await pool.query(`
    SELECT
        r.id AS review_id,
        r.text,
        r.date,
        p.title as product_title,
        p.id as product_id,
        u.username
    FROM
        reviews r
    JOIN
        products p ON r.product_id = p.id
    JOIN
        users u ON r.user_id = u.user_id
    WHERE
        r.id = ?;
`,[id])

    
    return rows[0]
    
}

module.exports.getimage = async(id) =>{
    const [rows] = await pool.query(`
    SELECT
        i.id AS image_id,
        i.path,
        i.posting_date,
        p.id as product_id
       
    FROM
        images i
    JOIN
        products p ON i.product_id = p.id

    WHERE
        i.id = ?;
`,[id])
 
    return rows[0]
    
}
module.exports.getimageByproductid = async(id) =>{
    const [rows] = await pool.query(`
    SELECT
        i.id AS image_id,
        i.path,
        i.posting_date,
        p.id as product_id
       
    FROM
        images i
    JOIN
        products p ON i.product_id = p.id

    WHERE
        i.product_id = ?;
`,[id])
 
    return rows[0]
    
}

module.exports.getproducts2 = async() =>{

    const [reviews] = await pool.query(`
    SELECT 
  r.id as review_id,r.text,r.rating,r.date,p.id as product_id,
  p.title,p.posted,p.price,u.user_id,u.username,u.email
  from reviews as r join products as p on r.product_id=p.id
     join users as u on r.user_id=u.user_id;
`)
    const [products] = await pool.query(`
    SELECT
		distinct(p.id),
        i.path as image_path,
        p.title,
        p.posted,
        p.price

       
    FROM
        images i
    right JOIN
        products p ON i.product_id = p.id
        ;
`)
products.forEach((product) =>{ 
    product.reviews=[];
    reviews.forEach((review)=>{
        if(review.product_id===product.id){
            return product.reviews.push(review)
        }
    })
}); 

    return products;
}

module.exports.getproduct2 = async(id) =>{

    const [reviews] = await pool.query(`
    SELECT 
  r.id as review_id,r.text,r.rating,r.date,p.id as product_id,
  p.title,p.posted,p.price,u.user_id,u.username,u.email
  from reviews as r join products as p on r.product_id=p.id
     join users as u on r.user_id=u.user_id
     where product_id = ?;
`,[id])
    const [product] = await pool.query(`
    SELECT
		distinct(p.id),
        i.path as image_path,
        p.title,
        p.posted,
        p.price

       
    FROM
        images i
    right JOIN
        products p ON i.product_id = p.id
     where p.id = ?   ;
`,[id])

   product[0].reviews=[];
    reviews.forEach((review)=>{
        
            return product[0].reviews.push(review)
        
    })


    return product[0];
}


module.exports.getorder = async(id) =>{
    const [rows] = await pool.query(`
    SELECT
        o.id AS order_id,
        o.date,
        p.id as product_id,
        u.user_id 
       
    FROM
        orders o
    JOIN
        products p ON o.product_id = p.id
    join
        users u on o.user_id= u.user_id

    WHERE
        o.id = ?;
`,[id])
 
    return rows[0]
    
}

module.exports.getorder2 = async(user_id) =>{
    const [orders] = await pool.query(`
    select distinct(o.id) as order_id,
    o.date as order_date,
    o.user_id,
    p.title as product_title,
    p.id as product_id,
    i.path as product_image,
    p.price as product_price from orders as o join products as p on o.product_id=p.id
    join images as i on i.product_id=p.id
    where o.user_id=?;
`,[user_id])
 
    return orders
    
}




module.exports.createproduct = async(title,price,images) =>{
    
    const [result1] = await pool.query(`
    insert into products (title,price)
    values (?,?);
    `,[title,price])
    const transformedImages = images.map(({ path }) => [path, result1.insertId]);
    console.log(transformedImages)
    const [result2] = await pool.query(`
    insert into images (path,product_id)
    values ?`,[transformedImages])


    return {productResult:result1,imageResult:result2}
}

module.exports.updateproduct = async(product_id,title,price,image) =>{

    if(title.length!==0){   

        const [result1] = await pool.query(`
            UPDATE products
            SET title = ?
            WHERE id = ?;
        `,[title,product_id])
    }

    if(price.length!==0){   
        const [result3] = await pool.query(`
            UPDATE products
            SEt price = ?
            WHERE id = ?;
        `,[price,product_id])
    }
    if(image!==undefined){  
        image=image.path;
    const [result2] = await pool.query(`
    update images set path=?
    where product_id = ?;
    `,[image,product_id])
    }else{
        console.log("image is unddefined")
    }

    return "update done"
}

module.exports.createreview = async(text,rating,product_id,user_id) =>{
    const result = await pool.query(`
    insert into reviews (text,rating,product_id,user_id)
    values (?,?,?,?)
    `,[text,rating,product_id,user_id])
   
    return result
}

module.exports.createorder = async(product_id,user_id) =>{
    const result = await pool.query(`
    insert into orders (product_id,user_id)
    values (?,?)
    `,[product_id,user_id])
   
    return result
}

module.exports.authenticateToken = async(req,res,next)=>{
    
    const token = req.cookies.jwt
    if(!token) {       
        return res.status(200).json({access:false,message:"not loged in"})
     }
    jwt.verify(token,process.env.token,(err,user)=>{
        if(err) return res.sendStatus(403)
        req.user = user
        res.json({access:true,user:user})
         
    })
}




module.exports.isAdmin = async(req,res,next)=>{
    
    const token = req.cookies.jwt
    if(!token) {       
        return res.status(200).json({access:false,message:"not loged in"})
     }
    jwt.verify(token,process.env.token,(err,user)=>{
        if(err) return res.sendStatus(403)
        if(user.type ==="admin"){
            
            req.user = user;
            next()
        }else{
            res.json({access:false,message:"sorry you are not the admin"})
            console.log("not an admin")
        }
       
         
    })
}

module.exports.isUser = async(req,res,next)=>{
    
    const token = req.cookies.jwt
    if(!token) {       
        return res.status(200).json({access:false,message:"not loged in"})
     }
    jwt.verify(token,process.env.token,(err,user)=>{
        if(err) return res.sendStatus(403)
        if(user.type ==="admin" || user.type ==="user"){
            
            req.user = user;
            next()
        }else{
            res.json({message:"sorry you are not allowed"})
        }
       
         
    })
}



module.exports.deleteUser = async(id)=>{
        
        const [result] = await pool.query(`DELETE FROM users WHERE user_id = ? and type="user";`,[id])
        console.log(result)
        return result
         
    }