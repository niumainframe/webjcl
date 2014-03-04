module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        
        pkg: grunt.file.readJSON('package.json'),
        
        
        jasmine_node: {
            
            integration: {
                
                apiEndpoint: "http://localhost:8000",
                auth: { user: "goodUser", pass: "goodPass" },
                ftpHost: 'localhost',
                ftpPort: '2121',
                
                specNameMatcher: "spec", // load only specs containing specNameMatcher
                specFolders: [
                    './tests/integration',
                    './tests/v2/integration'
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
            
            refactor_tests: {
                
                specNameMatcher: "Spec",
                specFolders: [
                    './tests/v2/unit'
                ],
                requirejs: false,
                forceExit: false
            }
        }
        
        
    });

    grunt.loadNpmTasks('grunt-jasmine-node');

    // Default task(s).
    grunt.registerTask('default', ['jasmine_node']);

};
