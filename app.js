const express=require('express')
const path=require('path')
const fs=require('fs');
const bodyParser=require('body-parser')
const pdf=require('./pdf')

app=new express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

//Pug
app.set('views',path.join(__dirname,'view'));
app.set('view engine','pug');


app.get('',(req,res,next)=>
{
    fs.readdir('./fonts',(err,files)=>
    {
        var fonts=[]
        files.forEach(file=>
        {
            fonts[fonts.length]=file
        });
        fs.readdir('./images',(err,imges)=>
        {
            var images=[]
            imges.forEach(image=>
            {
                images[images.length]=image
            });
            return res.status(200).render('index',
            {
                title:"Vision Group PDF Maker",
                fonts:fonts,
                images:images
            })
        })
     })
})
app.all('/pdf',pdf)

app.use('/js',express.static(path.join(__dirname,'js'),{maxAge:0}))
app.use('/pdf',express.static(path.join(__dirname,'pdf'),{maxAge:0}))
app.use('/font',express.static(path.join(__dirname,'font'),{maxAge:0}))

app.listen(8082)