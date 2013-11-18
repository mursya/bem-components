({
    block : 'page',
    mods : { theme : 'example' },
    head : [
        { elem : 'css', url : '_simple.css', ie : false },
        { elem : 'js', url : '_simple.js' }
    ],
    content : { tag : 'table', content : [
        {
            block : 'input',
            id : 'id0',
            mods : { size : 's', 'disabled' : true },
            name : 'name0',
            val : 'value0'
        },
        {
            block : 'input',
            mods : { size : 'm', 'has-clear' : true },
            id : 'id1',
            name : 'name1',
            val : 'value1'
        },
        {
            block : 'input',
            mods : { size : 'l', 'has-clear' : true },
            id : 'id2',
            name : 'name2',
            val : 'value2',
            placeholder : 'hint2'
        },
        {
            block : 'input',
            mods : { size : 's' },
            id : 'id3',
            name : 'name3',
            val : '',
            placeholder : 'hint3'
        },
        {
            block : 'input',
            mods : { size : 'm', type : 'password' },
            id : 'id4',
            name : 'name4',
            val : 'password',
            placeholder : 'password'
        },
        {
            block : 'input',
            mods : { size : 'l', type : 'textarea' },
            id : 'id5',
            name : 'name5',
            val : 'long long long long long text'
        }
    ].map(function(input) {
        return {
            tag : 'tr',
            content : ['', 'simple', 'normal'].map(function(theme) {
                var c = JSON.parse(JSON.stringify(input));
                c.mods || (c.mods = {});
                c.mods.theme = theme;
                return {
                    tag : 'td',
                    content : c
                };
            })
        };
    }) }
});
