var app=angular.module("app",[]);
app.controller("pdf-controller",['$scope','$http',function($scope,$http)
{
    $scope.showCounter0=true
    $scope.showCounter1=true
    $scope.data={
        pdf:{
            pages:1,
            counting:'horizontal'
        },
        page:{
            width:480,
            heigth:330,
            margin:0
        },
        matrix:{
            columns:2,
            rows:5,
            width:185,
            heigth:50,
            image:'test.jpg'
        },
        counter:[
            {
                width:10,
                heigth:5,
                pad:3,
                font:'calibri.ttf',
                fontSize:14,
                color:{c:0,m:100,y:100,k:0},
                staticTXT:'No.'
            },
            {
                width:160,
                heigth:5,
                pad:3,
                font:'calibri.ttf',
                fontSize:14,
                color:{c:0,m:100,y:100,k:0},
                staticTXT:'No.'
            },
        ],
        counterStart:1,
        cutContour:false,
        cutContourSpace:5,

        cropmarks:false,
        cropmarksSpace:0,
        cropmarksLength:5,
        cropmarksColor:'black',
        cropmarksBleed:1,
    }
    $scope.onSubmit=function()
    {
        
    }
    $scope.save=function()
    {
        var data="text/json;charset=utf-8," + encodeURIComponent(JSON.stringify($scope.data))
        $('#saveConf').attr('href','data:'+data)
        $('#saveConf').attr('download','configuration.json')
    }
    $scope.fileNameChanged=function(event,scope)
    {
        var input = event.target;
        var reader = new FileReader()
        reader.onload=function()
        {
            var data=JSON.parse(reader.result)
            $scope.data=data
            $scope.$digest()
        };
        reader.readAsText(input.files[0]);
         
    }
}])
function loadConf()
{
    $('#loadConfFile').trigger("click");
}