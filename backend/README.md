Important notes since i debuged for a few hours this one.

is important on windows cause it wont hot reload code

```typescript
"watchOptions": {
  "watchFile": "fixedPollingInterval"
}
```

Also important to change default nest npm run start:debug script in order for it to work properly

```
"start:debug": "nest start --debug 0.0.0.0:9229 --watch",
```

## Debugger setup

if docker file work dir is different from `/src` it should also be changed in `.vscode/launch.json`
