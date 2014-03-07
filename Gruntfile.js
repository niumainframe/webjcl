module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        
        pkg: grunt.file.readJSON('package.json'),
        
        unit: {},
        
        jasmine_node: {
            
            all: {
                
                specNameMatcher: "spec", // load only specs containing specNameMatcher
                specFolders: ['./tests'],
                requirejs: false,
                forceExit: false
            },
            
            integration: {
                
                apiEndpoint: "http://localhost:8000",
                auth: { user: "goodUser", pass: "goodPass" },
                ftpHost: 'localhost',
                ftpPort: '2121',
                
                specNameMatcher: "spec", // load only specs containing specNameMatcher
                specFolders: [
                    './tests/integration',
                    './tests/v2/integration',
                    './tests/v2/E2E'
                ],
                requirejs: false,
                forceExit: false
            },
            
            unit: {
                specNameMatcher: "Spec",
                specFolders: [
                    './tests/v2/unit'
                    ],
                requirejs: false,
                forceExit: false
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
