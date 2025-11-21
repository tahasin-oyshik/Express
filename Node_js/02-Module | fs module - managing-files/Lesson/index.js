// // Module is a set of functions/Methods. (think about js libraries such as Math). 3 types of modules...
// // - Local Modules (own created modules)
// // - Built-in Modules (node.js own modules) – http, url, path, fs, (no need to install)
// // - External modules (managed by npm)

// // importing the built-in file system (fs) module
const fs = require('fs');

// // writeFile is a method inside Node.js’s built-in fs (File System) module.
// // it is used to create or overwrite a file, it works asynchronously and takes a callback function.
fs.writeFile('demo.txt', 'My name is Mr Vulturi', (error) => {
  if (error) {
    console.log(error);
  } else {
    console.log('successful');
  }
});

// fs.appendFile('demo.txt', ' Age 999', (error) => {
//   if (error) {
//     console.log(error);
//   } else {
//     console.log('successful');
//   }
// });

// fs.readFile('demo.txt', 'utf-8', (error, data) => {
//   if (error) {
//     console.log(error);
//   } else {
//     console.log(data);
//   }
// });

// fs.rename('demo.txt', 'test.txt', (error) => {
//   if (error) {
//     console.log(error);
//   } else {
//     console.log('successful');
//   }
// });

// fs.unlink('test.txt', (error) => {
//   if (error) {
//     console.log(error);
//   } else {
//     console.log('successful');
//   }
// });

// fs.exists('test.txt', (result) => {
//   if (result) {
//     console.log('found');
//   } else {
//     console.log('not found');
//   }
// });
