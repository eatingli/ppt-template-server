var Presentation = require('ppt-template').Presentation;
//var mime = require('mime');
//console.log(mime.lookup('.pptx'));


module.exports = post_generate;

function post_generate(req, res, next) {

    var orders = req.body.orders;
    //console.log(JSON.stringify(orders));

    if (!orders) {
        res.status(400).end('Enpty orders...');
        //return console.error('Enpty orders...');
        throw 'Enpty orders...';
    }

    //debug
    orders.forEach(function(order) {
        console.log('template: ', order.template);
        console.log('pairs: ', order.pairs);
    });

    //Presentation
    var presentation = new Presentation();
    presentation.loadFile('./template/' + req.params.template)
        .then(() => {

            var sildes = [];

            //製作PPTX
            for (var i = 0; i < orders.length; i++) {

                var order = orders[i];
                var templateSlide = presentation.getSlide(order.template);
                if (!templateSlide) {
                    res.status(400).end('Slide索引超出範圍');
                    throw 'Slide索引超出範圍'

                }
                sildes.push(templateSlide.clone().fill(order.pairs));
            }

            console.log('產生PPTX');

            return presentation.generate(sildes);

        }).then((newPresentation) => {

            //設定串流標頭
            res.setHeader("content-type", "application/octect-stream");
            res.setHeader('Content-disposition', 'attachment; filename=' + req.params.filename);

            console.log('串流檔案');

            //串流檔案
            return newPresentation.streamAs(res);

        }).then(() => {
            console.log('success');
        }).catch(function(e) {
            console.error(e);
        });
}