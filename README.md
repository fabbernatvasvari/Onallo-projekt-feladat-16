# Live Chat App - valós idejű üzenetküldő alkalmazás.
## Használat
A `backend\src`, valamint a `frontend\live-chat-app\src` mappában 
```sh
npm install
```
kiadása, majd 
```
npm run dev
```
vagy VSCode-ban indítás a `package.json`ban található play gombok megnyomásával
vagy a `package.json`ban található parancsok kiadása a terminálban.
## Routes:
http://localhost:3002/

http://localhost:3002/api/register

http://localhost:3002/api/login

http://localhost:3002/api/users

http://localhost:3002/api/messages

http://localhost:3002/api/messages/conversation/:userId

http://localhost:3002/api/messages/thread/:id

http://localhost:3002/api/messages/reply
