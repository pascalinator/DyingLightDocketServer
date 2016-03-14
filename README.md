# DyingLightDocketServer

DyingLightDocketServer is a simple node.js application that acts as a proxy between Dying Light and the Techland game server.

The proxy forwards all requests to the Techland server, except for reward/dockets requests and MOTD requests.  
These requests can be customized by editing the rewards.json and motd.json files.

Originally this started off as an injectable DLL that could modify reward values in memory, but as Techland has improved the dockets functionality  
(and because the DLL would need to be kept up to date with the latest game updates) I decided to create a proxy application instead.  
This should allow the DocketServer to be compatible with all future game updates, provided that the backend communication code stays relatively the same.

Note: this doesn't allow cracked copies to use dockets - the game will still need to auth with the Techland server through the proxy first.

If you're on Windows and looking for a pre-built copy visit the [releases section](https://github.com/emoose/DyingLightDocketServer/releases), but make sure to follow the Setup section below!

Setup
---
First you should probably create a backup of your Dying Light savegame folder ([STEAMDIR]\userdata\\[STEAMID3]\239140)

Now edit your hosts file (C:\Windows\System32\drivers\etc\hosts, or /etc/hosts on linux) and add the following:

127.0.0.1 pls.dyinglightgame.com

This will point the Dying Light server to your local machine. (if you have problems editing the hosts file on Windows [see here for some tips](http://windows7themes.net/en-us/5-ways-modify-windows-hosts-file-access-denied/))

Once that's done you can run the docket server by opening the exe, or if you have node installed by executing "node proxy.js"

Usage
---
The server will forward all requests made to it to the official Dying Light server - except for MOTD and rewards (dockets) requests.  
These requests can be modified with the provided json files. Examples are included which give you 999 of each of the usable dockets. An example MOTD is also included.

Modding
---
The proxy.js file contains a list of every docket ID in the game, however most of them are unnamed and unused by the game, hence aren't included in the default rewards.json.  
In the future if these docket IDs become used you can easily add them to the rewards.json file by copying the line for it over from proxy.js

VAC
---
I'm unsure how VAC would handle the DocketServer, as it never actually modifies the game itself - rather this is a sort of side-channel modification which modifies the game servers responses instead.

However from my knowledge VAC is mostly a blacklist system and uses signatures to identify game cheats, so it's possible that the DyingLightDocketServer.exe application could eventually be added as a bannable cheat to the VAC system.

If in doubt you should probably install node.js and run the proxy.js file using node, instead of running the included DyingLightDocketServer.exe, as it's very unlikely the node.js application would be blacklisted (thousands of applications rely on it, the majority being non-game-related)

Of course you should also make sure that VAC secure mode is disabled in your Dying Light online settings before using the DocketServer.

Compatibility
---
The docket server should be compatible with both Windows and Linux versions of the game, however so far I've only tested this with Dying Light 1.11.0 on Windows.

If any Linux users try it out and have any problems don't hesitate to make an entry in the issue tracker.