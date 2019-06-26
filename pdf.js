const express = require('express')
const router = express.Router()
//const PDFDocument = require('pdfkit')
const PDFDocument = require('./modules/pdfkit.js')     //https://github.com/sajjad-shirazy/pdfkit   *addSpotColor()
const fs = require('fs');
const padStart=require('string.prototype.padstart');
const path=require('path')
// pt to mm conversion multiplier
const pt=2.834

router.all('/pdf', (req,res,next) =>
{
    try
    {
        const data=req.body.data||{}
        if(typeof data.pdf===undefined||data.pdf==null)
            data.pdf={
                pages:1,
                counting:'horizontal',
            }
        const pages=parseInt(data.pdf.pages||1)
        if(typeof data.page===undefined||data.page==null)
            data.page={
                margin:0,
                width:480,
                heigth:330
            }
        var pageWindth=(data.page.width)*pt
        var pageHeigth=(data.page.heigth)*pt
        var pageMargin=(data.page.margin)*pt
        const doc = new PDFDocument({ 
           // margin:pageMargin,
             margin:0,
            size:[pageWindth,pageHeigth],
            info:{
                Title:'Vision Group Counter',
                Author:'Vision Group',
            },
            
        })
        var cutContour=false
        if(data.cutContour)
            cutContour=true
        var cutContourSpace=0
        if(data.cutContourSpace)
            cutContourSpace=parseInt(data.cutContourSpace)*pt
        //
        var cropmarks=false
        if(data.cropmarks)
            cropmarks=true
        var cropmarksSpace=0
        if(data.cropmarksSpace)
            cropmarksSpace=parseInt(data.cropmarksSpace)*pt
        var cropmarksLength=0
        if(data.cropmarksLength)
            cropmarksLength=parseInt(data.cropmarksLength)*pt
        var cropmarksColor='black'
        if(data.cropmarksColor)
            cropmarksColor=data.cropmarksColor
        var cropmarksBleed=1
         if(data.cropmarksBleed)
            cropmarksBleed=parseInt(data.cropmarksBleed)*pt
        //
        doc.page.dictionary.data.TrimBox=[0,0,pageWindth, pageHeigth]
        doc.page.dictionary.data.BleedBox=[0,0,pageWindth, pageHeigth]
        //doc.page.dictionary.data.ArtBox=[0,0,pageWindth, pageHeigth]
        if(typeof data.matrix===undefined||data.matrix==null)
            data.matrix={
                columns:2,
                rows:5,
                width:185,
                heigth:50
            }
        var image=data.matrix.image||'test.jpg'
        var columns=data.matrix.columns
        var rows=data.matrix.rows
        var w=(data.matrix.width||10)*pt
        var h=(data.matrix.heigth||10)*pt
        var y=pageMargin
        //var x=pageMargin
        var x=0;
       // var y=0;
        if(!Array.isArray(data.counter))
            data.counter=[]
       if(!data.counter[0])
            data.counter[0]={
                width:10,
                heigth:5,
                start:1,
                pad:3,
                fontSize:14,
                font:'calibri.ttf',
                color:{c:0,m:100,y:100,k:0},
                showCounter:'on'
            };
        if(!data.counter[1])
            data.counter[1]={
                width:160,
                heigth:5,
                start:1,
                pad:3,
                fontSize:14,
                font:'calibri.ttf',
                color:{c:0,m:100,y:100,k:0},
                showCounter:'on'
            };
        // Init POST data for Counters
        var counterData=[]
        data.counter.forEach((c,i)=>
        {
            counterData[i]={}
            counterData[i].xPos=parseInt(c.width||10)*pt
            counterData[i].yPos=parseInt(c.heigth||5)*pt
            counterData[i].pad=parseInt(c.pad||3)
            counterData[i].font=c.font||'calibri.ttf'
            counterData[i].fontSize=parseInt(c.fontSize||14)
            counterData[i].colorC=parseInt(c.color.c||0)
            counterData[i].colorM=parseInt(c.color.m||100)
            counterData[i].colorY=parseInt(c.color.y||100)
            counterData[i].colorK=parseInt(c.color.k||0)
            counterData[i].staticTXT=c.staticTXT||''
            counterData[i].showCounter=c.showCounter=='on'
        });
        //Register Fonts
        counterData.forEach(c=>
        {
            doc.registerFont(c.font,'./fonts/'+c.font)
        })
        var step=0
        if(data.pdf.counting=='vertical')
        {
            var cnt=0
            var v_step=1
            if(data.counter[0].start)
                var v_step=parseInt(data.counter[0].start)
        }
        else
        {
            var cnt=1
            if(data.counter[1].start)
                cnt=parseInt(data.counter[0].start)       
        }
        doc.addSpotColor('CutContour',0,0,0,254);
        doc.addSpotColor('White',0,0,0,0);
        for(var p=0;p<pages;p++)
        {
            for(var j=0;j<rows;j++)
            {
                //x=pageMargin
                x=0
                for(var i=0;i<columns;i++)
                {
                    if(data.pdf.counting=='vertical')
                        step=v_step+cnt*pages
                    else
                        var step=cnt
                    cnt++
                    
                    if(cutContour)
                    {
                        var xx=(cutContourSpace*i)+x
                        var yy=(cutContourSpace*j)+y
                        doc
                        .rect(xx,yy,w,h)
                        .lineWidth(1)
                        .fillAndStroke('White','CutContour')
                        .image('images/'+image,xx,yy,{width:w,height:h})  
                    }
                    else
                        if(cropmarks)
                        {
                            var lw=cropmarksBleed/10
                            var bleed=lw/2
                            var xx=(cropmarksSpace*i)+x
                            var yy=(cropmarksSpace*j)+y
                            var line=cropmarksLength
                            if(i==0||j==0)
                                doc
                                .lineWidth(lw)
                                .lineCap('butt')
                                .moveTo(xx-line,yy-bleed)
                                .lineTo(xx,yy-bleed)
                                .moveTo(xx-bleed,yy-line)
                                .lineTo(xx-bleed,yy)
                                .stroke(cropmarksColor)
                            if(i==0||j==columns-1)
                                doc
                                .lineWidth(lw)
                                .lineCap('butt')
                                .moveTo(xx-line,yy+h+bleed)
                                .lineTo(xx,yy+h+bleed)
                                .moveTo(xx-bleed,yy+h)
                                .lineTo(xx-bleed,yy+h+line)
                                .stroke(cropmarksColor)
                            if(j==0||i==rows-1)
                                doc
                                .lineWidth(lw)
                                .lineCap('butt')
                                .moveTo(xx+w,yy-bleed)
                                .lineTo(xx+w+line,yy-bleed)
                                .moveTo(xx+w+bleed,yy-line)
                                .lineTo(xx+w+bleed,yy)
                                .stroke(cropmarksColor)
                            if(j==columns-1||i==rows-1)
                                doc
                                .lineWidth(lw)
                                .lineCap('butt')
                                .moveTo(xx+w,yy+h+bleed)
                                .lineTo(xx+w+line,yy+h+bleed)
                                .moveTo(xx+w+bleed,yy+h)
                                .lineTo(xx+w+bleed,yy+h+line)
                                .stroke(cropmarksColor)
                            
                                doc
                                .image('images/'+image,xx,yy,{width:w,height:h})
                        }
                        else
                            doc.image('images/'+image,x,y,{width:w,height:h})
                    // Adds Counters to PDF
                    counterData.forEach(c=>
                    {
                        if(c.showCounter)
                        {
                            var xx=x
                            var yy=y
                            if(cutContour)
                            {
                                xx=(cutContourSpace*i)+x
                                yy=(cutContourSpace*j)+y
                            }
                            if(cropmarks)
                            {
                                xx=(cropmarksSpace*i)+x
                                yy=(cropmarksSpace*j)+y
                            }
                            doc.font(c.font)
                            doc.fontSize(c.fontSize)
                            doc.fillColor([c.colorC,c.colorM,c.colorY,c.colorK])
                            doc.text(c.staticTXT+padStart(step,c.pad,0),xx+c.xPos,yy+c.yPos)
                        }
                    })
                    x+=w
                }
                y+=h 
            }
            //x=pageMargin
            //y=pageMargin
            x=0
            y=pageMargin
            if(data.pdf.counting=='vertical')
            {
                cnt=0
                v_step++
            }
            if(p<pages-1)
            {
                var docPage=doc.addPage()
                docPage.page.dictionary.data.TrimBox=[0,0,pageWindth, pageHeigth]
                docPage.page.dictionary.data.BleedBox=[0,0,pageWindth, pageHeigth]
               // docPage.page.dictionary.data.ArtBox=[0,0,pageWindth, pageHeigth]
            }
        }
        doc.end()
        res.status(200).setHeader('Content-type', 'application/pdf')
        doc.pipe(res)
    }
    catch(e)
    {
        console.log(e)
    }
})
module.exports = router