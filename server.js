// to-do
// 使用者驗證
// 資料庫

var port = process.argv[2] || 8080;

var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

//log
app.all('*', (req, res, next) => {
    console.log('\n-----------------------------------', new Date(), '-----------------------------------');
    console.log(req.method, ' ', req.originalUrl);
    next();
});

//static file
app.use(express.static(__dirname + '/public'));

//post body
app.use(bodyParser());

//function
app.post('/api/order/:template', post_orders);
app.get('/api/download/:key/:filename', get_download);
app.get('/api/template', get_template_list);
app.get('/api/template/:template', get_template);

//listen
app.listen(port, () => {
    console.log('The server listening on port ', port);
});


var DB = [];

//success: key, fail: error messsage
function post_orders(req, res, next) {

    var orders = req.body.orders;
    var template = req.params.template;
    //console.log(JSON.stringify(orders));
    //console.log(template);

    //檢查orders
    if (!orders || !Array.isArray(orders) || orders.length == 0) {
        res_error(res, 400, 'orders data error...');
    }

    //檢查template
    if (!template || !fs.existsSync('./template/' + template)) {
        res_error(res, 404, 'template not found...');
    }

    //檢查order
    orders.forEach((order) => {

        if (!order.pairs)
            order.pairs = [];

        if (!order.page || !Array.isArray(order.pairs)) {
            res_error(res, 400, 'orders data error...');
        }

        //檢查order.pair
        order.pairs.forEach((pair) => {
            if (pair.key == undefined || pair.value == undefined) {
                res_error(res, 400, 'every pair needs key and value...');
            }
        });
    });

    //debug
    orders.forEach((order) => {
        console.log('page: ', order.page);
        console.log('pairs: \n', order.pairs);
    });

    //儲存
    var key = DB.length;
    DB.push({
        template: template,
        orders: orders
    });

    //Success
    res.send({
        key: key
    });
}

var Presentation = require('ppt-template').Presentation;

//產生並下載.pptx
function get_download(req, res, next) {

    var key = req.params.key;
    var filename = req.params.filename;

    //檢查key
    if (!key || !DB[key]) {
        res_error(res, 404, 'key not found...');
    }

    //讀取資料
    var data = DB[key];
    var orders = data.orders;
    var template = data.template

    //製作PPT
    var presentation = new Presentation();

    presentation.loadFile('./template/' + template)

    .then(() => {

        var sildes = [];

        //製作PPTX
        orders.forEach((order) => {

            var templateSlide = presentation.getSlide(order.page);

            //檢查slide 是否存在
            if (!templateSlide) {
                res_error(res, 404, 'page ' + order.page + ' out of range');
            }

            sildes.push(templateSlide.clone().fill(order.pairs));
        });

        //產生PPT檔案
        console.log('generate PPT');
        return presentation.generate(sildes);

    })

    .then((newPresentation) => {

        //串流檔案
        console.log('stream file');
        res.type('application/vnd.openxmlformats-officedocument.presentationml.presentation');
        return newPresentation.streamAs(res);

    })

    .then(() => {
        console.log('success');
    })

    .catch(function(e) {
        console.error(e);
    });

}

function get_template_list(req, res, next) {

    fs.readdir('./template', (err, files) => {
        res.send({
            files: files
        });
    })


}

function get_template(req, res, next) {

    var template = req.params.template;
    var path = './template/' + template;

    //檢查template
    if (!template || !fs.existsSync(path)) {
        res_error(res, 404, 'template not found...');
    }

    res.download(path, template);
}

function res_error(res, code, msg) {
    res.status(code).end(JSON.stringify({
        error: msg
    }));
    throw msg;
}
