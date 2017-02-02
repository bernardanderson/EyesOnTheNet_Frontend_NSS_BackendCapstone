// global.ts
// http://stackoverflow.com/questions/36158848/what-is-the-best-way-to-declare-a-global-variable-in-angular-2-typescript

 export const GlobalVariables = Object.freeze({
     //serverIP: '192.168.56.102:5000', // Laptop
     serverIP: '192.168.0.229:5000'  // PC
     //serverIP: '10.0.0.136:5000'  // NSS Demo Day
     //serverIP: '192.168.0.229'  // PC Through NGINX
     //serverIP: 'api.eyesonthenet.com'   // Production
     //... more of your variables
 });