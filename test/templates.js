var Vow = require('enb/node_modules/vow');
var fs = require('fs');
var requireOrEval = require('enb/lib/fs/require-or-eval');

function req(file) { delete require.cache[require.resolve(file)]; return require(file); };

var processors = [
        {
            name : 'bh',
            engine : function() {
                return req('../desktop.pages/index/index.bh.js');
            }
        },
        {
            name : 'bemhtml',
            engine : function() {
                return req('../desktop.pages/index/index.bemhtml.js').BEMHTML;
            }
        }
    ],
    tries = 10,
    pages = 80;

requireOrEval(fs.realpathSync('./desktop.pages/index/index.bemjson.js')).then(function(json) {
    var content = [];
    for(var j = 0; j < pages; j++) content = content.concat(json.content);
    json.content = content;

    processors.map(function(p) {
        var avg = 0;
        var min = 100500;
        var max = 0;
        var engine = p.engine();

        console.log('>>>>>', p.name.toUpperCase());
        console.log('try\ttime\tsize');

        for(var i = tries; i--;) {
            try {
                var data = JSON.parse(JSON.stringify(json));
                var start = new Date().getTime();
                var html = engine.apply(data);
                var end = new Date().getTime();
                var time = end - start;

                if(i) {
                    avg += time;
                    min = Math.min(min, time);
                    max = Math.max(max, time);
                }

                console.log(
                    ' ' + (tries - i - 1) + '\t' +
                    (end - start) + '\t' +
                    html.length
                );
            } catch(e) { console.log(e) }
        }

        avg = Math.round(avg / (tries - 1));
        console.log('avg:\t' + avg, '±', Math.round((max - min) / avg * 50) + '%');
    });
});
