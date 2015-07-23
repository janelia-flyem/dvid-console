module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    browserify: {
      options: {
        //transform:  [ require('grunt-react').browserify ]
        transform:  [ "babelify" ]
      },
      app:          {
        src:        'js/app.js',
        dest:       'build/bundle.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'build/bundle.js',
        dest: 'build/bundle.min.js'
      }
    },
    copy: {
      main: {
        expand: true,
        cwd: 'build/',
        src: '*.min.js',
        flatten: true,
        dest: 'dist/js/'
      },
      vendor: {
        expand: true,
        src: 'js/vendor/**',
        dest: 'dist/'
      },
      css: {
        src: 'css/**',
        dest: 'dist/',
        expand: true
      },
      fonts: {
        src: 'fonts/**',
        dest: 'dist/',
        expand: true
      },
      index: {
        src: 'dist.html',
        dest: 'dist/index.html'
      }
    },
    watch: {
      scripts: {
        files: ['js/**/*.js'],
        tasks: ['browserify']
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Default task(s).
  grunt.registerTask('default', ['browserify']);
  grunt.registerTask('dist', ['browserify','uglify','copy']);

};
