var path = require('path');
var vow = require('vow');
var pseudo = require('enb-pseudo-levels');
var bundleBuilder = require('./builders/sets-bundle-builder');

module.exports = function(config) {
    config.task('sets', function(task) {
        var args = [].slice.call(arguments, 1);
        var makePlatform = task.getMakePlatform();
        var cdir = makePlatform.getDir();

        return vow.all([
                pseudo(getDesktopLibLevels(config))
                    .addBuilder('desktop.tests', bundleBuilder({ sublevelSuffixes : ['tests'] }))
                    .build(),
                pseudo(getTouchPadLibLevels(config))
                    .addBuilder('touch-pad.tests', bundleBuilder({ sublevelSuffixes : ['tests'] }))
                    .build(),
                pseudo(getTouchPhoneLibLevels(config))
                    .addBuilder('touch-phone.tests', bundleBuilder({ sublevelSuffixes : ['tests'] }))
                    .build()
            ])
            .then(function(targetsList) {
                var targets = (args.length && args) ||
                        Array.prototype.concat.apply([], targetsList)
                            .filter(function(target) {
                                var suffix = target.split('.').pop();

                                return suffix !== 'blocks';
                            })
                            .map(function(target) {
                                return path.dirname(target);
                            });

                makePlatform.loadCache();

                return makePlatform.init(cdir)
                    .then(function() {
                        return makePlatform.buildTargets(targets);
                    });
            });
    });

    config.nodes(['*.pages/*', '*.tests/*/*'], function(nodeConfig) {
        nodeConfig.addTechs([
            [require('enb/techs/file-provider'), { target : '?.bemjson.js' }],
            [require('enb/techs/bemdecl-from-bemjson')],
            [require('enb/techs/bemdecl-from-deps-by-tech'), {
                sourceTech : 'js',
                destTech : 'bemhtml',
                target : '?.bemhtml.bemdecl.js'
            }],
            [require('enb/techs/deps')],
            [require('enb/techs/files')],
            [require('enb/techs/deps'), {
                bemdeclTarget : '?.bemhtml.bemdecl.js',
                depsTarget : '?.bemhtml.deps.js'
            }],
            [require('enb/techs/files'), {
                depsTarget : '?.bemhtml.deps.js',
                filesTarget : '?.bemhtml.files',
                dirsTarget : '?.bemhtml.dirs'
            }],
            [require('enb-roole/techs/css-roole'), { target : '?.noprefix.css' }],
            [require('enb-diverse-js/techs/browser-js')],
            [require('enb-bemxjst/techs/bemhtml-old'), { devMode : false }],
            [require('enb-bemxjst/techs/bemhtml-old'), {
                target : '?.browser.bemhtml.js',
                filesTraget : '?.bemhtml.files',
                devMode : false
            }],
            [require('enb/techs/file-merge'), {
                sources : ['?.browser.bemhtml.js', '?.browser.js'],
                target : '?.pre.js'
            }],
            [require('enb-modules/techs/prepend-modules'), {
                source : '?.pre.js',
                target : '?.js'
            }],
            [require('enb/techs/html-from-bemjson')]
        ]);

        nodeConfig.addTargets([
            '_?.css', '_?.js', '?.html'
        ]);
    });

    config.nodes(['desktop.pages/*', 'desktop.tests/*/*'], function(nodeConfig) {
        nodeConfig.addTechs([
            [require('enb/techs/levels'), { levels : getDesktopLevels(config) }],
            [require('enb-autoprefixer/techs/css-autoprefixer'), {
                sourceTarget : '?.noprefix.css',
                destTarget : '?.css',
                browserSupport : getDesktopBrowsers()
            }]
        ]);
    });

    config.nodes(['touch-pad.pages/*', 'touch-pad.tests/*/*'], function(nodeConfig) {
        nodeConfig.addTechs([
            [require('enb/techs/levels'), { levels : getTouchPadLevels(config) }],
            [require('enb-autoprefixer/techs/css-autoprefixer'), {
                sourceTarget : '?.noprefix.css',
                destTarget : '?.css',
                browserSupport : getTouchPadBrowsers()
            }]
        ]);
    });

    config.nodes(['touch-phone.pages/*', 'touch-phone.tests/*/*'], function(nodeConfig) {
        nodeConfig.addTechs([
            [require('enb/techs/levels'), { levels : getTouchPhoneLevels(config) }],
            [require('enb-autoprefixer/techs/css-autoprefixer'), {
                sourceTarget : '?.noprefix.css',
                destTarget : '?.css',
                browserSupport : getTouchPhoneBrowsers()
            }]
        ]);
    });

    config.mode('development', function() {
        config.nodes(['*.pages/*', '*.tests/*/*'], function(nodeConfig) {
            nodeConfig.addTechs([
                [require('enb/techs/file-copy'), { sourceTarget : '?.css', destTarget : '_?.css' }],
                [require('enb/techs/file-copy'), { sourceTarget : '?.js', destTarget : '_?.js' }]
            ]);
        });
    });

    config.mode('production', function() {
        config.nodes(['*.pages/*', '*.tests/*/*'], function(nodeConfig) {
            nodeConfig.addTechs([
                [require('enb/techs/borschik'), { sourceTarget : '?.css', destTarget : '_?.css' }],
                [require('enb/techs/borschik'), { sourceTarget : '?.js', destTarget : '_?.js' }]
            ]);
        });
    });
};

function getDesktopLibLevels(config) {
    return [
        'common.blocks',
        'desktop.blocks'
    ].map(function(level) {
        return config.resolvePath(level);
    });
}

function getTouchPadLibLevels(config) {
    return [
        'common.blocks',
        'touch.blocks'
    ].map(function(level) {
        return config.resolvePath(level);
    });
}

function getTouchPhoneLibLevels(config) {
    return [
        'common.blocks',
        'touch.blocks'
    ].map(function(level) {
        return config.resolvePath(level);
    });
}

function getDesktopLevels(config) {
    return [
        { path : 'libs/bem-core/common.blocks', check : false },
        { path : 'libs/bem-core/desktop.blocks', check : false },
        'common.blocks',
        'desktop.blocks',
        'design/common.blocks',
        'design/desktop.blocks'
    ].map(function(level) {
        return config.resolvePath(level);
    });
}

function getTouchPadLevels(config) {
    return [
        { path : 'libs/bem-core/common.blocks', check : false },
        { path : 'libs/bem-core/touch.blocks', check : false },
        'common.blocks',
        'touch.blocks',
        'design/common.blocks',
        'design/touch.blocks',
        'design/touch-pad.blocks'
    ].map(function(level) {
        return config.resolvePath(level);
    });
}

function getTouchPhoneLevels(config) {
    return [
        { path : 'libs/bem-core/common.blocks', check : false },
        { path : 'libs/bem-core/touch.blocks', check : false },
        'common.blocks',
        'touch.blocks',
        'design/common.blocks',
        'design/touch.blocks',
        'design/touch-phone.blocks'
    ].map(function(level) {
        return config.resolvePath(level);
    });
}

function getDesktopBrowsers() {
    return [
        'last 2 versions',
        'ie 10',
        'ff 24',
        'opera 12.16'
    ];
}

function getTouchPadBrowsers() {
    return [
        'android 4',
        'ios 5'
    ];
}

function getTouchPhoneBrowsers() {
    return [
        'android 4',
        'ios 6',
        'ie 10'
    ];
}
