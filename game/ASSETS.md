# 🎮 Carbon Dash - Game Assets Guide

## 📊 Current Status

**The game works perfectly RIGHT NOW with NO external assets!** 

All sprites are generated programmatically using Phaser's Graphics API, so you can play immediately without downloading any images.

---

## 🎨 Sprite Specifications (For Custom Graphics)

If you want to replace the placeholder graphics with custom artwork, here are the specifications:

### 1. **Player Character** (`player.png`)
- **Dimensions**: 32 x 48 pixels
- **Style**: Simple robot or stick figure
- **Colors**: Bright green (#00FF88) with darker accents
- **Transparent background**
- **Animation frames** (optional): 4 frames for running animation

**Free Asset Sources**:
- [Kenney.nl](https://kenney.nl/assets/platformer-pack-redux) - Free platformer sprites
- [OpenGameArt.org](https://opengameart.org/content/platformer-art-pixel-redux) - CC0 pixel art
- [itch.io](https://itch.io/game-assets/free/tag-pixel-art) - Free pixel art packs

---

### 2. **Pollution Obstacle** (`obstacle.png`)
- **Dimensions**: 60 x 40 pixels
- **Style**: Fluffy grey cloud shape
- **Colors**: Dark grey (#666666) with transparency (0.8 alpha)
- **Transparent background**
- **Look**: Menacing, polluted cloud

**Free Asset Sources**:
- [Kenney.nl - Cloud Pack](https://kenney.nl/assets/simple-space)
- Create in: [Piskel](https://www.piskelapp.com/) (free online pixel art editor)

---

### 3. **Energy Orb** (`orb.png`)
- **Dimensions**: 24 x 24 pixels
- **Style**: Glowing green orb
- **Colors**: Bright green (#00FF00) with lighter center (#88FF88)
- **Transparent background**
- **Effect**: Should look collectible and rewarding

**Free Asset Sources**:
- [Kenney.nl - Particle Pack](https://kenney.nl/assets/particle-pack)
- [OpenGameArt - Pickups](https://opengameart.org/content/rpg-items)

---

### 4. **Background Cloud** (`cloud.png`)
- **Dimensions**: 100 x 40 pixels
- **Style**: Fluffy white cloud (friendly, not pollution)
- **Colors**: White (#FFFFFF) with transparency (0.7 alpha)
- **Transparent background**
- **Use**: Parallax background decoration

**Free Asset Sources**:
- [Kenney.nl - Abstract Platformer](https://kenney.nl/assets/abstract-platformer)
- Draw in any image editor

---

### 5. **Ground Texture** (`ground.png`)
- **Dimensions**: 800 x 60 pixels (or tileable 100x60)
- **Style**: Grass/ground platform
- **Colors**: Earthy greens (#228B22, #32CD32)
- **Can be tileable**

**Free Asset Sources**:
- [Kenney.nl - Platformer Pack](https://kenney.nl/assets/platformer-pack-redux)
- [OpenGameArt - Tiles](https://opengameart.org/content/tileable-grass-textures-set-1)

---

## 📂 How to Add Custom Assets

If you create or download custom sprites:

1. **Save images** to: `/workspaces/EcoStellar/game/assets/`

2. **Update `game.js`** - Replace the programmatic sprite generation in `BootScene.preload()`:

```javascript
this.scene.preload = function() {
    // Load custom images instead of generating sprites
    this.load.image('player', 'assets/player.png');
    this.load.image('obstacle', 'assets/obstacle.png');
    this.load.image('orb', 'assets/orb.png');
    this.load.image('cloud', 'assets/cloud.png');
    this.load.image('ground', 'assets/ground.png');
};
```

3. **Remove** or comment out the `create` sprite generation functions

---

## 🎨 Recommended Free Tools

### Image Editors (Pixel Art)
- **[Piskel](https://www.piskelapp.com/)** - Free online pixel art editor (best for beginners!)
- **[Aseprite](https://www.aseprite.org/)** - Professional pixel art tool ($19.99, but worth it)
- **GIMP** - Free general-purpose image editor

### Asset Libraries (100% Free)
- **[Kenney.nl](https://kenney.nl/)** - Massive collection of CC0 (public domain) game assets
- **[OpenGameArt.org](https://opengameart.org/)** - Community-driven free assets
- **[itch.io Game Assets](https://itch.io/game-assets/free)** - Many free and paid packs

---

## 🚀 Quick Start (Current Placeholder Graphics)

**No setup needed!** The game uses these programmatic sprites:

| Asset | Current Implementation | Color |
|-------|----------------------|-------|
| Player | 32x48 green rectangle with circle head | #00FF88 |
| Obstacle | 60x40 grey cloud shape (3 overlapping circles) | #666666 |
| Orb | 24x24 green glowing circle | #00FF00 |
| Cloud | 100x40 white fluffy cloud (3 circles) | #FFFFFF |
| Ground | 800x60 green grass texture | #228B22 |

---

## 🎯 Next Steps

1. **Play the game first** with placeholder graphics
2. **Test all mechanics** work correctly
3. **Then** (optionally) add custom graphics for polish
4. **Connect to blockchain** for real rewards!

---

## 🌟 Pro Tips

- **Keep sprites simple** - Pixel art doesn't need to be complex
- **Use transparent backgrounds** - Save as PNG with alpha channel
- **Test in-game** - Import and test each sprite before finalizing
- **Consistent style** - All sprites should match visually
- **Mobile-friendly** - Keep details visible even when scaled down

---

**The game is fully playable RIGHT NOW!** 🎮

Start by testing with the built-in graphics, then enhance visuals later.
