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
      img: {
        src: 'img/**',
        dest: 'dist/',
        expand: true
      },
      neuroglancer: {
        src: 'neuroglancer/**',
        dest: 'dist',
        expand: true
      },
      index: {
        src: 'dist.html',
        dest: 'dist/index.html'
      }
    },
    compress: {
      main: {
        options: {
          mode: 'tgz',
          archive: 'dvid-console-<%= pkg.version %>.tar.gz'
        },
        files: [
          { src: '**/*', cwd: 'dist/', dest: 'dvid-console/', expand: true }
        ]
      }
    },
    watch: {
      scripts: {
        files: ['js/**/*.js'],
        tasks: ['browserify']
      }
    },
    connect: {
        server: {
            options: {
              port: 4000
            }
        }
    },
  });

  // Load the plugins
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-connect');

  // Default task(s).
  grunt.registerTask('default', ['browserify']);
  grunt.registerTask('dev', ['browserify', 'connect', 'watch'])
  grunt.registerTask('dist', ['browserify','uglify','copy', 'compress']);
};
