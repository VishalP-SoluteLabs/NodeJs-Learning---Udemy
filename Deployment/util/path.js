const path = require('path');

module.exports = path.dirname(require.main.filename);   // this will set path to mainModule (app.js) from where our app is being started,
                                                             // then file name to find out in which file, this module was launched up

                                                             //We could also use 'process.mainModule.filename' but its value of mainModule can change 
                                                            // at runtime so use 'require.main' instead which will only refer to the original one