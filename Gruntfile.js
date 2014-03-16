var webjclConfig = require('./config.js');

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        
        pkg: grunt.file.readJSON('package.json'),
        
        unit: {},
        
        jasmine_node: {
            
            all: {
                specNameMatcher: "spec", 
                specFolders: ['./tests'],
                requirejs: false,
                forceExit: true
            },
            
            integration: {
                
                apiEndpoint: "http://localhost:" + webjclConfig.httpPort,
                auth: { user: "goodUser", pass: "goodPass" },
                ftpHost: webjclConfig.ftpHost,
                ftpPort: webjclConfig.ftpPort,
                
                specNameMatcher: "spec", 
                specFolders: [
                    './tests/v2/integration',
                    './tests/v2/E2E'
                ],
                requirejs: false,
                forceExit: true
            },
            
            unit: {
                specNameMatcher: "Spec",
                specFolders: [
                    './tests/v2/unit'
                    ],
                requirejs: false,
                forceExit: true
            },
        }
    });

    grunt.loadNpmTasks('grunt-jasmine-node');

    // Default task(s).
    grunt.registerTask('test', ['jasmine_node:all']);
    grunt.registerTask('test:integration', ['jasmine_node:integration']);
    grunt.registerTask('test:unit', ['jasmine_node:unit']);
    grunt.registerTask('default', ['test']); 

};
