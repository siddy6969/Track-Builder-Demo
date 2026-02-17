# Kart Track Builder

A web-based racing track designer built with React and Canvas 2D. Create custom kart racing tracks with realistic curves, banking, and professional track features.

## Features

- **Node-based Track Design**: Place nodes on a grid to define your track layout
- **Curve Editor**: Apply different turn types (Hairpin, Chicane, Sweeper, etc.) with realistic geometry
- **2D Track Preview**: View your complete track with:
  - Track boundaries and kerbs
  - Racing line visualization
  - Turn markers and labels
  - Start/finish line
- **Export/Import**: Save and load track designs as JSON files

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Track Building Workflow

1. **Configure Grid**: Set up your grid size and track width
2. **Place Nodes**: Click to place track nodes on the grid
3. **Define Curves**: Select nodes and apply turn types with specific characteristics
4. **Preview Track**: View the complete track with all visual elements

## Turn Types

- **Hairpin**: Tight 180° turns
- **Chicane**: Quick left-right or right-left sequences
- **90°**: Standard right-angle corners
- **Sweeper**: Fast, flowing corners
- **Decreasing/Increasing Radius**: Dynamic corner radius
- **Banked/Off-Camber**: Turns with elevation changes

## Controls

- **Scroll**: Zoom in/out
- **Click + Drag**: Pan the view
- **Click Node**: Select for curve editing
