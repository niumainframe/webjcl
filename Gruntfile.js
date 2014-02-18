module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        
        pkg: grunt.file.readJSON('package.json'),
        
        
        jasmine_node: {
            
            integration: {
                
                apiEndpoint: "http://localhost:8000",
                auth: { user: "goodUser", pass: "goodPass" },
                
                specNameMatcher: "spec", // load only specs containing specNameMatcher
                specFolders: ['./tests/integration'],
                requirejs: false,
                forceExit: false
            }
        }
        
        
    });

    grunt.loadNpmTasks('grunt-jasmine-node');

    // Default task(s).
    grunt.registerTask('default', ['jasmine_node']);

};
