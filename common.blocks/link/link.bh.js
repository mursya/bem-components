module.exports = function(bh) {

    bh.match('link', function(ctx, json) {
        ctx
            .tag('a')
            .js(true)
            .mix({ elem : 'control' });

        var attrs = {
                tabindex : json.tabIndex
            },
            url = json.url,
            typeOfUrl = typeof url;

        typeOfUrl !== 'undefined' && (attrs.href = typeOfUrl === 'string'?
            url :
            bh.apply(url));

        typeof attrs.href === 'undefined' &&
            typeof attrs.tabindex === 'undefined' &&
            (attrs.tabindex = 0);

        json.title && (attrs.title = json.title);
        json.target && (attrs.target = json.target);

        ctx.attrs(attrs);
    });

};
