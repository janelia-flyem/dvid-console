module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    modernizr: {
      dist:{

        "crawl": false,
        "customTests": [],
        "dest": "js/vendor/modernizr-output.js",
        "tests": [
          "csstransitions",
          "webgl",
          "webglextensions",
          "fetch",
        ],
        "options": [],
        "uglify": true
      }
    },
    browserify: {
      options: {
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
      full: {
        src: 'build/bundle.js',
        dest: 'build/bundle.min.js'
      },
      lite:{
        src: 'build/bundle-lite.js',
        dest: 'build/bundle-lite.min.js'
      }
    },
    copy: {
      dev:{
        files: [
          {
              expand: true,
              cwd: 'node_modules',
              src: 'neuroglancer/*',
              dest: './'
          }
        ]
      },
      full:{
        files: [
          {
            expand: true,
            cwd: 'build/',
            src: '*.min.js',
            flatten: true,
            dest: 'dist/js/'
          },
          {
            expand: true,
            src: 'js/vendor/**',
            dest: 'dist/'
          },
          {
            src: 'css/**',
            dest: 'dist/',
            expand: true
          },
          {
            src: 'fonts/**',
            dest: 'dist/',
            expand: true
          },
          {
            src: 'img/**',
            dest: 'dist/',
            expand: true
          },
          {
              expand: true,
              cwd: 'node_modules',
              src: 'neuroglancer/*',
              dest: 'dist/'
          },
          {
            src: 'dist.html',
            dest: 'dist/index.html'
          }
        ]
      },
      lite: {
        files:[
          {
            expand: true,
            cwd: 'build/',
            src: '*.min.js',
            flatten: true,
            dest: 'lite-dist/js/'
          },
          {
            expand: true,
            src: 'js/vendor/**',
            dest: 'lite-dist/'
          },
          {
            src: 'css/**',
            dest: 'lite-dist/',
            expand: true
          },
          {
            src: 'fonts/**',
            dest: 'lite-dist/',
            expand: true
          },
          {
            src: 'img/**',
            dest: 'lite-dist/',
            expand: true
          },
          {
              expand: true,
              cwd: 'node_modules',
              src: 'neuroglancer/*',
              dest: 'lite-dist'
          },
          {
            src: 'dist-lite.html',
            dest: 'lite-dist/index.html'
          }
        ]
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
  grunt.loadNpmTasks("grunt-modernizr");

  //allow for two different watch targets
  //see http://stackoverflow.com/questions/20841623/grunt-contrib-watch-targets-and-recursion/21744582#21744582
  grunt.loadNpmTasks('grunt-contrib-watch');
  // Rename watch to watchdev and load it again
  grunt.renameTask('watch', 'watchlite');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['modernizr:dist','browserify:full']);
  grunt.registerTask('dev', ['modernizr:dist', 'browserify:full', 'copy:dev', 'connect:full', 'watch'])
  grunt.registerTask('dist', ['modernizr:dist', 'browserify:full','uglify:full','copy:full', 'compress']);
  //lite builds
  grunt.registerTask('dev-lite', ['modernizr:dist', 'browserify:lite', 'copy:dev', 'connect:lite', 'watchlite'])
  grunt.registerTask('dist-lite', ['modernizr:dist', 'browserify:lite','uglify:lite','copy:lite']);
};
