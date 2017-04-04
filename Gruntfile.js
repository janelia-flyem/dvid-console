module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    browserify: {
      options: {
        //transform:  [ require('grunt-react').browserify ]
        transform:  [ "babelify" ]
      },
      full:          {
        src:        'js/app.js',
        dest:       'build/bundle.js'
      },
      lite:          {
        src:        'js/lite-main.js',
        dest:       'build/bundle-lite.js'
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
    watchlite: {
      scripts: {
        files: ['js/**/*.js', 'css/app.css'],
        tasks: ['browserify:lite']
      }
    },
    watch: {
      scripts: {
        files: ['js/**/*.js', 'css/app.css'],
        tasks: ['browserify:full']
      }
    },
    connect: {
      full: {
        options: {
          port: 8500,
          base:  {
                path: '.',
                options: {
                  index: 'index.html'
                }
          }
        }
      },
      lite: {
        options: {
          port: 8500,
          base:  {
                path: '.',
                options: {
                  index: 'index-lite.html'
                }
          }
        }
      }
    },
  });

  // Load the plugins
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-connect');

  //allow for two different watch targets
  //see http://stackoverflow.com/questions/20841623/grunt-contrib-watch-targets-and-recursion/21744582#21744582
  grunt.loadNpmTasks('grunt-contrib-watch');
  // Rename watch to watchdev and load it again
  grunt.renameTask('watch', 'watchlite');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['browserify:full']);
  grunt.registerTask('dev', ['browserify:full', 'connect:full', 'watch'])
  grunt.registerTask('dist', ['browserify:full','uglify','copy', 'compress']);
  //lite builds
  grunt.registerTask('dev-lite', ['browserify:lite', 'connect:lite', 'watchlite'])
  // grunt.registerTask('dist-lite', ['browserify','uglify','copy', 'compress']);
};
