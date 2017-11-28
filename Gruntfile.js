module.exports = function(grunt) {
  grunt.initConfig({
    qunit: {
      all: {
        options: {
          urls: [
            'http://localhost:8000/test/test.html',
          ]
        }
      }
    },
    connect: {
      server: {
        options: {
          port: 8000,
          base: '.'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.registerTask('test', ['connect', 'qunit']);
}
